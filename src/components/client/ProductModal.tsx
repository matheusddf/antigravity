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
  Check,
  Zap,
  MessageSquare
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
            className="fixed inset-x-0 bottom-0 top-4 md:top-auto md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-5xl bg-background z-[90] rounded-t-[2.5rem] md:rounded-[2rem] overflow-hidden flex flex-col border-t border-white/10 max-h-[95vh] shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
          >
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <div className="flex flex-col md:flex-row min-h-full">
                {/* Media Section - Sticky on Desktop */}
                <div className="w-full md:w-1/2 md:sticky md:top-0 h-[45vh] md:h-auto bg-surface overflow-hidden group">
                  {view3D && product.modelo_3d_url ? (
                    <div className="w-full h-full bg-gradient-to-b from-surface to-background">
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
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      {/* Futuristic Overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-background/80" />
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-pulse" />
                      
                      {product.imagens_url.length > 1 && (
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                          {product.imagens_url.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentImage(idx)}
                              className={cn(
                                "w-2.5 h-2.5 rounded-full transition-all duration-300",
                                currentImage === idx ? "w-8 bg-primary shadow-[0_0_10px_rgba(255,165,0,0.8)]" : "bg-white/20 hover:bg-white/40"
                              )}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Top Actions */}
                  <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
                    <button
                      onClick={onClose}
                      className="p-3 bg-black/60 backdrop-blur-xl rounded-2xl text-white hover:bg-primary hover:text-black transition-all border border-white/10 shadow-xl group/btn"
                    >
                      <X size={24} className="group-hover/btn:rotate-90 transition-transform" />
                    </button>

                    {product.modelo_3d_url && (
                      <button
                        onClick={() => setView3D(!view3D)}
                        className={cn(
                          "px-5 py-3 backdrop-blur-xl rounded-2xl transition-all flex items-center gap-3 font-display font-black text-[10px] uppercase tracking-[0.2em] border border-white/10 shadow-xl",
                          view3D ? "bg-primary text-black" : "bg-black/60 text-white hover:bg-white/10"
                        )}
                      >
                        <Box size={18} />
                        {view3D ? 'Foto' : '3D View'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Content Section */}
                <div className="w-full md:w-1/2 p-8 md:p-12 space-y-12 bg-background/50 backdrop-blur-sm">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Premium Selection</span>
                        <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
                      </div>
                      <div className="flex items-start justify-between gap-6">
                        <h2 className="text-5xl md:text-6xl font-display font-black text-white tracking-tighter italic uppercase leading-[0.85]">
                          {product.nome}
                        </h2>
                        {product.destaque && (
                          <div className="bg-primary/20 text-primary p-3 rounded-2xl shrink-0 border border-primary/30 animate-pulse">
                            <Star size={24} fill="currentColor" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-400 text-lg leading-relaxed font-medium">
                      {product.descricao}
                    </p>

                    <div className="flex items-baseline gap-4">
                      <span className="text-sm font-black text-primary/40 uppercase tracking-widest">Valor</span>
                      <div className="text-5xl font-display font-black text-primary tracking-tighter italic">
                        {formatCurrency(product.preco)}
                      </div>
                    </div>
                  </div>

                  {/* Addons Section */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <div className="flex items-center gap-3">
                        <Zap size={18} className="text-primary" />
                        <h4 className="text-sm font-black text-white uppercase tracking-[0.2em]">Turbine seu lanche</h4>
                      </div>
                      <span className="text-[10px] bg-primary/10 text-primary px-3 py-1 rounded-full font-black uppercase tracking-wider border border-primary/20">Opcional</span>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {availableAddons.map((addon) => (
                        <button
                          key={addon.id}
                          onClick={() => toggleAddon(addon)}
                          className={cn(
                            "flex items-center justify-between p-5 rounded-[1.5rem] border transition-all duration-300 group relative overflow-hidden",
                            selectedAddons.find(a => a.id === addon.id) 
                              ? "bg-primary/10 border-primary text-primary shadow-[0_0_20px_rgba(255,165,0,0.1)]" 
                              : "bg-surface/50 border-white/5 text-gray-400 hover:border-primary/30 hover:bg-surface"
                          )}
                        >
                          <div className="flex items-center gap-5 relative z-10">
                            <div className={cn(
                              "w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all duration-300",
                              selectedAddons.find(a => a.id === addon.id) ? "bg-primary border-primary text-black" : "border-gray-700 group-hover:border-primary/50"
                            )}>
                              {selectedAddons.find(a => a.id === addon.id) && <Check size={18} strokeWidth={4} />}
                            </div>
                            <span className="font-black text-lg italic uppercase tracking-tight">{addon.nome}</span>
                          </div>
                          <span className="font-black text-primary relative z-10">+ {formatCurrency(addon.preco)}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Removals Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                      <Minus size={18} className="text-red-500" />
                      <h4 className="text-sm font-black text-white uppercase tracking-[0.2em]">Retirar do lanche</h4>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {availableRemovals.map((item) => (
                        <button
                          key={item}
                          onClick={() => toggleRemoval(item)}
                          className={cn(
                            "px-6 py-3 rounded-2xl border text-[11px] font-black transition-all uppercase tracking-[0.15em] italic",
                            removals.includes(item) 
                              ? "bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]" 
                              : "bg-surface/50 border-white/5 text-gray-500 hover:border-red-500/30"
                          )}
                        >
                          Sem {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 ml-1">
                      <MessageSquare size={16} className="text-gray-500" />
                      <h4 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Observações</h4>
                    </div>
                    <textarea
                      placeholder="Alguma recomendação especial para o Chef?"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-surface/50 border border-white/10 rounded-[1.5rem] p-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all h-36 resize-none text-sm font-medium placeholder:text-gray-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-8 md:p-10 bg-surface/90 backdrop-blur-2xl border-t border-white/10 flex flex-col md:flex-row items-center gap-6">
              <div className="flex items-center gap-8 bg-background/50 rounded-[1.5rem] p-2 border border-white/10 w-full md:w-auto justify-between md:justify-start">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-14 h-14 flex items-center justify-center text-gray-500 hover:text-white transition-colors rounded-xl hover:bg-white/5"
                >
                  <Minus size={28} />
                </button>
                <span className="text-3xl font-display font-black italic w-10 text-center text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-14 h-14 flex items-center justify-center text-primary hover:text-white transition-colors rounded-xl hover:bg-primary/10"
                >
                  <Plus size={28} />
                </button>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={!product.disponivel}
                className="w-full md:flex-1 h-20 text-2xl gap-4 font-black italic uppercase tracking-tighter shadow-[0_10px_30px_rgba(255,165,0,0.3)]"
              >
                <ShoppingBag size={32} />
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
