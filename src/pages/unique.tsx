import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload, X, Check, MessageCircle, Sparkles, ArrowRight,
  Camera, PenTool, Image as ImageIcon, ShoppingBag, Crown
} from 'lucide-react';
import { ProductType, CustomElement, UserDesign } from '../types';
import { saveDesign } from '../firebase';

interface UniqueProps {
  onOrderSuccess: (orderId: string) => void;
  onBackToCategories?: () => void;
}

// Numéro WhatsApp de l'atelier
const WHATSAPP_NUMBER = '2250504272827';

// Prix du pack premium
const PREMIUM_PRICE = 15000;

export default function Unique({ onOrderSuccess, onBackToCategories }: UniqueProps) {
  const [mode, setMode] = useState<'photo' | 'description' | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [productName, setProductName] = useState('');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [step, setStep] = useState<'choose' | 'details' | 'confirm'>('choose');
  const [savingStatus, setSavingStatus] = useState(false);
  const [designSaved, setDesignSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gestion des images uploadées
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newImages.push(event.target.result as string);
          if (newImages.length === files.length) {
            setUploadedImages(prev => [...prev, ...newImages]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setSavingStatus(true);
    try {
      // Créer un design unique
      const designPayload: UserDesign = {
        productType: 'unique' as ProductType,
        color: color || 'Personnalisé',
        elements: [
          {
            id: `unique-${Date.now()}`,
            type: 'text',
            content: description || 'Pièce unique',
            x: 30,
            y: 35,
            size: 24,
            color: '#111111',
            font: 'Space Grotesk',
            rotation: 0,
            side: 'front'
          }
        ],
        creatorName: 'Membre DjassaClub',
        creatorEmail: 'club@djassa.net',
        upvotes: 0,
        isPublic: true,
        createdAt: Date.now()
      };
      
      await saveDesign(designPayload);
      setDesignSaved(true);
      setStep('confirm');
      setTimeout(() => setDesignSaved(false), 4000);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement.");
    } finally {
      setSavingStatus(false);
    }
  };

  // Lien WhatsApp avec les infos
  const getWhatsAppMessage = () => {
    let message = `🆕 *DEMANDE PIÈCE UNIQUE - PACK PREMIUM* 👑\n\n`;
    message += `💰 *Prix:* ${PREMIUM_PRICE.toLocaleString('fr-FR')} FCFA\n\n`;
    
    if (mode === 'photo') {
      message += `📸 *Mode:* Photo du modèle\n`;
      message += `📷 *Photos fournies:* ${uploadedImages.length}\n`;
    } else {
      message += `✍️ *Mode:* Description personnalisée\n`;
      message += `📝 *Description:* ${description || 'Non spécifiée'}\n`;
    }
    
    if (productName) message += `🏷️ *Nom du produit:* ${productName}\n`;
    if (color) message += `🎨 *Couleur souhaitée:* ${color}\n`;
    if (size) message += `📏 *Taille:* ${size}\n`;
    
    message += `\n⏰ *Date:* ${new Date().toLocaleString('fr-FR')}\n`;
    message += `\n---\n*Merci de me recontacter pour finaliser cette création unique !*`;
    
    return encodeURIComponent(message);
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${getWhatsAppMessage()}`;
    window.open(url, '_blank');
  };

  // Si on est en mode confirmation
  if (step === 'confirm') {
    return (
      <div className="min-h-screen bg-white py-20 px-4 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">
            Demande envoyée ! 🎉
          </h2>
          <p className="text-gray-500 mb-8">
            Notre équipe va étudier votre demande et vous recontactera dans les plus brefs délais pour finaliser votre pièce unique.
          </p>
          <button
            onClick={onBackToCategories}
            className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition"
          >
            Retour aux produits
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-yellow-500/20 to-yellow-400/10 border border-yellow-300/30 text-yellow-700 text-[10px] font-bold uppercase tracking-[0.25em] mb-5">
            <Crown className="w-3 h-3" />
            Pack Premium
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900">
            Créez votre pièce <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-yellow-600 to-yellow-400 bg-clip-text text-transparent">vraiment unique</span>
          </h1>
          <p className="text-gray-500 mt-4 max-w-lg mx-auto">
            Pas de modèle standard ? Pas de souci ! Uploader votre propre modèle ou décrivez-nous votre idée.
          </p>
          <div className="inline-block mt-4 bg-yellow-50 border border-yellow-200 rounded-full px-6 py-2">
            <span className="text-sm font-bold text-yellow-700">
              {PREMIUM_PRICE.toLocaleString('fr-FR')} FCFA
            </span>
            <span className="text-xs text-yellow-500 ml-2">— Création sur-mesure</span>
          </div>
        </div>

        {/* MODE DE SELECTION */}
        {mode === null && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <motion.button
              whileHover={{ y: -4, scale: 1.02 }}
              onClick={() => setMode('photo')}
              className="bg-gray-50 border-2 border-gray-200 hover:border-yellow-400 rounded-3xl p-8 text-center transition-all"
            >
              <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">J'ai une photo</h3>
              <p className="text-sm text-gray-500 mt-2">
                Uploader la photo de votre modèle et on s'occupe du reste
              </p>
            </motion.button>

            <motion.button
              whileHover={{ y: -4, scale: 1.02 }}
              onClick={() => setMode('description')}
              className="bg-gray-50 border-2 border-gray-200 hover:border-yellow-400 rounded-3xl p-8 text-center transition-all"
            >
              <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                <PenTool className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">Je décris mon idée</h3>
              <p className="text-sm text-gray-500 mt-2">
                Décrivez ce que vous voulez, on vous crée un modèle unique
              </p>
            </motion.button>
          </div>
        )}

        {/* MODE PHOTO */}
        {mode === 'photo' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <button
              onClick={() => setMode(null)}
              className="text-sm text-gray-400 hover:text-gray-700 flex items-center gap-1"
            >
              ← Retour
            </button>

            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-3xl p-12 text-center cursor-pointer hover:border-yellow-400 transition group"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4 group-hover:text-yellow-500 transition" />
              <p className="text-sm font-medium text-gray-600 group-hover:text-yellow-600 transition">
                Cliquez pour uploader votre modèle
              </p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG - Max 10MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {uploadedImages.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Vos photos ({uploadedImages.length})</p>
                <div className="grid grid-cols-3 gap-3">
                  {uploadedImages.map((img, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200">
                      <img src={img} alt={`Modèle ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Détails supplémentaires */}
            <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
              <h4 className="font-semibold text-gray-900">Informations complémentaires</h4>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Nom du produit (optionnel)</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Ex: Mon T-Shirt Unique"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Couleur souhaitée</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="Ex: Noir, Rouge..."
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Taille</label>
                  <input
                    type="text"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="Ex: M, L, XL..."
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-400"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={uploadedImages.length === 0 || savingStatus}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 text-white py-4 rounded-2xl font-bold text-sm hover:from-yellow-600 hover:to-yellow-500 transition disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/25"
            >
              {savingStatus ? 'Envoi en cours...' : `Envoyer ma demande - ${PREMIUM_PRICE.toLocaleString('fr-FR')} FCFA`}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* MODE DESCRIPTION */}
        {mode === 'description' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <button
              onClick={() => setMode(null)}
              className="text-sm text-gray-400 hover:text-gray-700 flex items-center gap-1"
            >
              ← Retour
            </button>

            <div className="bg-gray-50 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <PenTool className="w-6 h-6 text-yellow-600" />
                <h3 className="font-bold text-gray-900">Décrivez votre idée</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Décrivez-nous ce que vous voulez créer. Soyez le plus précis possible :
                type de vêtement, coupe, couleurs, motifs, texte, etc.
              </p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Je veux un T-Shirt oversize noir avec un grand logo doré sur le devant, et une phrase en dessous..."
                rows={6}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-400 resize-none"
              />
            </div>

            {/* Détails supplémentaires */}
            <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
              <h4 className="font-semibold text-gray-900">Informations complémentaires</h4>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Nom du produit (optionnel)</label>
                <input
  type="text"
  value={productName}
  onChange={(e) => setProductName(e.target.value)}
  placeholder="Ex: Mon Projet Unique"
  className="
    w-full 
    bg-white 
    text-gray-900
    placeholder:text-gray-400
    border border-gray-200 
    rounded-xl 
    px-4 py-2.5 
    text-sm
    focus:outline-none 
    focus:border-yellow-400
  "
/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Couleur souhaitée</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="Ex: Noir, Rouge..."
className="w-full bg-white text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Taille</label>
                  <input
                    type="text"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="Ex: M, L, XL..."
className="w-full bg-white text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!description.trim() || savingStatus}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 text-white py-4 rounded-2xl font-bold text-sm hover:from-yellow-600 hover:to-yellow-500 transition disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/25"
            >
              {savingStatus ? 'Envoi en cours...' : `Envoyer ma demande - ${PREMIUM_PRICE.toLocaleString('fr-FR')} FCFA`}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TOAST */}
        <AnimatePresence>
          {designSaved && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-6 right-6 bg-black text-white px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3"
            >
              <span className="text-green-400 text-xl">✓</span>
              <div>
                <p className="font-bold text-sm">Demande envoyée !</p>
                <p className="text-xs text-gray-400">Notre équipe vous recontacte.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BANDEAU PREMIUM EN BAS */}
        <div className="mt-12 text-center border-t border-yellow-100 pt-8">
          <div className="flex items-center justify-center gap-2 text-xs text-yellow-600">
            <Crown className="w-3 h-3" />
            <span>Pack Premium — Création sur-mesure</span>
            <span className="w-px h-4 bg-yellow-200" />
            <span className="font-bold">{PREMIUM_PRICE.toLocaleString('fr-FR')} FCFA</span>
          </div>
        </div>
      </div>
    </div>
  );
}