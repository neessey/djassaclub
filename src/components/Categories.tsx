import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, Sparkles, ShoppingBag, Trash2, X } from 'lucide-react';
import { ProductType } from '../types';

interface CategoriesProps {
  onSelectCategory: (type: ProductType) => void;
}

// Un article du panier a besoin d'un identifiant propre (cartId) en plus du
// type de produit, sinon impossible de distinguer/supprimer deux articles
// identiques (ex: 2x T-Shirt) ajoutés séparément.
interface CartEntry {
  cartId: string;
  productId: ProductType;
}

export default function Categories({ onSelectCategory }: CategoriesProps) {

  const [hovered, setHovered] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartEntry[]>([]);
  const [showCartAlert, setShowCartAlert] = useState(false);
  const [showCartPanel, setShowCartPanel] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  // ⚠️ Les `id` ci-dessous doivent être EXACTEMENT les mêmes que les `type` du
  // PRODUCT_TEMPLATES dans Customizer.tsx, sinon le support choisi ici ne sera
  // pas retrouvé côté Customizer (c'était le cas pour 'tote' et 'card').
  // Les `price` sont alignés sur les prix réels de Customizer.tsx (le Tote Bag
  // affichait 4 500 FCFA ici mais valait 9 500 FCFA côté Customizer — corrigé).
  const categories = [
    {
      id: 't-shirt' as ProductType,
      title: 'T-Shirt',
      price: 10000,
      image: '/assets/tshirt.jpg',
      desc: 'Coton premium heavyweight, coupe structurée.'
    },
    {
      id: 'sweat' as ProductType,
      title: 'Sweat',
      price: 10000,
      image: '/assets/sweat.jpg',
      desc: 'Sweat léger, idéal pour les superpositions.'
    },
    {
      id: 'magazine' as ProductType,
      title: 'Magazine',
      price: 13000,
      image: '/assets/magazine.jpg',
      desc: 'Vos créations dans une édition papier.'
    },
    {
      id: 'frame' as ProductType, // aligné avec Customizer (était 'card')
      title: 'Cadre',
      price: 3000,
      image: '/assets/cadre.jpg',
      desc: 'Cadre en bois avec verre protecteur.'
    },
    {
      id: 'tote-bag' as ProductType, // aligné avec Customizer (était 'tote')
      title: 'Tote Bag',
      price: 7000,
      image: '/assets/tote.jpg',
      desc: 'Sac à bandoulière en coton biologique.'
    }
  ];

  const formatPrice = (value: number) => `${value.toLocaleString('fr-FR')} FCFA`;

  // Ajouter au panier et ouvrir le customizer
  const addToCartAndCustomize = (productId: ProductType) => {
    // Ajouter au panier avec un cartId unique (permet les doublons + suppression ciblée)
    const entry: CartEntry = { cartId: `${productId}-${Date.now()}`, productId };
    setCartItems(prev => [...prev, entry]);
    setLastAdded(productId);

    // Afficher l'alerte
    setShowCartAlert(true);
    setTimeout(() => setShowCartAlert(false), 2000);

    // Rediriger vers le customizer
    setTimeout(() => {
      onSelectCategory(productId);
    }, 300);
  };

  // Retirer un article précis du panier (par cartId, pas par type — sinon un
  // doublon supprimerait le mauvais article)
  const removeFromCart = (cartId: string) => {
    setCartItems(prev => prev.filter(item => item.cartId !== cartId));
  };

  // Obtenir le nom du dernier produit ajouté
  const getLastAddedName = () => {
    const product = categories.find(c => c.id === lastAdded);
    return product ? product.title : '';
  };

  const getProductInfo = (type: ProductType) => categories.find(c => c.id === type);

  const cartTotal = cartItems.reduce((total, item) => {
    const product = getProductInfo(item.productId);
    return total + (product?.price || 0);
  }, 0);

  return (
    <section
      id="categories"
      className="bg-[#fafafa] py-28 px-6 relative"
    >

      {/* Panier flottant — navigable : clic pour ouvrir/fermer, suppression par article */}
      <div className="fixed top-24 right-6 z-50">
        <div className="relative">
          <button
            onClick={() => setShowCartPanel(prev => !prev)}
            className="bg-white border border-zinc-200 rounded-full px-4 py-2 shadow-lg flex items-center gap-2 hover:shadow-xl transition"
          >
            <ShoppingBag className="w-5 h-5 text-black" />
            <span className="text-sm font-medium text-black">{cartItems.length}</span>
          </button>

          {/* Alerte de confirmation d'ajout */}
          <AnimatePresence>
            {showCartAlert && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                className="absolute top-full mt-2 right-0 bg-black text-white px-4 py-2 rounded-xl text-xs whitespace-nowrap shadow-xl"
              >
                {getLastAddedName()} ajouté au panier ✨
              </motion.div>
            )}
          </AnimatePresence>

          {/* Panneau du panier : liste des articles, navigation vers le studio, suppression */}
          <AnimatePresence>
            {showCartPanel && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute top-full right-0 mt-2 bg-white border border-zinc-200 rounded-2xl shadow-2xl p-4 min-w-[300px] max-w-[340px]"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-sm text-black">Mon panier</span>
                  <button onClick={() => setShowCartPanel(false)} className="text-zinc-400 hover:text-zinc-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {cartItems.length === 0 ? (
                  <p className="text-xs text-zinc-400 py-4 text-center">
                    Votre panier est vide pour l'instant.
                  </p>
                ) : (
                  <>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {cartItems.map((item) => {
                        const product = getProductInfo(item.productId);
                        if (!product) return null;
                        return (
                          <div
                            key={item.cartId}
                            className="flex items-center justify-between bg-zinc-50 hover:bg-zinc-100 rounded-xl p-2 transition"
                          >
                            {/* Cliquer sur l'article navigue directement vers son studio de personnalisation */}
                            <button
                              onClick={() => {
                                setShowCartPanel(false);
                                onSelectCategory(item.productId);
                              }}
                              className="flex-1 text-left flex items-center gap-2"
                            >
                              <span className="text-sm font-medium text-black">{product.title}</span>
                              <span className="text-xs text-zinc-500">{formatPrice(product.price)}</span>
                            </button>
                            <button
                              onClick={() => removeFromCart(item.cartId)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Retirer du panier"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    <div className="border-t border-zinc-200 mt-3 pt-3 flex justify-between font-bold text-sm text-black">
                      <span>Total</span>
                      <span>{formatPrice(cartTotal)}</span>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-zinc-400">
              <Sparkles className="w-3 h-3"/>
              Collection
            </div>
            <h2 className="mt-4 text-4xl md:text-6xl font-black tracking-tighter text-black">
              Choisissez<br/>
              votre support.
            </h2>
          </div>

          <p className="max-w-sm text-zinc-500 text-sm leading-relaxed">
            Sélectionnez une pièce vierge, ajoutez-la au panier et personnalisez-la directement dans notre studio.
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {categories.map((cat) => (
            <motion.div
              key={cat.id}
              onMouseEnter={() => setHovered(cat.id)}
              onMouseLeave={() => setHovered(null)}
              whileHover={{ y: -8 }}
              className="group cursor-pointer bg-white rounded-3xl border border-zinc-200 overflow-hidden"
            >
              {/* IMAGE */}
              <div className="aspect-square overflow-hidden relative">
                <motion.img
                  src={cat.image}
                  alt={cat.title}
                  animate={{
                    scale: hovered === cat.id ? 1.05 : 1
                  }}
                  transition={{ duration: 0.6 }}
                  className="w-full h-full object-cover"
                />

                <div className="absolute bottom-5 right-5 bg-white text-red-500 px-4 py-2 rounded-full text-xs font-medium shadow-sm">
                  {formatPrice(cat.price)}
                </div>
              </div>

              {/* TEXT */}
              <div className="p-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl text-black font-semibold tracking-tight">
                    {cat.title}
                  </h3>
                </div>

                <p className="mt-3 text-sm text-zinc-500">
                  {cat.desc}
                </p>

                {/* Boutons d'action */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => addToCartAndCustomize(cat.id)}
                    className="flex-1 bg-black hover:bg-gray-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Ajouter & Créer
                  </button>

                  <button
                    onClick={() => onSelectCategory(cat.id)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-xl transition-all"
                  >
                    Personnaliser
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

        </div>

        {/* Indicateur du panier en bas */}
        {cartItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-zinc-500">
              {cartItems.length} produit{cartItems.length > 1 ? 's' : ''} dans le panier
            </p>
          </motion.div>
        )}

      </div>
    </section>
  );
}