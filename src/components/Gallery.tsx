import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, RefreshCw, Sparkles, ShoppingBag, Eye, X } from 'lucide-react';
import { getPublicDesigns, upvoteDesign } from '../firebase';
import { UserDesign, ProductType, CustomElement } from '../types';

interface GalleryProps {
  onRemix: (productType: ProductType, color: string, elements: CustomElement[]) => void;
}

// Solid curated presets to show if Firestore is empty on cold start
const DEFAULT_PRESETS: UserDesign[] = [
  {
    id: 'preset-1',
    productType: 't-shirt',
    color: '#111111',
    creatorName: 'Amani K.',
    creatorEmail: 'amani@djassa.club',
    upvotes: 48,
    isPublic: true,
    createdAt: Date.now() - 3600000,
    elements: [
      {
        id: '1',
        type: 'text',
        content: 'NOT FOR RESALE',
        x: 15,
        y: 20,
        size: 36,
        color: '#C8102E',
        font: 'Space Grotesk',
        rotation: -5,
        side: 'front'
      },
      {
        id: '2',
        type: 'text',
        content: 'WEST AFRICA BATCH // 001',
        x: 15,
        y: 40,
        size: 11,
        color: '#F8F8F8',
        font: 'JetBrains Mono',
        rotation: -5,
        side: 'front'
      }
    ]
  },
  {
    id: 'preset-2',
    productType: 'hoodie',
    color: '#333333',
    creatorName: 'Fatoumata D.',
    creatorEmail: 'fatou@djassa.club',
    upvotes: 64,
    isPublic: true,
    createdAt: Date.now() - 7200000,
    elements: [
      {
        id: '3',
        type: 'text',
        content: 'LIQUID SOUL',
        x: 20,
        y: 25,
        size: 40,
        color: '#CCFF00',
        font: 'Syne',
        rotation: 0,
        side: 'front'
      },
      {
        id: '4',
        type: 'emoji',
        content: '🔥',
        x: 45,
        y: 50,
        size: 42,
        rotation: 12,
        side: 'front'
      }
    ]
  },
  {
    id: 'preset-3',
    productType: 't-shirt',
    color: '#F8F8F8',
    creatorName: 'Emeka O.',
    creatorEmail: 'emeka@djassa.club',
    upvotes: 39,
    isPublic: true,
    createdAt: Date.now() - 10800000,
    elements: [
      {
        id: '5',
        type: 'text',
        content: 'FUTURE DECAY',
        x: 22,
        y: 30,
        size: 32,
        color: '#111111',
        font: 'JetBrains Mono',
        rotation: 0,
        side: 'front'
      }
    ]
  }
];

