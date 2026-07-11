import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Landmark, PhoneCall, CreditCard, X, Menu, ChevronRight } from 'lucide-react';
import { ProductType, CustomElement } from './types';

// Component Imports
import Cursor from './components/Cursor';
import Hero from './components/Hero';
import Categories from './components/Categories';
import Customizer from './components/Customizer';
import Unique from './pages/unique';
import ProductPage from './components/ProductPage';
import Gallery from './components/Gallery';
import OrderTracker from './components/OrderTracker';
import IntroLoader from './components/IntroLoader';
import WhyDjassa from './components/WhyDjassa';

export default function App() {
  const [showIntro, setShowIntro] = useState(true);

  // Remix or Preset Session States
  const [customizerKey, setCustomizerKey] = useState<string>('default-studio');
  const [initialProductType, setInitialProductType] = useState<ProductType>('t-shirt');
  const [initialColor, setInitialColor] = useState<string>('#111111');
  const [initialElements, setInitialElements] = useState<CustomElement[]>([]);
  const [mobileMenu, setMobileMenu] = useState(false);
  // Tracked order ID for immediate tracking lookup
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);

  // Le studio de personnalisation ne s'affiche plus par défaut : il n'apparaît
  // qu'après un clic sur "Ajouter & Créer" / "Personnaliser" (Categories),
  // "Remix" (Gallery), ou les CTA "Créer" / "Atelier" de la nav et du Hero.
  const [showStudio, setShowStudio] = useState(false);
  const [showUnique, setShowUnique] = useState(false);

  // Scroll references
  const studioRef = useRef<HTMLDivElement | null>(null);
  const trackingRef = useRef<HTMLDivElement | null>(null);
  const uniqueRef = useRef<HTMLDivElement | null>(null);

  // Disable scrolling while intro is active
  useEffect(() => {
    if (showIntro) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showIntro]);

  const scrollToSection = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Le Customizer n'est monté dans le DOM que lorsque showStudio passe à true,
  // donc l'élément #studio n'existe pas encore au moment du clic : on attend
  // le prochain rendu avant de scroller vers lui.
  useEffect(() => {
    if (!showStudio) return;
    const t = setTimeout(() => scrollToSection('studio'), 60);
    return () => clearTimeout(t);
  }, [showStudio, customizerKey]);

  // Scroll vers Unique
  useEffect(() => {
    if (!showUnique) return;
    const t = setTimeout(() => scrollToSection('unique'), 60);
    return () => clearTimeout(t);
  }, [showUnique]);

  // Ouvre le studio (le rend visible)
  const openStudio = () => {
    setShowStudio(true);
    setShowUnique(false);
  };

  // Ouvre la page Unique
  const openUnique = () => {
    setShowUnique(true);
    setShowStudio(false);
  };

  // Ferme le studio et renvoie l'utilisateur vers le catalogue de supports
  const closeStudio = () => {
    setShowStudio(false);
    setTimeout(() => scrollToSection('categories'), 60);
  };

  // Ferme Unique et renvoie vers le catalogue
  const closeUnique = () => {
    setShowUnique(false);
    setTimeout(() => scrollToSection('categories'), 60);
  };

  // Handler when clicking a category base template
  const handleSelectCategory = (type: ProductType) => {
    setInitialProductType(type);
    // Reset elements on category switch
    setInitialElements([]);
    setCustomizerKey(`cat-${type}-${Date.now()}`);
    setShowStudio(true);
    setShowUnique(false);
  };

  // Handler when clicking "Remix" in the community gallery
  const handleRemix = (type: ProductType, color: string, elements: CustomElement[]) => {
    setInitialProductType(type);
    setInitialColor(color);
    setInitialElements(elements);
    setCustomizerKey(`remix-${Date.now()}`);
    setShowStudio(true);
    setShowUnique(false);
  };

  // Handler when payment successfully completes in Checkout
  const handleOrderSuccess = (orderId: string) => {
    setSuccessOrderId(orderId);
    
    // Smoothly scroll down to the Order Tracker section after a small delay
    setTimeout(() => {
      scrollToSection('tracking');
      // pre-fill the order id in tracker input if possible by passing or just letting them know
    }, 1500);
  };

  return (
    <div className="relative min-h-screen bg-white text-zinc-900 font-sans overflow-x-hidden selection:bg-brand-red selection:text-white">
      
      {/* 0. Cinematic Intro Loader Portal */}
      <AnimatePresence>
        {showIntro && (
          <IntroLoader onComplete={() => setShowIntro(false)} />
        )}
      </AnimatePresence>

      {/* 1. Custom circle magnetic follow-cursor */}
      <Cursor />

      {/* 2. PREMIUM DESKTOP NAVIGATION BAR */}
      <header
        className="
          fixed
          top-0
          left-0
          w-full
          z-50
          bg-white/80
          backdrop-blur-xl
          border-b
          border-zinc-100
        "
      >
        <div
          className="
            max-w-7xl
            mx-auto
            px-5
            md:px-8
            h-20
            flex
            items-center
            justify-between
          "
        >

          {/* LOGO */}
          <div
            onClick={() => {
              scrollToSection('home');
              setShowStudio(false);
              setShowUnique(false);
            }}
            className="cursor-pointer select-none"
          >
            <img
              src="/assets/logo.png"
              alt="Djassa Club"
              className="
                w-[115px]
                md:w-[150px]
                h-auto
                object-contain
              "
            />
          </div>

          {/* DESKTOP MENU */}
          <nav
            className="
              hidden
              lg:flex
              items-center
              gap-10
            "
          >
            {[
              ["Catalogue", "categories"],
              ["Unique", "unique"]
            ].map(([label, id]) => (
              <button
                key={id}
                onClick={() => {
                  if (id === 'unique') {
                    openUnique();
                  } else {
                    scrollToSection(id);
                    setShowStudio(false);
                    setShowUnique(false);
                  }
                }}
                className="
                  text-[11px]
                  uppercase
                  tracking-[0.25em]
                  text-zinc-500
                  hover:text-black
                  transition
                "
              >
                {label}
              </button>
            ))}

          </nav>

          {/* ACTION DESKTOP */}
          <button
            onClick={openStudio}
            className="
              hidden
              md:flex
              items-center
              gap-3
              rounded-full
              border
              border-zinc-900
              px-6
              py-3
              text-[10px]
              uppercase
              tracking-[0.25em]
              hover:bg-black
              hover:text-white
              transition-all
            "
          >
            Créer
            <ChevronRight className="w-3 h-3"/>
          </button>

          {/* MOBILE BUTTON */}
          <button
            className="
              lg:hidden
              flex
              items-center
              justify-center
            "
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            {mobileMenu ? (
              <X className="w-6 h-6"/>
            ) : (
              <Menu className="w-6 h-6 text-gray-500"/>
            )}
          </button>

        </div>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0
              }}
              animate={{
                opacity: 1,
                height: "auto"
              }}
              exit={{
                opacity: 0,
                height: 0
              }}
              className="
                lg:hidden
                border-t
                border-zinc-100
                bg-white
                overflow-hidden
              "
            >
              <div
                className="
                  flex
                  flex-col
                  gap-6
                  px-6
                  py-8
                "
              >
                {[
                  ["Catalogue", "categories"],
                  ["Unique", "unique"]
                ].map(([label, id]) => (
                  <button
                    key={id}
                    onClick={() => {
                      if (id === 'unique') {
                        openUnique();
                      } else {
                        scrollToSection(id);
                        setShowStudio(false);
                        setShowUnique(false);
                      }
                      setMobileMenu(false);
                    }}
                    className="
                      text-left
                      text-sm
                      uppercase
                      tracking-widest
                      text-zinc-600
                    "
                  >
                    {label}
                  </button>
                ))}

               

                <button
                  onClick={() => {
                    openStudio();
                    setMobileMenu(false);
                  }}
                  className="
                    bg-black
                    text-white
                    rounded-full
                    py-4
                    uppercase
                    tracking-widest
                    text-xs
                  "
                >
                  Créer mon produit
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 3. CORE APP SECTIONS CONTAINER */}
      <main 
        id="home"
        className="pt-20"
      >        
        {/* Dynamic top banner alert when order completes */}
        <AnimatePresence>
          {successOrderId && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-emerald-500/10 border-b border-emerald-500/30 text-emerald-500 px-6 py-3 text-center text-xs font-bold tracking-wider"
            >
              🎉 COMMANDE VALIDÉE AVEC SUCCÈS : <strong className="underline text-white">{successOrderId}</strong>. Défilement automatique vers le tracker en direct...
            </motion.div>
          )}
        </AnimatePresence>

        {/* SECTION 1: HERO CONTAINER */}
        <Hero onStartCustomizer={openStudio} />

        <WhyDjassa />
 
        {/* SECTION 2: CATEGORIES BASE SELECTION */}
        <Categories onSelectCategory={handleSelectCategory} />

        {/* SECTION 3: UNIQUE PAGE - PACK PREMIUM */}
        <AnimatePresence>
          {showUnique && (
            <motion.div
              ref={uniqueRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              id="unique"
            >
              <Unique
                onOrderSuccess={handleOrderSuccess}
                onBackToCategories={closeUnique}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* SECTION 4: CORE STREETWEAR DESIGN STUDIO CUSTOMIZER */}
        <AnimatePresence>
          {showStudio && (
            <motion.div
              ref={studioRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              id="studio"
            >
              <Customizer
                key={customizerKey}
                initialProductType={initialProductType}
                onOrderSuccess={handleOrderSuccess}
                onBackToCategories={closeStudio}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 4. FOOTER */}
      <footer className="bg-zinc-50 border-t border-zinc-200 py-16 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center space-y-10 relative z-10">
          
          {/* Main big display phrase as requested */}
          <h2 className="font-syne font-extrabold text-3xl md:text-5xl tracking-tighter text-black/50 max-w-2xl leading-tight">
            La créativité mérite mieux <br />
            <span className="text-brand-red uppercase">qu'un simple imprimé.</span>
          </h2>

          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest max-w-md">
            Crée votre design unique des maintenant avec notre pack premium de personnalisation.
          </p>

          <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
            <button
              onClick={openUnique}
              className="
                bg-gradient-to-r
                from-yellow-500
                to-yellow-400
                text-white
                rounded-full
                py-4
                px-8
                uppercase
                tracking-widest
                text-xs
                font-bold
                hover:from-yellow-600
                hover:to-yellow-500
                transition-all
                shadow-lg
                shadow-yellow-500/25
              "
            >
              Pack Premium — Création Unique
            </button>
            <button
              onClick={() => scrollToSection('categories')}
              className="
                bg-black
                text-white
                rounded-full
                py-4
                px-8
                uppercase
                tracking-widest
                text-xs
                hover:bg-zinc-900
                transition-colors
              "
            >
              Voir le catalogue
            </button>
          </div>

          <div className="pt-8 border-t border-zinc-200 w-full text-zinc-500 text-[10px] font-bold flex flex-col md:flex-row justify-between items-center gap-4">
            <span>© 2026 DJASSACLUB INC. TOUS DROITS RÉSERVÉS.</span>
          </div>

        </div>
      </footer>

    </div>
  );
}