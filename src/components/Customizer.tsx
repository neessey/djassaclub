import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ZoomIn, ZoomOut, Save, Image as ImageIcon,
  ShoppingBag, ArrowRightLeft, Trash2, RotateCw, Upload, X, Check,
  ChevronLeft, MessageCircle
} from 'lucide-react';
import { ProductType, CustomElement, UserDesign } from '../types';
  import { uploadPhotoToCloudinary } from '../lib/cloudinary';
import Checkout from './Checkout';
import { saveDesign } from '../firebase';

// Polices encore utilisées pour l'affichage rétro-compatible d'anciens designs
// "remixés" depuis la Gallery qui contiendraient des éléments texte.
const FONTS = [
  { name: 'Space Grotesk', class: 'font-display' },
  { name: 'Syne', class: 'font-syne' },
  { name: 'JetBrains bold', class: 'font-bold' },
  { name: 'Inter', class: 'font-sans' },
  { name: 'Impact', class: 'font-impact uppercase font-extrabold tracking-tighter' }
];

// ⚠️ Remplace par le vrai numéro WhatsApp de l'atelier (format international,
// sans le +, ex : "2250700000000" pour la Côte d'Ivoire).
const WHATSAPP_NUMBER = '225XXXXXXXXX';

// ================= MODÈLES DE PRODUITS =================

// Modèles pour T-Shirt, Hoodie, Sweat, Tote Bag (6 modèles identiques)
const CLOTHING_MODELS = [
  {
    id: 'model-1',
    imgFront: '/assets/ex1.jpg',
    imgBack: '/assets/ex1.jpg',
    thumbnail: '/assets/ex1.jpg'
  },
  {
    id: 'model-2',
    imgFront: '/assets/ex2.jpg',
    imgBack: '/assets/ex2.jpg',
    thumbnail: '/assets/ex2.jpg'
  },
  {
    id: 'model-3',
    imgFront: '/assets/ex3.jpg',
    imgBack: '/assets/ex3.jpg',
    thumbnail: '/assets/ex3.jpg'
  },
  {
    id: 'model-4',
    imgFront: '/assets/ex4.jpg',
    imgBack: '/assets/ex4.jpg',
    thumbnail: '/assets/ex4.jpg'
  },
  {
    id: 'model-5',
    imgFront: '/assets/ex5.jpg',
    imgBack: '/assets/ex5.jpg',
    thumbnail: '/assets/ex5.jpg'
  },
  {
    id: 'model-6',
    imgFront: '/assets/ex6.jpg',
    imgBack: '/assets/ex6.jpg',
    thumbnail: '/assets/ex6.jpg'
  }
];

// Modèles pour Magazine (2 modèles)
const MAGAZINE_MODELS = [
  {
    id: 'mag-1',
    imgFront: '/assets/mag-1.jpg',
    imgBack: '/assets/mag-1.jpg',
    thumbnail: '/assets/mag-1.jpg'
  },
  {
    id: 'mag-2',
    imgFront: '/assets/mag-2.jpg',
    imgBack: '/assets/mag-2.jpg',
    thumbnail: '/assets/mag-2.jpg'
  }
];

// Cadre - pas de modèle, juste un conteneur pour la photo
const FRAME_MODEL = {
  id: 'frame-1',
  imgFront: '/assets/cadre.jpg',
  imgBack: '',
  thumbnail: '/assets/cadre.jpg'
};