export default function Gallery({ onRemix }: GalleryProps) {
  const [designs, setDesigns] = useState<UserDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFabrication, setActiveFabrication] = useState<string | null>(null);

  const fetchDesigns = async () => {
    setLoading(true);
    try {
      const fetched = await getPublicDesigns(20);
      if (fetched.length > 0) {
        setDesigns(fetched);
      } else {
        setDesigns(DEFAULT_PRESETS);
      }
    } catch (err) {
      console.error(err);
      setDesigns(DEFAULT_PRESETS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  const handleUpvote = async (designId: string) => {
    // If it's a preset, increment locally to save Firestore quotas
    if (designId.startsWith('preset-')) {
      setDesigns(prev => prev.map(d => d.id === designId ? { ...d, upvotes: d.upvotes + 1 } : d));
      return;
    }

    try {
      const updatedUpvotes = await upvoteDesign(designId);
      setDesigns(prev => prev.map(d => d.id === designId ? { ...d, upvotes: updatedUpvotes } : d));
    } catch (err) {
      console.error("Upvote Firestore failed, applying local increment", err);
      setDesigns(prev => prev.map(d => d.id === designId ? { ...d, upvotes: d.upvotes + 1 } : d));
    }
  };

  return (
    <div className="bg-brand-black py-24 px-4 md:px-8 border-t border-zinc-900" id="gallery">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center md:text-left mb-16 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-900 pb-8">
          <div>
            <span className="text-xs font-mono text-brand-red uppercase tracking-widest flex items-center justify-center md:justify-start gap-1">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Galerie Publique du Club
            </span>
            <h2 className="font-display font-black text-3xl md:text-5xl uppercase tracking-tighter text-zinc-100 mt-1">
              LES CRÉATIONS DJASSA
            </h2>
          </div>

          <button
            onClick={fetchDesigns}
            className="self-center bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-mono tracking-widest uppercase px-5 py-3 rounded-xl text-[10px] flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Recharger la galerie
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500 font-mono text-xs">
            <span className="w-10 h-10 border-2 border-brand-red border-t-transparent rounded-full animate-spin mb-4" />
            SYNCHRONISATION DES IDÉES DU CLUB...
          </div>
        ) : (
          /* Pinterest Card Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {designs.map((design) => {
              // Extract primary text elements for preview representation
              const textElement = design.elements.find(el => el.type === 'text');
              const emojiElement = design.elements.find(el => el.type === 'emoji');
              
              return (
                <div
                  key={design.id}
                  className="bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded-3xl p-5 flex flex-col justify-between min-h-[440px] relative overflow-hidden group transition-all"
                >
                  
                  {/* Backdrop network grids */}
                  <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

                  {/* Header Creator Info */}
                  <div className="flex justify-between items-center mb-4 z-10">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-100 font-display uppercase tracking-tight">
                        {design.creatorName}
                      </h4>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">
                        CRÉATEUR ENREGISTRÉ
                      </span>
                    </div>
                    <span className="bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-[9px] px-2 py-1 rounded uppercase">
                      {design.productType}
                    </span>
                  </div>

                  {/* Visual Product Mock Preview */}
                  <div className="h-56 bg-zinc-900 rounded-2xl relative overflow-hidden flex items-center justify-center border border-zinc-900/60 shadow-inner group/preview">
                    
                    {/* Fabric preview colored circle */}
                    <div 
                      className="absolute inset-0 w-full h-full mix-blend-color opacity-80"
                      style={{ backgroundColor: design.color }}
                    />

                    {/* Standard shadow layout */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                    {/* Simple overlay rendering to give visual preview of design layout */}
                    <div className="absolute z-10 text-center px-4 max-w-full select-none pointer-events-none transform group-hover/preview:scale-105 transition-transform duration-500">
                      {textElement && (
                        <h3 
                          className="font-black text-lg md:text-xl tracking-tight leading-none uppercase truncate mb-1"
                          style={{ color: textElement.color }}
                        >
                          {textElement.content}
                        </h3>
                      )}
                      
                      {emojiElement && (
                        <span className="text-3xl block mt-1">{emojiElement.content}</span>
                      )}
                    </div>

                    <span className="absolute bottom-3 right-3 text-[9px] font-mono text-zinc-500 bg-zinc-950/80 border border-zinc-800 px-2 py-1 rounded uppercase tracking-wider">
                      BASE: {design.color}
                    </span>

                  </div>

                  {/* Action controls below visual preview */}
                  <div className="pt-5 mt-4 border-t border-zinc-900/80 z-10 flex flex-col space-y-3">
                    
                    <div className="flex justify-between items-center">
                      {/* Upvotes button */}
                      <button
                        onClick={() => design.id && handleUpvote(design.id)}
                        className="flex items-center gap-1.5 text-zinc-400 hover:text-brand-red transition-colors font-mono text-xs cursor-pointer"
                      >
                        <Heart className="w-4.5 h-4.5 text-brand-red fill-current" />
                        <span>{design.upvotes} UPVOTES</span>
                      </button>

                      {/* Fabrication look button */}
                      <button
                        onClick={() => setActiveFabrication(design.productType)}
                        className="text-[10px] font-mono text-zinc-500 hover:text-white uppercase flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> FABRICATION ATELIER
                      </button>
                    </div>

                    {/* Remix call to action */}
                    <button
                      onClick={() => onRemix(design.productType, design.color, design.elements)}
                      className="w-full bg-white hover:bg-zinc-200 text-black py-2.5 rounded-xl text-xs uppercase font-mono font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-brand-red animate-spin" style={{ animationDuration: '4s' }} /> REMIXER CETTE CRÉATION
                    </button>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Fabrication Video Screen Overlay Popup */}
      <AnimatePresence>
        {activeFabrication && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[#111111] border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden flex flex-col relative">
              
              <button 
                onClick={() => setActiveFabrication(null)}
                className="absolute top-4 right-4 z-20 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-full p-2"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6 text-center flex flex-col items-center justify-center space-y-5">
                <div className="w-14 h-14 rounded-full bg-brand-red/10 border border-brand-red flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-brand-red animate-pulse" />
                </div>

                <div>
                  <h4 className="font-display font-bold text-lg text-zinc-100 uppercase tracking-tight mb-2">
                    Visualisation Atelier {activeFabrication.toUpperCase()}
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
                    Voici comment est imprimé ce produit en Côte d'Ivoire. Nous utilisons un encrage pigmentaire DTG lourd ou une broderie 3D.
                  </p>
                </div>

                {/* Animated progress blocks */}
                <div className="w-full space-y-2.5 border-t border-zinc-900 pt-5 text-left font-mono text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>1. Calibrage laser :</span>
                    <span className="text-emerald-500 font-bold uppercase">Prêt (100%)</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>2. Pression thermique :</span>
                    <span className="text-emerald-500 font-bold uppercase">Fini (100%)</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>3. Encrage pigmentaire :</span>
                    <span className="text-brand-red font-bold uppercase animate-pulse">Encours (75%)</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                    <motion.div 
                      animate={{ width: ['0%', '100%'] }} 
                      transition={{ duration: 3, repeat: Infinity }} 
                      className="h-full bg-brand-red" 
                    />
                  </div>
                </div>

                <div className="text-[10px] text-zinc-500 font-mono uppercase">
                  HAUTE DÉFINITION • SANS COULEUR DÉLAVÉE
                </div>
              </div>

            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
