// Dépendances requises (à installer si absentes) :
// npm install motion lucide-react

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ChevronRight } from 'lucide-react';

interface IntroLoaderProps {
  onComplete: () => void;
}

type IntroStage = 'entrance' | 'rotation' | 'exit';

// Créations clients avec leurs images
const creations = [
  { 
    id: 1,
    image: '/assets/intro1.png',
  },
  { 
    id: 2,
    image: '/assets/intro2.png',
  },
  { 
    id: 3,
    image: '/assets/intro3.png',
  },
];

export default function IntroLoader({ onComplete }: IntroLoaderProps) {
  const [stage, setStage] = useState<IntroStage>('entrance');
const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [showEnter, setShowEnter] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Gestionnaire de séquence d'animation
 useEffect(() => {
  const showFirstImage = setTimeout(() => {
    setCurrentImage("/assets/intro.png");
  }, 300);

  const startRotation = setTimeout(() => {
    setStage("rotation");
  }, 1500);

  return () => {
    clearTimeout(showFirstImage);
    clearTimeout(startRotation);
  };
}, []);

  // Animation de rotation simple
useEffect(() => {
  if (stage !== "rotation") return;

  const sequence = [
    "/assets/intro1.png",
    "/assets/intro2.png",
    "/assets/intro3.png",
  ];

  let index = 0;

  const interval = setInterval(() => {

    if (index >= sequence.length) {
      clearInterval(interval);
      setTimeout(() => setShowEnter(true), 400);
      return;
    }

    setCurrentImage(sequence[index]);
    setCurrentIndex(index);

    index++;

  }, 2500);

  return () => clearInterval(interval);

}, [stage]);

  const handleEnter = () => {
    setStage('exit');
    setTimeout(onComplete, 800);
  };

  const handleSkip = () => {
    setStage('exit');
    setTimeout(onComplete, 800);
  };

  return (
    <AnimatePresence>
      <motion.div
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        // overflow-y-auto en filet de sécurité : si un très petit écran (notch,
        // barre de navigateur mobile) laisse malgré tout dépasser le contenu,
        // on scrolle au lieu de couper le bouton "Entrer" ou la nav du haut.
        className="fixed inset-0 z-50 bg-white flex flex-col justify-between items-center py-4 sm:py-6 px-3 sm:px-4 overflow-y-auto overflow-x-hidden"
      >
        {/* Décoration */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Barre de navigation — flex-wrap + truncate pour ne jamais déborder
            même sur les écrans les plus étroits (ex : iPhone SE, 320px) */}
        <div className="w-full max-w-6xl flex flex-wrap justify-between items-center gap-2 z-10 px-2 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <motion.div 
              className="w-2 h-2 rounded-full bg-black shrink-0"
              animate={{ scale: stage === 'entrance' ? [1, 1.5, 1] : 1 }}
              transition={{ duration: 1.5, repeat: stage === 'entrance' ? Infinity : 0 }}
            />
            <span className="text-[9px] sm:text-[10px] font-sans text-zinc-400 tracking-[0.1em] sm:tracking-[0.15em] uppercase truncate">
              Djassa Club — Showroom
            </span>
          </div>
          <button
            onClick={handleSkip}
            className="shrink-0 text-[9px] sm:text-[10px] font-sans text-zinc-400 hover:text-black transition-colors uppercase tracking-widest border border-zinc-200 hover:border-black px-3 sm:px-4 py-1.5 sm:py-2 rounded-full"
          >
            Passer
          </button>
        </div>

        {/* Conteneur principal
            min-h-0 est essentiel ici : sans ça, un enfant flex-1 refuse de
            rétrécir sous sa taille intrinsèque, et sur un petit écran (ex :
            iPhone SE en 568px de haut) le contenu déborde et coupe le bouton
            "Entrer" en bas au lieu de s'adapter. */}
        <div className="relative flex-1 min-h-0 w-full max-w-4xl flex items-center justify-center px-2">
          <motion.div
            className="relative"
            
          >
            {/* Ombre portée — remplacée par un radial-gradient plutôt qu'un
                filter: blur(). Le blur CSS sur un élément superposé à une
                grande image force Safari iOS à recomposer la couche GPU en
                continu ; sur un appareil ancien (A11/iPhone 8), ça peut faire
                planter l'onglet, surtout répété à chaque changement d'image. */}
            <motion.div
              className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-3/4 h-8 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 70%)'
              }}
              animate={{
                scale: isHovering ? 1.2 : 1,
                opacity: isHovering ? 1 : 0.7,
              }}
              transition={{ duration: 0.3 }}
            />

            {/* Image avec transition simple.
                Le conteneur utilise clamp() sur largeur ET hauteur : il s'adapte
                en continu à la taille de l'écran (vw/vh) tout en gardant un
                plancher lisible sur les très petits téléphones et un plafond
                raisonnable sur tablette/desktop. object-contain à l'intérieur
                garantit que l'image ne se déforme jamais et ne déborde jamais
                de ce conteneur, quelle que soit la largeur ou la hauteur réelle
                de l'écran (portrait, paysage, notch, barre d'adresse mobile...). */}
            <motion.div
              className="relative w-[clamp(200px,70vw,26rem)] h-[clamp(280px,52vh,38rem)] mx-auto"
              style={{
                // Vrai box-shadow CSS plutôt que filter: drop-shadow(). Le
                // drop-shadow doit ré-échantillonner le canal alpha de l'image
                // à chaque frame (coûteux) ; le box-shadow dessine une ombre
                // sur le rectangle une bonne fois pour toutes (bien plus léger
                // sur un GPU ancien comme celui d'un iPhone 8). L'ombre suit
                // le cadre plutôt que le contour détouré de l'image — léger
                // compromis visuel, mais imperceptible ici.
              }}
            >
             <AnimatePresence mode="wait">
  {currentImage && (
    <motion.img
  key={currentImage}
  src={currentImage}
  className="w-full h-full object-contain     drop-shadow-[0_20px_25px_rgba(0,0,0,0.15)]
"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{
    duration: 0.6,
    ease: "easeInOut"
  }}
/>
  )}
</AnimatePresence>

              {/* Indicateur de progression */}
              {stage === 'rotation' && (
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {Array.from({ length: creations.length + 1 }).map((_, index) => {
                    const isActive = index === currentIndex + 1;
                    const isCompleted = index < currentIndex + 1;
                    return (
                      <motion.div
                        key={index}
                        className="w-2 h-2 rounded-full bg-zinc-300"
                        animate={{
                          backgroundColor: isActive ? '#000' : isCompleted ? '#000' : '#e5e5e5',
                          scale: isActive ? 1.2 : 1,
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    );
                  })}
                </div>
              )}

              {/* Effet de brillance */}
              <motion.div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
                }}
                animate={{
                  opacity: isHovering ? 0.6 : 0.3,
                }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Bouton Entrer */}
        <AnimatePresence>
          {showEnter && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              onClick={handleEnter}
              className="flex items-center gap-2 bg-black text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-xs sm:text-sm font-medium uppercase tracking-widest hover:bg-zinc-800 transition-colors shadow-lg hover:shadow-xl shrink-0"
            >
              Entrer
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}