// Configuration des produits avec leurs modèles.
// Le CHOIX DU SUPPORT (le `type`) se fait désormais uniquement dans Categories.tsx —
// ce fichier ne sert plus qu'à retrouver les infos (prix, couleurs, modèles) du
// support déjà sélectionné, reçu via la prop `initialProductType`.
const PRODUCT_TEMPLATES = [
  {
    type: 't-shirt' as ProductType,
    name: 'T-Shirt Heavyweight',
    description: 'Coton premium 100% bio, coupe structurée streetwear',
    price: 19500,
    colors: [
      { name: 'Noir', hex: '#111111' },
      { name: 'Blanc', hex: '#F8F8F8' },
      { name: 'Gris', hex: '#888888' },
    ],
    sides: ['front', 'back'] as const,
    models: CLOTHING_MODELS,
    defaultModelIndex: 0,
    hasMultipleModels: true
  },
  {
    type: 'hoodie' as ProductType,
    name: 'Hoodie Boxy Fit',
    description: 'Molleton épais 450gsm, silhouette oversize confortable',
    price: 32500,
    colors: [
      { name: 'Noir', hex: '#111111' },
      { name: 'Blanc', hex: '#F8F8F8' },
      { name: 'Gris', hex: '#888888' },
   
    ],
    sides: ['front', 'back'] as const,
    models: CLOTHING_MODELS,
    defaultModelIndex: 0,
    hasMultipleModels: true
  },
  {
    type: 'sweat' as ProductType,
    name: 'Sweat',
    description: 'Sweat léger, idéal pour les superpositions',
    price: 12000,
    colors: [
      { name: 'Noir', hex: '#111111' },
      { name: 'Blanc', hex: '#F8F8F8' },
      { name: 'Gris', hex: '#888888' }
    ],
    sides: ['front', 'back'] as const,
    models: CLOTHING_MODELS,
    defaultModelIndex: 0,
    hasMultipleModels: true
  },
  {
    type: 'tote-bag' as ProductType,
    name: 'Tote Bag Toile',
    description: 'Toile de coton épaisse 100% recyclée',
    price: 9500,
    colors: [
      { name: 'Ecru', hex: '#F2E8D5' },
      { name: 'Noir', hex: '#111111' },
      { name: 'Kaki', hex: '#BDB76B' }
    ],
    sides: ['front', 'back'] as const,
    models: CLOTHING_MODELS,
    defaultModelIndex: 0,
    hasMultipleModels: true
  },
  {
    type: 'magazine' as ProductType,
    name: 'Magazine',
    description: 'Vos créations dans une édition papier',
    price: 13000,
    colors: [
      { name: 'Blanc', hex: '#F8F8F8' },
      { name: 'Noir', hex: '#111111' }
    ],
    sides: ['front', 'back'] as const,
    models: MAGAZINE_MODELS,
    defaultModelIndex: 0,
    hasMultipleModels: true
  },
  {
    type: 'frame' as ProductType,
    name: 'Cadre',
    description: 'Cadre en bois avec verre protecteur',
    price: 4500,
    colors: [
      { name: 'Bois Clair', hex: '#DEB887' },
      { name: 'Bois Foncé', hex: '#8B4513' },
      { name: 'Noir', hex: '#111111' },
      { name: 'Blanc', hex: '#F8F8F8' }
    ],
    sides: ['front'] as const,
    models: [FRAME_MODEL],
    defaultModelIndex: 0,
    hasMultipleModels: false
  }
];

interface CustomizerProps {
  onOrderSuccess: (orderId: string) => void;
  initialProductType?: ProductType;
  /** Renvoie l'utilisateur vers Categories.tsx pour changer de support. Optionnel :
   *  si absent, le lien "Changer de support" ne s'affiche simplement pas. */
  onBackToCategories?: () => void;
}

