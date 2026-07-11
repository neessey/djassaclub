import React, { useState, useEffect, useRef } from 'react';
import { X, CreditCard, Landmark, CheckCircle, ArrowRight, ShieldCheck, PhoneCall, Loader2 } from 'lucide-react';
import { ProductType, CustomElement } from '../types';
import { createOrder, updateOrderPayment } from '../firebase';
import { PAYMENT_LINKS } from "../payments";

interface CheckoutProps {
  productType: ProductType;
  color: string;
  elements: CustomElement[];
  price: number;
  customizationMode: 'standard' | 'premium';
  onClose: () => void;
  onOrderSuccess: (orderId: string) => void;
  size?: string
}

export default function Checkout({
  productType,
  color,
  elements,
  price,
  customizationMode,
  size,
  onClose,
  onOrderSuccess
}: CheckoutProps)
{
  const [step, setStep] = useState<'details' | 'payment' | 'processing' | 'success'>('details');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [firestoreId, setFirestoreId] = useState('');
  
  // Client info
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  
  // Payment info
  const [paymentMethod, setPaymentMethod] = useState<'wave' | 'mtn' | 'orange' | 'card'>('wave');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [countdown, setCountdown] = useState(25);

  // Map complet des couleurs avec leurs noms en français
  const COLOR_NAMES: Record<string, string> = {
    // Noirs et gris
    '#111111': 'Noir',
    '#1a1a1a': 'Noir profond',
    '#2d2d2d': 'Gris anthracite',
    '#333333': 'Gris foncé',
    '#4a4a4a': 'Gris moyen',
    '#666666': 'Gris',
    '#888888': 'Gris clair',
    '#aaaaaa': 'Gris perle',
    
    // Blancs et écrus
    '#F8F8F8': 'Blanc',
    '#ffffff': 'Blanc pur',
    '#f5f5f5': 'Blanc cassé',
    '#fafafa': 'Blanc ivoire',
    '#F2E8D5': 'Ecru',
    '#f0e6d3': 'Beige clair',
    '#e8dcc8': 'Crème',
    '#BDB76B': 'Kaki',
    
    // Supplément pour les couleurs hexadécimales à 6 chiffres
    '#000000': 'Noir pur',
    '#FFFFFF': 'Blanc pur',
    '#FF0000': 'Rouge',
    '#00FF00': 'Vert',
    '#0000FF': 'Bleu',
    '#FFFF00': 'Jaune',
    '#FF00FF': 'Magenta',
    '#00FFFF': 'Cyan',
  };

  const getColorName = (hexColor: string): string => {
    if (!hexColor) return 'Couleur non définie';
    const cleanColor = hexColor.trim();
    
    if (COLOR_NAMES[cleanColor]) {
      return COLOR_NAMES[cleanColor];
    }
    
    const lowerColor = cleanColor.toLowerCase();
    if (COLOR_NAMES[lowerColor]) {
      return COLOR_NAMES[lowerColor];
    }
    
    const colorNamesMap: Record<string, string> = {
      'black': 'Noir',
      'white': 'Blanc',
      'gray': 'Gris',
      'ecru': 'Ecru',
      'kaki': 'Kaki',
    };
    
    return hexColor;
  };

  // Obtenir le nom de la couleur pour l'affichage
  const colorName = getColorName(color);

  // Numéro WhatsApp du vendeur
  const VENDOR_PHONE = "2250504272827";

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'processing') {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handlePaymentSuccess();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step]);

  const handleSubmitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const isProcessingRef = useRef(false);

