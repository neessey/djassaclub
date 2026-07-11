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
        className="fixed inset-0 z-50 bg-white flex flex-col justify-between items-center py-6 px-4 overflow-hidden"
      >
        {/* Décoration */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Barre de navigation */}
        <div className="w-full max-w-6xl flex justify-between items-center z-10 px-4">
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-2 h-2 rounded-full bg-black"
              animate={{ scale: stage === 'entrance' ? [1, 1.5, 1] : 1 }}
              transition={{ duration: 1.5, repeat: stage === 'entrance' ? Infinity : 0 }}
            />
            <span className="text-[10px] font-sans text-zinc-400 tracking-[0.15em] uppercase">
              Djassa Club — Showroom
            </span>
          </div>
          <button
            onClick={handleSkip}
            className="text-[10px] font-sans text-zinc-400 hover:text-black transition-colors uppercase tracking-widest border border-zinc-200 hover:border-black px-4 py-2 rounded-full"
          >
            Passer
          </button>
        </div>

        {/* Conteneur principal */}
        <div className="relative flex-1 w-full max-w-4xl flex items-center justify-center">
          <motion.div
            className="relative"
            
          >
            {/* Ombre portée */}
            <motion.div
              className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-3/4 h-8 bg-gradient-to-r from-transparent via-black/10 to-transparent rounded-full blur-xl"
              animate={{
                scale: isHovering ? 1.2 : 1,
                opacity: isHovering ? 0.3 : 0.15,
              }}
              transition={{ duration: 0.3 }}
            />

            {/* Image avec transition simple */}
            <motion.div
              className="relative"

            >
             <AnimatePresence mode="wait">
  {currentImage && (
    <motion.img
  key={currentImage}
  src={currentImage}
  className="
    w-96 h-[34rem]
    md:w-[32rem] md:h-[42rem]
    object-contain
    drop-shadow-2xl
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
              className="flex items-center gap-2 bg-black text-white px-8 py-3.5 rounded-full text-sm font-medium uppercase tracking-widest hover:bg-zinc-800 transition-colors shadow-lg hover:shadow-xl"
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