export default function Customizer({
  onOrderSuccess,
  initialProductType = 't-shirt',
  onBackToCategories
}: CustomizerProps) {
  // Le support (productType) vient de Categories.tsx via cette prop — on ne le
  // re-sélectionne plus ici, on se contente de le synchroniser s'il change.
  const [productType, setProductType] = useState<ProductType>(initialProductType);
  const currentTemplate = PRODUCT_TEMPLATES.find(p => p.type === productType) || PRODUCT_TEMPLATES[0];

  // Vêtements (t-shirt/hoodie/sweat/tote-bag) : modèle + couleur + photo, rien de plus.
  // Cadre : juste la photo.
  // Magazine : modèle, puis redirection WhatsApp pour finaliser (pas de studio ici).
  const isMagazine = productType === 'magazine';
  const isFrame = productType === 'frame';

  // État pour le modèle sélectionné (coupe : Classique, Oversize, Boxy... / format magazine)
  const [selectedModelIndex, setSelectedModelIndex] = useState<number>(
    currentTemplate.defaultModelIndex || 0
  );
  const currentModel = currentTemplate.models[selectedModelIndex] || currentTemplate.models[0];

  // États du produit
  const [selectedColor, setSelectedColor] = useState<string>(currentTemplate.colors[0].hex);
  const [frameSize, setFrameSize] = useState<'petit' | 'grand'>('petit');
  const [currentSide, setCurrentSide] = useState<'front' | 'back' | 'outside'>(
    currentTemplate.sides[0] || 'front'
  );
  const [elements, setElements] = useState<CustomElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Photo(s) uploadée(s) par le client — seul outil de personnalisation restant
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // View states
  const [zoom, setZoom] = useState(1);
  const [isRotating, setIsRotating] = useState(false);

  // Modals
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [designSaved, setDesignSaved] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  // Se resynchronise quand Categories envoie un nouveau support (initialProductType).
  // On réinitialise modèle / couleur / face / éléments pour repartir propre.
  useEffect(() => {
    if (initialProductType) {
      setProductType(initialProductType);
      const newTemplate = PRODUCT_TEMPLATES.find(p => p.type === initialProductType) || PRODUCT_TEMPLATES[0];
      setSelectedColor(newTemplate.colors[0].hex);
      setCurrentSide(newTemplate.sides[0] || 'front');
      setSelectedModelIndex(newTemplate.defaultModelIndex || 0);
      setElements([]);
      setSelectedElementId(null);
      setUploadedImages([]);
    }
  }, [initialProductType]);

  // Gestion des images uploadées

// nouvel état pour le feedback pendant l'upload
const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  setIsUploadingPhoto(true);
  try {
    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      const url = await uploadPhotoToCloudinary(file);
      uploadedUrls.push(url);
    }

    setUploadedImages(prev => [...prev, ...uploadedUrls]);

    // on ajoute l'élément sur le canvas avec l'URL Cloudinary, pas le base64
    if (uploadedUrls.length > 0) {
      addImageElement(uploadedUrls[0]);
    }
  } catch (err) {
    console.error(err);
    alert("Erreur lors de l'envoi de la photo. Réessayez.");
  } finally {
    setIsUploadingPhoto(false);
  }
};

  const addImageElement = (imageUrl: string) => {
    const newElement: CustomElement = {
      id: `image-${Date.now()}`,
      type: 'logo',
      content: imageUrl,
      x: 30,
      y: 30,
      size: 120,
      rotation: 0,
      side: currentSide
    };
    setElements([...elements, newElement]);
    setSelectedElementId(newElement.id);
  };

  // Element actions
  const updateElementAttribute = (id: string, updates: Partial<CustomElement>) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    setSelectedElementId(null);
  };

  // Save design
  const handleSaveDesign = async () => {
    setSavingStatus(true);
    try {
      const designPayload: UserDesign = {
        productType,
        color: selectedColor,
        elements,
        creatorName: 'Membre DjassaClub',
        creatorEmail: 'club@djassa.net',
        upvotes: 0,
        isPublic: true,
        createdAt: Date.now()
      };
      await saveDesign(designPayload);
      setDesignSaved(true);
      setTimeout(() => setDesignSaved(false), 4000);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement de votre création.");
    } finally {
      setSavingStatus(false);
    }
  };

  // Drag state
  const dragStartRef = useRef<{ x: number; y: number; elX: number; elY: number } | null>(null);

  const handleElementDragStart = (e: React.MouseEvent, el: CustomElement) => {
    e.stopPropagation();
    setSelectedElementId(el.id);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      elX: el.x,
      elY: el.y
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStartRef.current) return;
      const deltaX = moveEvent.clientX - dragStartRef.current.x;
      const deltaY = moveEvent.clientY - dragStartRef.current.y;

      const pctX = (deltaX / 450) * 100;
      const pctY = (deltaY / 450) * 100;

      const nextX = Math.max(0, Math.min(85, dragStartRef.current.elX + pctX));
      const nextY = Math.max(0, Math.min(85, dragStartRef.current.elY + pctY));

      updateElementAttribute(el.id, { x: nextX, y: nextY });
    };

    const handleMouseUp = () => {
      dragStartRef.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const activeSideElements = elements.filter(el => el.side === currentSide);

  // Lien WhatsApp pré-rempli pour le magazine (format déjà choisi à l'étape 1)
  const whatsappMessage = encodeURIComponent(
    `Bonjour DjassaClub ! Je souhaite commander un Magazine (${currentModel.id}). Pouvez-vous m'aider à finaliser ma commande ?`
  );
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

  return (
    <div className="bg-white min-h-screen py-10 px-4" id="studio">

      {/* Le panier vit désormais uniquement dans Categories.tsx — pas de
          doublon ici, le Customizer se concentre sur la personnalisation. */}

      <div className="max-w-7xl mx-auto">

        {/* ================= HEADER ================= */}
        <div className="text-center mb-10 pb-8 relative">
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

          {/* Lien retour + rappel du support déjà choisi dans Categories */}
          {onBackToCategories && (
            <button
              onClick={onBackToCategories}
              className="absolute left-0 top-1 inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-black transition"
            >
              <X className="w-4 h-4" />
             
            </button>
          )}

          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black text-white text-[10px] font-bold uppercase tracking-[0.25em] mb-5">
            ✦ Studio Créatif — {currentTemplate.name}
          </span>
          <h2 className="font-black text-3xl md:text-5xl tracking-tight text-gray-950">
            Personnalisez votre produit
          </h2>
          <p className="text-sm text-gray-500 mt-3">
            {isMagazine
              ? 'Choisissez un format, puis contactez-nous sur WhatsApp pour finaliser votre magazine.'
              : isFrame
              ? 'Ajoutez simplement votre photo.'
              : 'Choisissez un modèle, une couleur, puis ajoutez votre photo.'}
          </p>
        </div>

        {/* ================= SÉLECTION DU MODÈLE =================
            Le SUPPORT (t-shirt / hoodie / etc.) vient de Categories.tsx et n'est
            plus re-sélectionnable ici — seul le MODÈLE (coupe / format) reste. */}
        {currentTemplate.hasMultipleModels && (
          <div className="mb-12">
            <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4 text-center">
              1. Choisissez votre modèle
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {currentTemplate.models.map((model, index) => (
                <motion.button
                  key={model.id}
                  onClick={() => setSelectedModelIndex(index)}
                  whileHover={{ y: -4 }}
                  className={`
                    relative bg-white border-2 rounded-2xl p-3 text-center transition-all
                    ${selectedModelIndex === index
                      ? 'border-black shadow-xl scale-105'
                      : 'border-gray-200 hover:border-gray-400'
                    }
                  `}
                >
                  {selectedModelIndex === index && (
                    <div className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                  <div className="w-full aspect-auto bg-gray-100 rounded-xl overflow-hidden mb-2">
                    <img
                      src={model.thumbnail}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* ================= MAGAZINE : REDIRECTION WHATSAPP =================
            Pas de studio de personnalisation ici — un magazine se prépare à la
            main (plusieurs pages/photos), donc on renvoie directement vers
            WhatsApp une fois le format choisi. */}
        {isMagazine ? (
          <div className="max-w-xl mx-auto text-center bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-[32px] p-10 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#25D366]/10 flex items-center justify-center mx-auto mb-5">
              <MessageCircle className="w-8 h-8 text-[#25D366]" />
            </div>
            <h3 className="font-black text-2xl text-gray-950 mb-2">
              Format sélectionné : {currentModel.id}
            </h3>
            <p className="text-sm text-gray-500 mb-8">
              Vos magazines contiennent plusieurs pages et photos — on préfère
              s'occuper de la mise en page directement avec vous sur WhatsApp
              pour un rendu impeccable.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe57] text-white font-bold text-sm px-8 py-4 rounded-full shadow-xl transition hover:scale-[1.02]"
            >
              <MessageCircle className="w-4 h-4" />
              Continuer sur WhatsApp
            </a>
            <p className="text-xs text-gray-400 mt-4">
              {currentTemplate.price.toLocaleString('fr-FR')} FCFA — prix de base, peut varier selon le nombre de pages
            </p>
          </div>
        ) : (
          <>
            {/* ================= MAIN GRID (vêtements & cadre) ================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* ================= CONTROL PANEL ================= */}
              <div className="lg:col-span-5 bg-white border border-gray-200 rounded-[32px] p-7 shadow-sm">

                {/* COULEUR — uniquement pour les vêtements, pas pour le cadre */}
               {/* CHOIX TAILLE POUR CADRE */}
{isFrame ? (
  <div className="mb-6">
    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-3">
      2. Choisissez la taille du cadre
    </label>

    <div className="grid grid-cols-2 gap-4">
      <button
        onClick={() => setFrameSize('petit')}
        className={`
          p-5 rounded-2xl border-2 transition-all text-center
          ${frameSize === 'petit'
            ? 'border-black bg-black text-white shadow-lg'
            : 'border-gray-200 hover:border-gray-400'
          }
        `}
      >
        <p className="font-bold text-sm">
          Petit
        </p>
        <p className="text-xs mt-1 opacity-80">
          3000 FCFA
        </p>
      </button>

      <button
        onClick={() => setFrameSize('grand')}
        className={`
          p-5 rounded-2xl border-2 transition-all text-center
          ${frameSize === 'grand'
            ? 'border-black bg-black text-white shadow-lg'
            : 'border-gray-200 hover:border-gray-400'
          }
        `}
      >
        <p className="font-bold text-sm">
          Grand
        </p>
        <p className="text-xs mt-1 opacity-80">
          6000 FCFA
        </p>
      </button>
    </div>
  </div>
) : (
  /* COULEURS POUR LES AUTRES PRODUITS */
  <div className="mb-6">
    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-3">
      2. Choisissez la couleur du support
    </label>

    <div className="flex flex-wrap gap-3">
      {currentTemplate.colors.map((color) => (
        <button
          key={color.hex}
          onClick={() => setSelectedColor(color.hex)}
          title={color.name}
          className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
            selectedColor === color.hex
              ? 'border-black scale-110 shadow-lg'
              : 'border-gray-200 hover:scale-105'
          }`}
          style={{ backgroundColor: color.hex }}
        >
          {selectedColor === color.hex && (
            <Check className="w-4 h-4 text-white drop-shadow" />
          )}
        </button>
      ))}
    </div>

    <p className="text-xs text-gray-400 mt-2">
      {currentTemplate.colors.find(c => c.hex === selectedColor)?.name}
    </p>
  </div>
)}

                {/* PHOTO — seul outil de personnalisation restant */}
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-3">
                    {isFrame ? 'Ajoutez votre photo' : '3. Ajoutez votre photo'}
                  </label>

                  <div
  onClick={() => !isUploadingPhoto && fileInputRef.current?.click()}
  className={`border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center transition group ${
    isUploadingPhoto ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:border-black'
  }`}
>
  {isUploadingPhoto ? (
    <p className="text-sm font-medium text-gray-600">Envoi en cours...</p>
  ) : (
    <>
      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2 group-hover:text-black transition" />
      <p className="text-sm font-medium text-gray-600 group-hover:text-black transition">
        Cliquez pour uploader
      </p>
      <p className="text-xs text-gray-400 mt-1">PNG, JPG - Max 5MB</p>
    </>
  )}
  <input
    ref={fileInputRef}
    type="file"
    accept="image/*"
    multiple
    onChange={handleImageUpload}
    disabled={isUploadingPhoto}
    className="hidden"
  />
</div>

                  {uploadedImages.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-gray-600 mb-2">Vos photos</p>
                      <div className="flex flex-wrap gap-2">
                        {uploadedImages.map((img, index) => (
                          <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                            <img src={img} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                            <button
                              onClick={() => {
                                setUploadedImages(prev => prev.filter((_, i) => i !== index));
                              }}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ================= ACTIONS ================= */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              <button
                onClick={handleSaveDesign}
                disabled={savingStatus}
                className="bg-gray-100 hover:bg-gray-200 py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition"
              >
                <Save className="w-4 h-4" />
                {savingStatus ? "Sauvegarde..." : "Sauvegarder"}
              </button>

              <button
                onClick={() => setIsCheckoutOpen(true)}
                disabled={elements.length === 0}
                className="bg-gradient-to-r from-black via-gray-900 to-black text-white py-4 rounded-2xl font-bold text-sm shadow-xl hover:scale-[1.02] transition disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
Acheter - {
  isFrame
    ? (frameSize === 'petit' ? 3000 : 6000).toLocaleString("fr-FR")
    : currentTemplate.price.toLocaleString("fr-FR")
} FCFA              </button>
            </div>
          </>
        )}

        {/* ================= TOAST ================= */}
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
                <p className="font-bold text-sm">Design enregistré</p>
                <p className="text-xs text-gray-400">Votre création est sauvegardée.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================= CHECKOUT ================= */}
        {isCheckoutOpen && (
          <Checkout
  productType={productType}
  color={selectedColor}
  size={isFrame ? frameSize : undefined}
  elements={elements}
  price={
    isFrame
      ? (frameSize === 'petit' ? 3000 : 6000)
      : currentTemplate.price
  }
  customizationMode="premium"
  onClose={() => setIsCheckoutOpen(false)}
  onOrderSuccess={(orderId) => {
    setIsCheckoutOpen(false);
    onOrderSuccess(orderId);
  }}
/>
        )}
      </div>
    </div>
  );
}