const handleStartPayment = async () => {
  console.log('[PAYMENT] Clic reçu, isProcessing:', isProcessingRef.current);
  if (isProcessingRef.current) {
    console.log('[PAYMENT] Bloqué par le ref, sortie');
    return;
  }
  isProcessingRef.current = true;
  setLoading(true);

  console.log('[PAYMENT] Tentative ouverture fenêtre...');
  const paymentWindow = window.open('', '_blank');
  console.log('[PAYMENT] paymentWindow =', paymentWindow); // null si bloqué

  try {
    const generatedOrderId = `DJASSA-${Math.floor(100000 + Math.random() * 900000)}`;
    console.log('[PAYMENT] Création commande Firestore...');

    const payload = {
      id: generatedOrderId,
      design: { productType, color, elements, customizationMode, size: null },
      quantity: 1,
      totalAmount: price,
      clientName: name,
      clientPhone: phone,
      clientEmail: email,
      clientCity: city,
      clientAddress: address,
      paymentMethod,
      paymentPhone: paymentMethod !== "card" ? paymentPhone : "",
      paymentStatus: "pending"
    };

    const docId = await createOrder(payload);
    console.log('[PAYMENT] Commande créée, docId:', docId);

    setFirestoreId(docId);
    setOrderId(generatedOrderId);

    const paymentUrl = PAYMENT_LINKS[paymentMethod].url;
    console.log('[PAYMENT] URL à ouvrir:', paymentUrl);

    if (paymentWindow) {
      paymentWindow.location.href = paymentUrl;
      console.log('[PAYMENT] Redirection fenêtre effectuée');
    } else {
      console.log('[PAYMENT] Fenêtre nulle, fallback même onglet');
      window.location.href = paymentUrl;
    }

    setStep("processing");
  } catch (err) {
    console.error('[PAYMENT] ERREUR:', err);
    if (paymentWindow) paymentWindow.close();
    alert("Erreur lors de la création du paiement");
  } finally {
    setLoading(false);
    isProcessingRef.current = false;
  }
};

  // Fonction pour envoyer le message WhatsApp au vendeur - AVEC LE NOM DE LA COULEUR
  const getWhatsAppLink = () => {
  // on récupère toutes les URLs photo (type 'logo') liées à la commande
  const photoUrls = elements
    .filter(el => el.type === 'logo')
    .map(el => el.content)
    .join('\n');

  const message = `*NOUVELLE COMMANDE DJASSA CLUB*

 Commande : ${orderId}

Client : ${name}
Téléphone : ${phone}
Email : ${email}

Produit : ${productType.toUpperCase()}
Couleur : ${colorName}
${size ? `Taille : ${size}` : ''}
Montant : ${price.toLocaleString("fr-FR")} FCFA

Ville : ${city}
Adresse : ${address}

Paiement : ${paymentMethod.toUpperCase()}
Numéro paiement : ${paymentPhone || "-"}

📸 Photo(s) du client :
${photoUrls || "Aucune photo jointe"}

Merci.`;

  return `https://wa.me/${VENDOR_PHONE}?text=${encodeURIComponent(message)}`;
};

  const handlePaymentSuccess = async () => {
    try {
      if (firestoreId) {
        await updateOrderPayment(firestoreId, "success");
      }
      setStep("success");
    } catch (err) {
      console.error(err);
      setStep("success");
    }
  };

  return (
    <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-red-100 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col relative max-h-[90vh] shadow-xl">
        
        {/* Header */}
        <div className="border-b border-red-100 px-6 py-4 flex items-center justify-between bg-white">
          <div>
            <h3 className="font-bold text-lg text-gray-900 uppercase tracking-tight">
              Finaliser ma création
            </h3>
            <p className="text-xs text-gray-400 font-bold">
              PRODUIT: {productType.toUpperCase()} • MODE: {customizationMode.toUpperCase()} 
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-1.5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Aperçu de la couleur - affichage du NOM de la couleur */}
        <div className="px-6 py-3 bg-gray-50 border-b border-red-100 flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-full border-2 border-gray-200 flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase">Couleur choisie :</span>
            <span className="text-sm font-semibold text-gray-900 ml-2">{colorName}</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-white">
          {step === 'details' && (
            <form onSubmit={handleSubmitDetails} className="space-y-4">
              <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2 block">
                1. INFORMATIONS DE LIVRAISON
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Prénom & Nom</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Jean Kouadio"
                    className="w-full bg-gray-50 border border-red-100 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-red-200 transition"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Téléphone de contact</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: +225 07..."
                    className="w-full bg-gray-50 border border-red-100 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-red-200 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full bg-gray-50 border border-red-100 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-red-200 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Ville / Pays</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ex: Abidjan, Côte d'Ivoire"
                    className="w-full bg-gray-50 border border-red-100 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-red-200 transition"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Adresse de livraison</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Cocody, Cité des arts..."
                    className="w-full bg-gray-50 border border-red-100 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-red-200 transition"
                  />
                </div>
              </div>

              <div className="bg-gray-50 border border-red-100 rounded-xl p-4 flex justify-between items-center mt-6">
                <span className="text-xs text-gray-400 font-bold uppercase">Total à payer</span>
                <span className="text-2xl font-bold text-gray-900 tracking-tight">{price.toLocaleString('fr-FR')} FCFA</span>
              </div>

              <button
                type="submit"
                className="w-full bg-red-50 hover:bg-red-100 text-red-400 border border-red-200 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                Passer au paiement
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {step === 'payment' && (
            <div className="space-y-6">
              {/* Header avec icône */}
              <div className="flex items-center gap-3 pb-3 border-b border-red-100">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                  <img src="/assets/wave.jpg" className="w-6 h-6 object-contain" alt="Wave" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest">
                    Paiement sécurisé
                  </h4>
                  <p className="text-[10px] text-gray-400">
                    Wave — Paiement instantané
                  </p>
                </div>
              </div>

              {/* Carte Wave améliorée */}
              <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <img src="/assets/wave.jpg" className="w-10 h-10 object-contain" alt="Wave" />
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900">Wave Mobile Money</h5>
                    <p className="text-xs text-gray-500">Paiement mobile sécurisé</p>
                  </div>
                  <div className="ml-auto">
                    <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">
                      ✓ Instantané
                    </span>
                  </div>
                </div>

                {/* Numéro de téléphone */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-gray-500 block">
                    Numéro Wave Mobile Money
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-mono">
                      +225
                    </div>
                    <input
                      type="tel"
                      required
                      value={paymentPhone}
                      onChange={(e) => setPaymentPhone(e.target.value)}
                      placeholder="07 00 00 00 00"
                      className="w-full bg-white border border-gray-200 rounded-xl pl-14 pr-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Prix et récapitulatif */}
                <div className="mt-4 pt-4 border-t border-blue-100">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Montant à payer</span>
                    <span className="font-bold text-gray-900 text-lg">
                      {price.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1">
                    <span>Frais de transaction</span>
                    <span>Inclus</span>
                  </div>
                </div>
              </div>

              {/* Sécurité et confiance */}
              <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700">Paiement sécurisé</p>
                  <p className="text-[9px] text-gray-400">Transaction cryptée de bout en bout</p>
                </div>
                <div className="ml-auto text-[9px] text-gray-400 font-mono">
                  🔒 SSL
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-500 py-3.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  Retour
                </button>
                <button
                  type="button"
                  onClick={handleStartPayment}
                  disabled={loading || !paymentPhone}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <img src="/assets/wave.jpg" className="w-4 h-4 object-contain brightness-0 invert" alt="Wave" />
                      Payer {price.toLocaleString('fr-FR')} FCFA
                    </>
                  )}
                </button>
              </div>

              <p className="text-[9px] text-center text-gray-400 font-mono">
                En cliquant sur "Payer", vous acceptez les conditions d'utilisation
              </p>
            </div>
          )}

          {step === 'processing' && (
            <div className="py-8 text-center flex flex-col items-center justify-center space-y-6">
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-2 border-red-200 border-t-red-400 animate-spin" />
                <PhoneCall className="w-6 h-6 text-red-400 absolute animate-bounce" />
              </div>

              <div>
                <h4 className="font-bold text-lg text-gray-900 uppercase tracking-tight mb-2">
                  Validation en cours...
                </h4>
                <p className="text-sm text-gray-400 max-w-sm mx-auto">
                  Une nouvelle fenêtre a été ouverte pour effectuer votre paiement via{" "}
                  <strong className="text-gray-900">{paymentMethod.toUpperCase()}</strong>.
                  Après validation, votre commande sera confirmée.
                </p>
              </div>

              <div className="bg-gray-50 border border-red-100 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400">
                TEMPS RESTANT: <strong className="text-red-400">{countdown} SEC</strong>
              </div>

              <div className="text-[10px] font-bold text-gray-400">
                NE FERMEZ PAS CETTE FENÊTRE. LE SYSTÈME SE RECHARGE AUTOMATIQUEMENT.
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-8 text-center flex flex-col items-center justify-center space-y-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>

              <div>
                <h4 className="font-bold text-2xl text-gray-900 uppercase tracking-tight mb-2">
                  Création validée !
                </h4>
                <p className="text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">
                  Félicitations <strong className="text-gray-900">{name}</strong> ! Votre commande a été enregistrée avec succès. Notre atelier lance immédiatement sa fabrication.
                </p>
              </div>

              <div className="bg-gray-50 border border-red-100 rounded-xl p-4 w-full text-center space-y-2">
                <span className="text-xs text-gray-400 uppercase font-bold block">Votre commande est en cours de traitement</span>
                <span className="text-xl font-bold font-bold text-red-400 tracking-wider block">{orderId}</span>
                {/* Affichage de la couleur avec son NOM */}
                <div className="flex items-center justify-center gap-2 pt-2 border-t border-red-100">
                  <span className="text-[10px] text-gray-400">Couleur :</span>
                  <span className="text-xs font-semibold text-gray-900">{colorName}</span>
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-200"
                    style={{ backgroundColor: color }}
                  />
                </div>
                <p className="text-[10px] text-gray-400 leading-normal pt-1 border-t border-red-100">
                  La livraison est au frais du client, et le suivi de votre commande est disponible via WhatsApp.
                </p>
              </div>

              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
              >
                <PhoneCall className="w-5 h-5" />
                Envoyer la commande sur WhatsApp
              </a>

              <button
                type="button"
                onClick={() => {
                  onClose();
                }}
                className="w-full bg-red-50 hover:bg-red-100 text-red-400 border border-red-200 py-3 rounded-xl font-bold transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}