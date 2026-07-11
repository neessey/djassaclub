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
  const [rotation, setRotation] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Détecter si on est sur mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Animation de rotation avec gestion des tailles d'écran
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
        // Réinitialiser la rotation avant d'afficher le bouton
        setRotation(0);
        setTimeout(() => setShowEnter(true), 400);
        return;
      }

      // Appliquer une rotation de 90° à chaque changement
      setRotation(prev => prev + 90);
      setCurrentImage(sequence[index]);
      setCurrentIndex(index);
      index++;

    }, isMobile ? 3000 : 2500); // Plus lent sur mobile

    return () => clearInterval(interval);
  }, [stage, isMobile]);

  const handleEnter = () => {
    setStage('exit');
    setTimeout(onComplete, 800);
  };

  const handleSkip = () => {
    setStage('exit');
    setTimeout(onComplete, 800);
  };

  // Classes responsives pour l'image
  const getImageClasses = () => {
    if (isMobile) {
      return "w-64 h-[20rem] object-contain drop-shadow-2xl";
    }
    return "w-96 h-[34rem] md:w-[32rem] md:h-[42rem] object-contain drop-shadow-2xl";
  };

  return (
    <AnimatePresence>
      <motion.div
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="fixed inset-0 z-50 bg-white flex flex-col justify-between items-center py-4 sm:py-6 px-3 sm:px-4 overflow-hidden"
      >
        {/* Décoration */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
            backgroundSize: isMobile ? '15px 15px' : '20px 20px',
          }}
        />

        {/* Barre de navigation */}
        <div className="w-full max-w-6xl flex justify-between items-center z-10 px-2 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.div 
              className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-black"
              animate={{ scale: stage === 'entrance' ? [1, 1.5, 1] : 1 }}
              transition={{ duration: 1.5, repeat: stage === 'entrance' ? Infinity : 0 }}
            />
            <span className="text-[8px] sm:text-[10px] font-sans text-zinc-400 tracking-[0.15em] uppercase whitespace-nowrap">
              Djassa Club — Showroom
            </span>
          </div>
          <button
            onClick={handleSkip}
            className="text-[8px] sm:text-[10px] font-sans text-zinc-400 hover:text-black transition-colors uppercase tracking-widest border border-zinc-200 hover:border-black px-3 py-1.5 sm:px-4 sm:py-2 rounded-full"
          >
            Passer
          </button>
        </div>

        {/* Conteneur principal */}
        <div className="relative flex-1 w-full max-w-4xl flex items-center justify-center px-2">
          <motion.div
            className="relative flex items-center justify-center"
            initial={stage === 'entrance' ? { y: -50, opacity: 0, scale: 0.8 } : false}
            animate={{
              y: stage === 'entrance' ? 0 : 0,
              opacity: stage === 'exit' ? 0 : 1,
              scale: stage === 'exit' ? 2 : 1,
            }}
            transition={{
              type: 'spring',
              damping: 20,
              stiffness: 100,
              duration: stage === 'entrance' ? 1.2 : 0.4,
            }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {/* Ombre portée */}
            <motion.div
              className="absolute -bottom-6 sm:-bottom-8 left-1/2 transform -translate-x-1/2 w-2/3 h-6 sm:h-8 bg-gradient-to-r from-transparent via-black/10 to-transparent rounded-full blur-xl"
              animate={{
                scale: isHovering ? 1.2 : 1,
                opacity: isHovering ? 0.3 : 0.15,
              }}
              transition={{ duration: 0.3 }}
            />

            {/* Conteneur de l'image avec rotation */}
            <motion.div
              className="relative flex items-center justify-center"
              animate={{
                rotateY: rotation,
              }}
              transition={{
                duration: 0.8,
                ease: "easeInOut",
              }}
              style={{
                perspective: isMobile ? 600 : 1000,
                transformStyle: 'preserve-3d',
              }}
            >
              <AnimatePresence mode="wait">
                {currentImage && (
                  <motion.img
                    key={currentImage}
                    src={currentImage}
                    className={getImageClasses()}
                    initial={{ 
                      opacity: 0,
                      scale: 0.8,
                    }}
                    animate={{ 
                      opacity: 1,
                      scale: 1,
                    }}
                    exit={{ 
                      opacity: 0,
                      scale: 0.8,
                    }}
                    transition={{
                      opacity: {
                        duration: 0.5,
                        ease: "easeInOut"
                      },
                      scale: {
                        duration: 0.5,
                        ease: "easeInOut"
                      }
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Indicateur de progression - responsive */}
              {stage === 'rotation' && (
                <div className="absolute -bottom-10 sm:-bottom-12 left-1/2 transform -translate-x-1/2 flex gap-1.5 sm:gap-2">
                  {Array.from({ length: creations.length + 1 }).map((_, index) => {
                    const isActive = index === currentIndex + 1;
                    const isCompleted = index < currentIndex + 1;
                    return (
                      <motion.div
                        key={index}
                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-zinc-300"
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

              {/* Effet de brillance - désactivé sur mobile pour performance */}
              {!isMobile && (
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
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* Bouton Entrer - responsive */}
        <AnimatePresence>
          {showEnter && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              onClick={handleEnter}
              className="flex items-center gap-2 bg-black text-white px-6 py-3 sm:px-8 sm:py-3.5 rounded-full text-xs sm:text-sm font-medium uppercase tracking-widest hover:bg-zinc-800 transition-colors shadow-lg hover:shadow-xl"
            >
              Entrer
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}