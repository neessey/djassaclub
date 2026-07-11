import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, getDoc, doc, setDoc, updateDoc, query, orderBy, limit, where, runTransaction } from 'firebase/firestore';
import { Order, UserDesign } from './types';

const firebaseConfig = {
  apiKey: "AIzaSyDa9J-46sqyPL8fSTYUBb605UIkICDPzCM",
  authDomain: "djassaclub-c18b5.firebaseapp.com",
  projectId: "djassaclub-c18b5",
  storageBucket: "djassaclub-c18b5.firebasestorage.app",
  messagingSenderId: "844763380926",
  appId: "1:844763380926:web:0a4d9a897920331337b2ef"
};

const app = initializeApp(firebaseConfig);

// Use specific database ID if provided
const firestoreDatabaseId = "(default)";
export const db = getFirestore(app, firestoreDatabaseId);
export const auth = getAuth(app);

// Collection References
export const designsCollection = collection(db, 'designs');
export const ordersCollection = collection(db, 'orders');

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Save a custom design created by a user
 */
export async function saveDesign(design: UserDesign): Promise<string> {
  const path = 'designs';
  try {
    const docRef = await addDoc(designsCollection, {
      ...design,
      createdAt: Date.now()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

/**
 * Fetch public user designs
 */
export async function getPublicDesigns(maxCount: number = 24): Promise<UserDesign[]> {
  const path = 'designs';
  try {
    const q = query(designsCollection, where("isPublic", "==", true), orderBy("createdAt", "desc"), limit(maxCount));
    const querySnapshot = await getDocs(q);
    const designs: UserDesign[] = [];
    querySnapshot.forEach((doc) => {
      designs.push({ id: doc.id, ...doc.data() } as UserDesign);
    });
    return designs;
  } catch (error) {
    // If permission or other error, let's log with handler and return empty
    try {
      handleFirestoreError(error, OperationType.GET, path);
    } catch (e) {
      console.error("Gracefully caught public design error:", e);
    }
    return [];
  }
}

/**
 * Upvote a design
 */
export async function upvoteDesign(designId: string): Promise<number> {
  const path = `designs/${designId}`;
  const designRef = doc(db, 'designs', designId);
  try {
    let newUpvotes = 1;
    await runTransaction(db, async (transaction) => {
      const sfDoc = await transaction.get(designRef);
      if (!sfDoc.exists()) {
        throw new Error("Document does not exist!");
      }
      newUpvotes = (sfDoc.data().upvotes || 0) + 1;
      transaction.update(designRef, { upvotes: newUpvotes });
    });
    return newUpvotes;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

/**
 * Create a new customer order
 */
export async function createOrder(
  order: Omit<Order, "createdAt" | "trackingStatus" | "paymentStatus">
): Promise<string> {

  const orderData: Order = {
    ...order,
    paymentStatus: "pending",
    trackingStatus: "pending_fabrication",
    createdAt: Date.now(),
  };

  const docRef = doc(db, "orders", order.id);

  await setDoc(docRef, orderData);

  return order.id;
}

/**
 * Get an order by ID (for live tracking)
 */
export async function getOrder(orderId: string): Promise<Order | null> {
  const path = `orders/${orderId}`;
  try {
    const docRef = doc(db, 'orders', orderId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Order;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    throw error;
  }
}

/**
 * Update payment status (e.g. after mobile money simulation completes)
 */
export async function updateOrderPayment(orderId: string, status: 'success' | 'failed'): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, {
      paymentStatus: status,
      trackingStatus: status === 'success' ? 'printing' : 'pending_fabrication'
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}
