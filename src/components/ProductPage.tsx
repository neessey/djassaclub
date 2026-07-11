import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Disc, Layers, Scissors, ShieldAlert, Cpu } from 'lucide-react';

export default function ProductPage() {
  const [activeLayer, setActiveLayer] = useState<'tissu' | 'impression' | 'couture' | 'recom'>('recom');

  const layers = [
    {
      id: 'tissu' as const,
      label: '1. Le Tissu Lourd',
      title: 'ORGANIC COTTON 360g/m² & 450g/m²',
      desc: "Notre coton biologique est peigné avec soin pour obtenir un fini rigide et robuste qui préserve la structure originale des coupes boxy streetwear. Pas de déformation au fil des lavages.",
      details: ['100% Coton Biologique certifié', 'Toucher ultra-sec "Dry hand feeling"', 'Épaisseur structurée d\'inspiration Nike et Yeezy'],
      icon: Layers,
      offsetY: -35
    },
    {
      id: 'couture' as const,
      label: '2. La Finition & Couture',
      title: 'DOUBLE NEEDLE STITCHING & FINISHES',
      desc: "Double surpiqûre aux emmanchures, à l'ourlet et au col. Bande de propreté d'épaule à épaule pour un maintien parfait du col d'inspiration atelier de haute couture.",
      details: ['Fils de coton renforcés', 'Surpiqûres à plat anti-frottements', 'Finition col épais 3cm élastique'],
      icon: Scissors,
      offsetY: -15
    },
    {
      id: 'impression' as const,
      label: '3. L\'Impression Directe / Broderie',
      title: 'HIGH-DENSITY SCREEN PRINTING',
      desc: "Nous utilisons des encres à base d'eau de classe mondiale pour nos impressions DTG à jet d'encre haute définition et notre broderie 3D. Rendu des couleurs brillant d'aspect chrome ou métallisé sans relief lourd.",
      details: ['Encre pigmentaire écologique certifiée', 'Résistance maximale au frottement et lavage', 'Encrage chrome & métallisé haute intensité'],
      icon: Disc,
      offsetY: 15
    },
    {
      id: 'recom' as const,
      label: '4. Le Produit Assemblé',
      title: 'THE FINAL MASTERPIECE RECOMPOSED',
      desc: "Toutes les étapes fusionnent pour créer un objet d'art streetwear unique. Un vêtement DjassaClub n'est pas qu'un t-shirt imprimé, c'est l'expression physique de votre pensée la plus pure.",
      details: ['Emballage sachet recyclé opaque Nothing OS style', 'Numéro de lot unique gravé', 'Garantie de satisfaction de l\'Atelier'],
      icon: Cpu,
      offsetY: 0
    }
  ];

  const currentLayer = layers.find(l => l.id === activeLayer) || layers[3];

  return (
    <div className="bg-brand-black border-t border-zinc-900 py-24 px-4 md:px-8 relative overflow-hidden" id="about">
      
      {/* Background grids */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-red/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-brand-red uppercase tracking-widest block mb-1">
            ANATOMIE DÉCONSTRUITE
          </span>
          <h2 className="font-display font-black text-3xl md:text-5xl uppercase tracking-tighter text-zinc-100">
            QUALITÉ BRUTE D'ATELIER
          </h2>
          <p className="text-sm text-zinc-500 max-w-lg mx-auto mt-2 font-bold uppercase">
            Cliquez sur les couches pour démonter notre produit et voir chaque couche de fabrication.
          </p>
        </div>

        {/* Anatomy content grids */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT: Exploder/Anatomy Layer Navigator (visualizes deconstruction) */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative min-h-[420px]">
            
            {/* Layers container */}
            <div className="relative w-full max-w-[340px] h-[360px] flex flex-col justify-center items-center">
              
              {/* Layer 1: Fabric Block Tissu */}
              <motion.div
                animate={{
                  y: activeLayer === 'tissu' ? -60 : activeLayer === 'recom' ? 0 : -30,
                  opacity: activeLayer === 'tissu' || activeLayer === 'recom' ? 1 : 0.25,
                  scale: activeLayer === 'tissu' ? 1.05 : 0.95
                }}
                onClick={() => setActiveLayer('tissu')}
                className="absolute w-64 h-20 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between p-4 cursor-pointer shadow-2xl z-40 transform hover:-translate-y-1 transition-transform"
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-brand-red" />
                  <span className="text-xs font-bold text-zinc-100 uppercase font-bold">1. Tissu Organic (360G)</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-bold">COTON BRUT</span>
              </motion.div>

              {/* Layer 2: Stitching Couture */}
              <motion.div
                animate={{
                  y: activeLayer === 'couture' ? -10 : activeLayer === 'recom' ? 0 : -10,
                  opacity: activeLayer === 'couture' || activeLayer === 'recom' ? 1 : 0.25,
                  scale: activeLayer === 'couture' ? 1.05 : 0.95
                }}
                onClick={() => setActiveLayer('couture')}
                className="absolute w-64 h-20 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between p-4 cursor-pointer shadow-2xl z-30 transform hover:-translate-y-1 transition-transform"
              >
                <div className="flex items-center gap-3">
                  <Scissors className="w-5 h-5 text-brand-red" />
                  <span className="text-xs font-bold text-zinc-100 uppercase font-bold">2. Couture Double Aiguille</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-bold">FINITIONS</span>
              </motion.div>

              {/* Layer 3: Printing Ink */}
              <motion.div
                animate={{
                  y: activeLayer === 'impression' ? 40 : activeLayer === 'recom' ? 0 : 10,
                  opacity: activeLayer === 'impression' || activeLayer === 'recom' ? 1 : 0.25,
                  scale: activeLayer === 'impression' ? 1.05 : 0.95
                }}
                onClick={() => setActiveLayer('impression')}
                className="absolute w-64 h-20 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between p-4 cursor-pointer shadow-2xl z-20 transform hover:-translate-y-1 transition-transform"
              >
                <div className="flex items-center gap-3">
                  <Disc className="w-5 h-5 text-brand-red" />
                  <span className="text-xs font-bold text-zinc-100 uppercase font-bold">3. Encrage Chrome HD</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-bold">DÉCORS</span>
              </motion.div>

              {/* Central Recomposed trigger button */}
              <button
                onClick={() => setActiveLayer('recom')}
                className={`absolute bottom-0 bg-white hover:bg-zinc-200 text-black px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest font-bold z-40 cursor-pointer shadow-xl ${
                  activeLayer === 'recom' ? 'ring-2 ring-brand-red' : ''
                }`}
              >
                RECOMPOSER LE PRODUIT
              </button>

            </div>

          </div>

          {/* RIGHT: Detailed explanations with dynamic text fades */}
          <div className="lg:col-span-6 bg-zinc-950 border border-zinc-900 rounded-3xl p-6 md:p-10 relative">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentLayer.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-2 text-brand-red mb-3">
                  <currentLayer.icon className="w-5 h-5" />
                  <span className="text-xs font-bold font-bold uppercase tracking-wider">{currentLayer.label}</span>
                </div>

                <h3 className="font-display font-black text-xl md:text-2xl text-zinc-100 uppercase tracking-tight mb-4">
                  {currentLayer.title}
                </h3>

                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  {currentLayer.desc}
                </p>

                <div className="space-y-2 border-t border-zinc-900 pt-6">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                    Spécifications Techniques :
                  </span>
                  {currentLayer.details.map((detail, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs text-zinc-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-red shrink-0" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

          </div>

        </div>

      </div>

    </div>
  );
}
