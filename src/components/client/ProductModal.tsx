import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Star, 
  Info,
  ChevronRight,
  ChevronLeft,
  Box,
  Check
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF } from '@react-three/drei';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const [view3D, setView3D] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState<any[]>([]);
  const [removals, setRemovals] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Mock data for addons/removals (In a real app, these would come from the DB)
  const availableAddons = [
    { id: 1, nome: 'Bacon Extra', preco: 4.50 },
    { id: 2, nome: 'Queijo Cheddar', preco: 3.00 },
    { id: 3, nome: 'Hambúrguer 150g', preco: 8.00 },
    { id: 4, nome: 'Ovo Frito', preco: 2.50 },
  ];

  const availableRemovals = ['Cebola', 'Picles', 'Tomate', 'Alface', 'Maionese'];

  useEffect(() => {
    if (product) {
      setQuantity(1);
      setCurrentImage(0);
      setView3D(false);
      setSelectedAddons([]);
      setRemovals([]);
      setNotes('');
    }
  }, [product]);

  if (!product) return null;

  const handleAddToCart = () => {
    const addonsTotal = selectedAddons.reduce((acc, a) => acc + a.preco, 0);
    addItem({
      ...product,
      preco: product.preco + addonsTotal,
      quantidade: quantity,
      adicionais: selectedAddons,
      removidos: removals,
      observacoes: notes
    });
    toast.success(`${product.nome} adicionado ao carrinho!`);
    onClose();
  };

  const toggleAddon = (addon: any) => {
    if (selectedAddons.find(a => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter(a => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const toggleRemoval = (item: string) => {
    if (removals.includes(item)) {
      setRemovals(removals.filter(r => r !== item));
    } else {
      setRemovals([...removals, item]);
    }
  };

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[80]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 top-4 md:top-auto md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-5xl bg-background z-[90] rounded-t-[2.5rem] md:rounded-[2rem] overflow-hidden flex flex-col border-t border-white/10 max-h-[95vh]"
          >
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <div className="flex flex-col md:flex-row">
                {/* Media Section - Sticky on Desktop */}
                <div className="w-full md:w-1/2 md:sticky md:top-0 h-[40vh] md:h-[80vh] bg-surface overflow-hidden">
                  {view3D && product.modelo_3d_url ? (
                    <div className="w-full h-full">
                      <Canvas shadows camera={{ position: [0, 0, 5], fov: 50 }}>
                        <Stage environment="city" intensity={0.6}>
                          <Model url={product.modelo_3d_url} />
                        </Stage>
                        <OrbitControls autoRotate />
                      </Canvas>
                    </div>
                  ) : (
                    <div className="w-full h-full relative">
                      <img
                        src={product.imagens_url[currentImage] || 'https://picsum.photos/seed/burger/600'}
                        alt={product.nome}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-background/50" />
                      
                      {product.imagens_url.length > 1 && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                          {product.imagens_url.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentImage(idx)}
                              className={cn(
                                "w-2 h-2 rounded-full transition-all",
                                currentImage === idx ? "w-6 bg-primary" : "bg-white/30"
                              )}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={onClose}
                    className="absolute top-6 left-6 p-3 bg-black/60 backdrop-blur-xl rounded-full text-white hover:bg-primary hover:text-black transition-all z-20 border border-white/10"
                  >
                    <X size={24} />
                  </button>

                  {product.modelo_3d_url && (
                    <button
                      onClick={() => setView3D(!view3D)}
                      className={cn(
                        "absolute top-6 right-6 p-3 backdrop-blur-xl rounded-full transition-all flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest z-20 border border-white/10",
                        view3D ? "bg-primary text-black" : "bg-black/60 text-white"
                      )}
                    >
                      <Box size={18} />
                      {view3D ? 'Foto' : '3D'}
                    </button>
                  )}
                </div>

                {/* Content Section */}
                <div className="w-full md:w-1/2 p-6 md:p-10 space-y-10">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="text-4xl md:text-5xl font-display font-black text-white tracking-tighter italic uppercase leading-none">
                        {product.nome}
                      </h2>
                      {product.destaque && (
                        <div className="bg-primary/20 text-primary p-2 rounded-full shrink-0 border border-primary/30">
                          <Star size={20} fill="currentColor" />
                        </div>
                      )}
                    </div>
                    <p className="text-gray-400 text-lg leading-relaxed">
                      {product.descricao}
                    </p>
                    <div className="text-4xl font-bold text-primary tracking-tighter">
                      {formatCurrency(product.preco)}
                    </div>
                  </div>

                  {/* Addons Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Turbine seu lanche</h4>
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full font-bold uppercase">Opcional</span>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {availableAddons.map((addon) => (
                        <button
                          key={addon.id}
                          onClick={() => toggleAddon(addon)}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-2xl border transition-all group",
                            selectedAddons.find(a => a.id === addon.id) 
                              ? "bg-primary/10 border-primary text-primary" 
                              : "bg-surface border-white/5 text-gray-400 hover:border-primary/30"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-6 h-6 rounded-lg border flex items-center justify-center transition-all",
                              selectedAddons.find(a => a.id === addon.id) ? "bg-primary border-primary text-black" : "border-gray-700 group-hover:border-primary/50"
                            )}>
                              {selectedAddons.find(a => a.id === addon.id) && <Check size={16} strokeWidth={4} />}
                            </div>
                            <span className="font-bold text-base">{addon.nome}</span>
                          </div>
                          <span className="font-bold text-primary">+ {formatCurrency(addon.preco)}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Removals Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Retirar do lanche</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availableRemovals.map((item) => (
                        <button
                          key={item}
                          onClick={() => toggleRemoval(item)}
                          className={cn(
                            "px-5 py-2.5 rounded-xl border text-xs font-bold transition-all uppercase tracking-wider",
                            removals.includes(item) 
                              ? "bg-red-500/20 border-red-500 text-red-500" 
                              : "bg-surface border-white/5 text-gray-500 hover:border-red-500/30"
                          )}
                        >
                          Sem {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Observações</h4>
                    <textarea
                      placeholder="Alguma recomendação especial para o Chef?"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-surface border border-white/10 rounded-2xl p-5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all h-32 resize-none text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-6 md:p-8 bg-surface/80 backdrop-blur-xl border-t border-white/10 flex flex-col md:flex-row items-center gap-4">
              <div className="flex items-center gap-6 bg-background rounded-2xl p-1.5 border border-white/10 w-full md:w-auto justify-between md:justify-start">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  <Minus size={24} />
                </button>
                <span className="text-2xl font-display font-bold w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 flex items-center justify-center text-primary hover:text-white transition-colors"
                >
                  <Plus size={24} />
                </button>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={!product.disponivel}
                className="w-full md:flex-1 h-16 text-xl gap-3 font-black italic uppercase tracking-tighter"
              >
                <ShoppingBag size={28} />
                Adicionar {formatCurrency((product.preco + selectedAddons.reduce((acc, a) => acc + a.preco, 0)) * quantity)}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
