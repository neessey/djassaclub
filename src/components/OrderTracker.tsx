import React, { useState } from "react";
import {
  Search,
  Loader2,
  CheckCircle2,
  Truck,
  Eye,
  PenTool,
  ShieldAlert,
  Package,
  Sparkles
} from "lucide-react";

import { getOrder } from "../firebase";
import { Order, TrackingStatus } from "../types";


export default function OrderTracker() {

  const [orderId,setOrderId] = useState("");
  const [loading,setLoading] = useState(false);
  const [order,setOrder] = useState<Order|null>(null);
  const [searched,setSearched] = useState(false);
  const [error,setError] = useState("");



  const handleTrack = async(
    e:React.FormEvent
  )=>{

    e.preventDefault();

    if(!orderId.trim()) return;


    setLoading(true);
    setError("");
    setSearched(true);
    setOrder(null);


    try{

      const result = await getOrder(
        orderId.trim()
      );


      if(result){

        setOrder(result);

      }else{

        setError(
          "Cette commande n'existe pas."
        );

      }


    }catch(err){

      console.error(err);

      setError(
        "Impossible de récupérer votre commande."
      );


    }finally{

      setLoading(false);

    }

  };





  const steps = [

    {
      status:"pending_fabrication",
      label:"Création validée",
      desc:"Votre design est enregistré dans notre atelier.",
      icon:PenTool
    },


    {
      status:"printing",
      label:"Fabrication textile",
      desc:"Votre pièce est actuellement personnalisée.",
      icon:Eye
    },


    {
      status:"quality_check",
      label:"Contrôle qualité",
      desc:"Chaque détail est vérifié avant expédition.",
      icon:CheckCircle2
    },


    {
      status:"shipping",
      label:"En livraison",
      desc:"Votre création quitte notre atelier.",
      icon:Truck
    },


    {
      status:"delivered",
      label:"Création livrée",
      desc:"Votre pièce unique est maintenant à vous.",
      icon:Package
    }

  ] as {
    status:TrackingStatus;
    label:string;
    desc:string;
    icon:any;
  }[];





  const getIndex=(status:TrackingStatus)=>
    steps.findIndex(
      item=>item.status===status
    );






  return (

<div

id="tracking"

className="
max-w-3xl

mx-auto

my-16

bg-white

border

border-red-100

rounded-[32px]

p-6

md:p-10

shadow-lg

overflow-hidden

relative

"

>


{/* glow très léger */}

<div

className="
absolute

top-0

right-0

w-72

h-72

bg-red-50/30

blur-3xl

rounded-full

"

/>





{/* HEADER */}


<div className="
text-center
relative
mb-10
">


<div

className="
inline-flex
items-center
gap-2

bg-red-50

text-red-400

px-4

py-2

rounded-full

text-[10px]

font-bold

uppercase

tracking-[0.25em]

mb-5

"

>

<Sparkles
className="w-3 h-3"
/>

Atelier Djassa

</div>




<h3

className="
text-3xl

md:text-4xl

font-black

text-gray-900

tracking-tight

"

>

Suivi de création

</h3>


<p

className="
text-sm

text-gray-400

mt-3

max-w-md

mx-auto

"

>

Suivez chaque étape de fabrication
de votre pièce personnalisée.

</p>


</div>







{/* SEARCH */}


<form

onSubmit={handleTrack}

className="
flex

flex-col

sm:flex-row

gap-3

mb-10

"

>


<div className="
relative
flex-1
">


<Search

className="
absolute

left-4

top-3.5

w-5

h-5

text-gray-400

"

/>



<input

value={orderId}

onChange={(e)=>
setOrderId(e.target.value)
}

placeholder="Votre numéro de commande"

className="
w-full

bg-gray-50

border

border-red-100

rounded-2xl

pl-12

pr-4

py-3.5

text-sm

text-gray-900

outline-none

focus:border-red-200

transition

placeholder:text-gray-400

"

/>


</div>




<button

disabled={
loading ||
!orderId.trim()
}

className="
bg-red-50

hover:bg-red-100

text-red-400

px-7

rounded-2xl

font-bold

text-sm

flex

items-center

justify-center

gap-2

transition

disabled:opacity-40

border

border-red-100

"

>


{
loading

?

<Loader2
className="
w-5
h-5
animate-spin
"
/>

:

<Search
className="w-4 h-4"
/>

}


Suivre


</button>


</form>








{/* LOADING */}


{
loading && (

<div

className="
py-12

flex

flex-col

items-center

text-gray-400

"

>


<Loader2

className="
w-10
h-10

animate-spin

text-red-300

mb-4

"

/>


<p className="
text-xs
tracking-widest
uppercase
text-gray-400
">

Analyse de votre création...

</p>


</div>

)

}








{/* ERROR */}


{
error && searched && !loading && (

<div

className="
bg-red-50

border

border-red-100

rounded-2xl

p-5

flex

gap-3

text-red-400

"

>


<ShieldAlert/>

<div>

<p className="font-bold text-red-500">

Commande introuvable

</p>


<p className="text-sm text-red-400">

{error}

</p>

</div>


</div>


)

}









{/* ORDER */}



{
order && !loading && (

<div className="space-y-10">


{/* INFO CARD */}


<div

className="
grid

grid-cols-1

md:grid-cols-3

gap-4

bg-gray-50

border

border-red-100

rounded-3xl

p-5

"

>


<div>

<p className="text-[10px] uppercase text-gray-400">
Commande
</p>

<p className="font-bold text-gray-900 font-bold">
{order.id}
</p>

</div>




<div>

<p className="text-[10px] uppercase text-gray-400">
Produit
</p>

<p className="text-red-400 font-bold uppercase">
{order.design.productType}
</p>

</div>




<div>

<p className="text-[10px] uppercase text-gray-400">
Créée le
</p>

<p className="text-gray-700">

{
new Date(
order.createdAt
)
.toLocaleDateString("fr-FR")

}

</p>

</div>



</div>








{/* TIMELINE */}


<div className="relative space-y-8">


<div

className="
absolute

left-5

top-5

bottom-5

w-[2px]

bg-red-100

"

/>



{

steps.map((step,index)=>{


const current =
getIndex(order.trackingStatus);


const done =
index < current;


const active =
index===current;



const Icon=step.icon;



return (

<div

key={step.status}

className="
relative

flex

gap-5

"

>


<div

className={`

w-11

h-11

rounded-full

flex

items-center

justify-center

z-10

border

transition


${
done

?

"bg-red-200 border-red-300 text-red-300"

:

active

?

"bg-red-100 border-red-300 text-red-400 shadow-sm shadow-red-100/50"

:

"bg-gray-50 border-gray-100 text-gray-300"

}

`}

>


<Icon className="w-5 h-5"/>


</div>




<div>

<h4

className={`

font-bold

uppercase

text-sm


${
active
?

"text-red-400"

:

done

?

"text-gray-800"

:

"text-gray-300"

}

`}

>

{step.label}

</h4>


<p className="text-xs text-gray-400 mt-1">

{step.desc}

</p>


</div>


</div>


)

})

}


</div>



</div>


)

}


</div>


);

}