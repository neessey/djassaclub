import { useState } from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  Eye,
  Package,
  PenTool,
  Truck
} from "lucide-react";

export default function WhyDjassa() {

  const steps = [
    {
      number: "01",
      title: "Imaginez",
      subtitle: "Votre idée prend forme",
      text: "Choisissez votre pièce, ajoutez vos visuels, vos textes ou vos symboles. Votre imagination devient un design unique.",
      icon: PenTool
    },
    {
      number: "02",
      title: "Personnalisez",
      subtitle: "Un studio entre vos mains",
      text: "Modifiez couleurs, positions et détails jusqu'à obtenir une création qui vous ressemble.",
      icon: Eye
    },
    {
      number: "03",
      title: "Fabrication",
      subtitle: "Une finition premium",
      text: "Chaque pièce est imprimée et contrôlée avec soin dans notre atelier pour garantir un rendu exceptionnel.",
      icon: Sparkles
    },
    {
      number: "04",
      title: "Livraison",
      subtitle: "Votre création arrive",
      text: "Votre pièce est préparée, emballée et expédiée rapidement partout en Côte d'Ivoire.",
      icon: Truck
    }
  ];


  return (
    <section
      className="
      bg-white
      py-28
      px-6
      border-t
      border-zinc-100
      "
    >

      <div className="max-w-6xl mx-auto">


        {/* TITLE */}

        <div className="mb-20 text-center">

          <span
            className="
            text-[10px]
            tracking-[0.5em]
            uppercase
            text-brand-red
            font-bold
            "
          >
            L'expérience Djassa
          </span>


          <h2
            className="
            mt-5
            font-syne
            font-black
            text-4xl
            md:text-6xl
            tracking-tighter
            uppercase
            text-zinc-900
            "
          >
            De l'idée
            <br />

            <span className="text-brand-red">
              au vêtement.
            </span>

          </h2>


          <p
            className="
            mt-6
            max-w-xl
            mx-auto
            text-zinc-500
            text-sm
            leading-relaxed
            "
          >
            Un processus pensé comme un véritable studio créatif.
            Vous imaginez, nous donnons vie.
          </p>

        </div>



        {/* PROCESS */}

        <div
          className="
          relative
          "
        >

          {/* Ligne */}

          <div
            className="
            hidden
            md:block
            absolute
            top-8
            left-0
            right-0
            h-px
            bg-zinc-200
            "
          />



          <div
            className="
            grid
            md:grid-cols-4
            gap-10
            "
          >

          {steps.map((step,index)=>{

            const Icon = step.icon;


            return (

              <motion.div

              key={step.number}

              initial={{
                opacity:0,
                y:30
              }}

              whileInView={{
                opacity:1,
                y:0
              }}

              viewport={{
                once:true
              }}

              transition={{
                delay:index*0.15
              }}

              className="
              relative
              text-center
              "
              >


                {/* NUMBER */}

                <div
                className="
                relative
                mx-auto
                w-16
                h-16
                rounded-full
                bg-white
                border
                border-zinc-200
                flex
                items-center
                justify-center
                z-10
                "
                >

                  <Icon
                  className="
                  w-6
                  h-6
                  text-brand-red
                  "
                  />

                </div>



                <span
                className="
                block
                mt-6
                text-[10px]
                font-bold
                tracking-widest
                text-zinc-400
                "
                >
                  {step.number}
                </span>


                <h3
                className="
                mt-3
                font-syne
                font-bold
                uppercase
                text-xl
                "
                >
                  {step.title}
                </h3>


                <p
                className="
                mt-2
                text-xs
                uppercase
                tracking-widest
                text-brand-red
                "
                >
                  {step.subtitle}
                </p>


                <p
                className="
                mt-4
                text-sm
                leading-relaxed
                text-zinc-500
                "
                >
                  {step.text}
                </p>


              </motion.div>

            )

          })}

          </div>

        </div>


      </div>


    </section>
  );
}