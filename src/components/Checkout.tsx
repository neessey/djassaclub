import React, { useState, useEffect } from 'react';
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

  // Numéro WhatsApp du vendeur (à remplacer par le vrai numéro)
  const VENDOR_PHONE = "2250504272827"; // Format international sans le +

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

  const handleStartPayment = async () => {
    setLoading(true);

    try {
      const generatedOrderId = `DJASSA-${Math.floor(100000 + Math.random() * 900000)}`;

      const payload = {
        id: generatedOrderId,
        design: {
          productType,
          color,
          elements,
          customizationMode,
              size: null

        },
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
      
      setFirestoreId(docId);
      setOrderId(generatedOrderId);

      const paymentUrl = PAYMENT_LINKS[paymentMethod].url;
      window.open(paymentUrl, "_blank");

      setStep("processing");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la création du paiement");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour envoyer le message WhatsApp au vendeur
 const getWhatsAppLink = () => {
  const message = `*NOUVELLE COMMANDE DJASSA CLUB*

 Commande : ${orderId}

Client : ${name}
Téléphone : ${phone}
Email : ${email}

Produit : ${productType.toUpperCase()}
Couleur : ${color}
Produit : ${productType.toUpperCase()}
${size ? `Taille : ${size}` : ''}
Couleur : ${color}
Montant : ${price.toLocaleString("fr-FR")} FCFA

Ville : ${city}
Adresse : ${address}

Paiement : ${paymentMethod.toUpperCase()}
Numéro paiement : ${paymentPhone || "-"}

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
              PRODUIT: {productType.toUpperCase()} • MODE: {customizationMode.toUpperCase()} • BASE: {color}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-1.5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
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
            <div className="space-y-5">
              <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest block">
                2. SÉLECTIONNER UN MODE DE PAIEMENT
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('wave')}
                  className={`border rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                    paymentMethod === 'wave'
                      ? 'border-red-200 bg-red-50 text-gray-900'
                      : 'border-gray-200 bg-white text-gray-400 hover:border-red-100 hover:bg-red-50'
                  }`}
                >
                  <img src="/assets/wave.jpg" className="w-10 h-10 object-contain" alt="Wave" />
                  <span className="text-xs font-bold uppercase tracking-tight">Wave Mobile Money</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('mtn')}
                  className={`border rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                    paymentMethod === 'mtn'
                      ? 'border-red-200 bg-red-50 text-gray-900'
                      : 'border-gray-200 bg-white text-gray-400 hover:border-red-100 hover:bg-red-50'
                  }`}
                >
                  <img src="/assets/MTN.jpg" className="w-10 h-10 object-contain" alt="MTN" />
                  <span className="text-xs font-bold uppercase tracking-tight">MTN MoMo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('orange')}
                  className={`border rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                    paymentMethod === 'orange'
                      ? 'border-red-200 bg-red-50 text-gray-900'
                      : 'border-gray-200 bg-white text-gray-400 hover:border-red-100 hover:bg-red-50'
                  }`}
                >
                  <img src="/assets/orange.jpg" className="w-10 h-10 object-contain" alt="Orange" />
                  <span className="text-xs font-bold uppercase tracking-tight">Orange Money</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`border rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                    paymentMethod === 'card'
                      ? 'border-red-200 bg-red-50 text-gray-900'
                      : 'border-gray-200 bg-white text-gray-400 hover:border-red-100 hover:bg-red-50'
                  }`}
                >
                  <img src="/assets/card.jpg" className="w-10 h-10 object-contain" alt="Carte" />
                  <span className="text-xs font-bold uppercase tracking-tight">Carte Bancaire</span>
                </button>
              </div>

              {paymentMethod !== 'card' && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-[10px] font-bold text-gray-400 block">Numéro de Téléphone {paymentMethod.toUpperCase()}</label>
                  <input
                    type="tel"
                    required
                    value={paymentPhone}
                    onChange={(e) => setPaymentPhone(e.target.value)}
                    placeholder="Ex: 07 00 00 00 00"
                    className="w-full bg-gray-50 border border-red-100 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-red-200 transition placeholder:text-gray-400"
                  />
                  <p className="text-[10px] text-gray-400 font-bold leading-relaxed">
                    Une demande de débit Push instantanée sera envoyée sur ce numéro de téléphone.
                  </p>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="space-y-3 animate-fade-in bg-gray-50 border border-red-100 p-4 rounded-xl">
                  <div className="text-xs font-bold text-gray-400 mb-1 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-red-300" />
                    PAIEMENT CARTE SÉCURISÉ
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Numéro de Carte (Simulé)"
                      className="w-full bg-white border border-red-100 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-red-200 transition"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="MM/AA"
                      className="w-full bg-white border border-red-100 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-red-200 transition"
                    />
                    <input
                      type="text"
                      placeholder="CVV"
                      className="w-full bg-white border border-red-100 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-red-200 transition"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-500 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  Retour
                </button>
                <button
                  type="button"
                  onClick={handleStartPayment}
                  disabled={loading || (paymentMethod !== 'card' && !paymentPhone)}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-400 border border-red-200 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Payer {price.toLocaleString('fr-FR')} FCFA
                    </>
                  )}
                </button>
              </div>
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