import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, ArrowDown } from "lucide-react";

interface HeroProps {
  onStartCustomizer: () => void;
}

export default function Hero({ onStartCustomizer }: HeroProps) {
  const words = [
    "TON IDÉE.",
    "TON STYLE.",
    "TA CRÉATION."
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2800);

    return () => clearInterval(timer);
  }, []);

  return (
    <section
      className="
      relative 
      min-h-screen
      overflow-hidden
      bg-black
      flex
      items-center
      "
    >

      {/* ================= VIDÉO DE FOND ================= */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="
          absolute
          inset-0
          w-full
          h-full
          object-cover
          z-0
        "
      >
        <source src="/assets/hero.mp4" type="video/mp4" />
        {/* Fallback si la vidéo ne charge pas */}
        <div className="absolute inset-0 bg-black/80" />
      </video>

      {/* ================= OVERLAY GRADIENT ================= */}
      <div
        className="
          absolute
          inset-0
          z-10
          bg-gradient-to-b
          from-black/70
          via-black/50
          to-black/80
        "
      />

      {/* ================= OVERLAY SUPPLEMENTAIRE ================= */}
      <div
        className="
          absolute
          inset-0
          z-10
          bg-gradient-to-r
          from-black/40
          via-transparent
          to-black/20
        "
      />

      {/* Grand texte arrière-plan (optionnel) */}
      <div
        className="
        absolute
        top-1/2
        left-1/2
        -translate-x-1/2
        -translate-y-1/2
        text-[18rem]
        md:text-[25rem]
        font-black
        tracking-tighter
        text-white/[0.03]
        select-none
        pointer-events-none
        z-10
        "
      >
        DJASSA
      </div>

      <div
        className="
        relative
        z-20
        max-w-7xl
        mx-auto
        w-full
        px-6
        md:px-12
        grid
        grid-cols-1
        lg:grid-cols-2
        gap-10
        items-center
        "
      >

        {/* ================= TEXTE ================= */}
        <div className="space-y-8">

          <AnimatePresence mode="wait">
            <motion.h1
              key={words[index]}
              initial={{
                opacity: 0,
                y: 40,
                filter: "blur(15px)"
              }}
              animate={{
                opacity: 1,
                y: 0,
                filter: "blur(0px)"
              }}
              exit={{
                opacity: 0,
                y: -40,
                filter: "blur(15px)"
              }}
              transition={{
                duration: 0.8
              }}
              className={`
                text-6xl
                md:text-8xl
                font-black
                tracking-tighter
                leading-[0.9]
                ${words[index] === "TA CRÉATION." ? "text-red-500" : "text-white"}
              `}
            >
              {words[index]}
            </motion.h1>
          </AnimatePresence>

          <p
            className="
            max-w-md
            text-white/70
            text-lg
            leading-relaxed
            "
          >
            Transforme tes idées en pièces uniques.
            Crée ton vêtement, choisis ton design,
            porte une création qui te ressemble.
          </p>

          <motion.button
            onClick={onStartCustomizer}
            whileHover={{
              scale: 1.03
            }}
            whileTap={{
              scale: 0.97
            }}
            className="
            group
            flex
            items-center
            gap-3
            border
            border-white/30
            bg-white/10
            backdrop-blur-sm
            px-8
            py-4
            rounded-full
            text-sm
            uppercase
            tracking-widest
            font-medium
            text-white
            hover:bg-white
            hover:text-black
            hover:border-white
            transition-all
            "
          >
            Créer mon produit
            <ChevronRight
              className="
              w-4
              h-4
              group-hover:translate-x-1
              transition-transform
              "
            />
          </motion.button>

        </div>

        {/* ================= ESPACE POUR LE T-SHIRT (optionnel) ================= */}
        <div
          className="
          flex
          justify-center
          items-center
          "
        >
          {/* Ici tu peux garder le t-shirt ou le retirer */}
          {/* Si tu veux garder le t-shirt, décommente le code ci-dessous */}
          {/*
          <motion.div
            animate={{
              y: [0, -18, 0],
              rotateZ: [0, 2, 0]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="
            relative
            w-[320px]
            md:w-[450px]
            "
          >
            <div
              className="
              absolute
              bottom-0
              left-1/2
              -translate-x-1/2
              w-2/3
              h-10
              bg-black/30
              blur-3xl
              "
            />
            <img
              src="/assets/intro.png"
              alt="T-shirt Djassa"
              className="
              relative
              w-full
              object-contain
              drop-shadow-2xl
              "
            />
          </motion.div>
          */}
        </div>

      </div>

    </section>
  );
}