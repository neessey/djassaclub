export type ProductType = 't-shirt' | 'hoodie' | 'sweat' | 'cap' | 'tote-bag' | 'magazine' | 'frame';

export interface ProductColor {
  name: string;
  hex: string;
}

export type ElementType = 'text' | 'logo' | 'emoji' | 'qr' | 'signature';

export interface CustomElement {
  id: string;
  type: ElementType;
  content: string; // text string, emoji character, image URL/base64, or signature base64
  x: number; // percentage from left (0 to 100)
  y: number; // percentage from top (0 to 100)
  size: number; // width or font-size
  color?: string; // hex color for text
  font?: string; // font family name
  rotation: number; // degrees
  side: 'front' | 'back' | 'outside' | 'inside'; // active surface side
}

export interface ProductTemplate {
  type: ProductType;
  name: string;
  basePrice: number;
  description: string;
  colors: ProductColor[];
  defaultColor: string;
  sides: ('front' | 'back' | 'outside' | 'inside')[];
}

export interface UserDesign {
  id?: string;
  productType: ProductType;
  color: string;
  elements: CustomElement[];
  creatorName: string;
  creatorEmail: string;
  upvotes: number;
  isPublic: boolean;
  createdAt: number;
  imageUrl?: string; // Generated mockup or base64
}

export type TrackingStatus = 'pending_fabrication' | 'printing' | 'quality_check' | 'shipping' | 'delivered';

export interface Order {
  id: string;
  design: {
    productType: ProductType;
    color: string;
    elements: CustomElement[];
  };
  quantity: number;
  totalAmount: number;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  clientCity: string;
  paymentMethod: 'wave' | 'mtn' | 'orange' | 'card';
  paymentPhone?: string; // For mobile money
  paymentStatus: 'pending' | 'success' | 'failed';
  trackingStatus: TrackingStatus;
  createdAt: number;
}
