import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  Truck, 
  Store, 
  CreditCard, 
  DollarSign,
  MapPin,
  Phone,
  User,
  MessageSquare,
  ChevronRight,
  ArrowLeft,
  Zap
} from 'lucide-react';
import { formatCurrency, generateWhatsAppLink } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'cart' | 'delivery' | 'payment' | 'review';

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();
  const { config, deliveryAreas } = useStore();
  const [step, setStep] = useState<Step>('cart');
  const [loading, setLoading] = useState(false);

  // Form State
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [changeFor, setChangeFor] = useState('');
  const [notes, setNotes] = useState('');

  const deliveryFee = deliveryType === 'delivery' 
    ? (deliveryAreas.find(a => a.bairro === neighborhood)?.valor || 0)
    : 0;

  const finalTotal = total + deliveryFee;

  useEffect(() => {
    if (!isOpen) {
      setStep('cart');
    }
  }, [isOpen]);

  const handleCheckout = async () => {
    if (!customerName || !customerPhone || (deliveryType === 'delivery' && (!address || !neighborhood)) || !paymentMethod) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        nome_cliente: customerName,
        telefone: customerPhone,
        tipo_entrega: deliveryType,
        endereco: address,
        bairro: neighborhood,
        forma_pagamento: paymentMethod,
        troco: changeFor ? parseFloat(changeFor) : null,
        total: finalTotal,
        taxa_entrega: deliveryFee,
        itens: items,
        status: 'novo'
      };

      const { data, error } = await supabase
        .from('pedidos')
        .insert([orderData])
        .select()
        .single();

      if (error) throw error;

      // Generate WhatsApp Link
      const whatsappLink = generateWhatsAppLink(orderData, config?.whatsapp || '5586999999999');
      window.open(whatsappLink, '_blank');

      toast.success('Pedido realizado com sucesso!');
      clearCart();
      onClose();
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Erro ao processar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'cart':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="w-24 h-24 bg-surface/50 rounded-[2rem] flex items-center justify-center text-gray-600 border border-white/5 shadow-2xl"
                  >
                    <ShoppingBag size={48} />
                  </motion.div>
                  <div className="space-y-2">
                    <p className="text-xl font-display font-black italic uppercase tracking-tighter text-white">Carrinho Vazio</p>
                    <p className="text-gray-500 text-sm max-w-[200px]">Escolha algo delicioso no nosso cardápio!</p>
                  </div>
                  <Button onClick={onClose} variant="outline" className="rounded-2xl px-8">Explorar Menu</Button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={item.id} 
                    className="bg-surface/40 backdrop-blur-xl p-5 rounded-[2rem] border border-white/5 space-y-4 group hover:border-primary/20 transition-all"
                  >
                    <div className="flex justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-display font-black italic uppercase tracking-tight text-white leading-tight">{item.nome}</h4>
                        <div className="space-y-1 mt-2">
                          {item.adicionais?.length ? (
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary/80">
                              + {item.adicionais.map(a => a.nome).join(', ')}
                            </p>
                          ) : null}
                          {item.removidos?.length ? (
                            <p className="text-[10px] font-black uppercase tracking-widest text-red-500/80">
                              - Sem: {item.removidos.join(', ')}
                            </p>
                          ) : null}
                          {item.observacoes && (
                            <p className="text-[10px] italic text-gray-500 bg-black/20 p-2 rounded-xl mt-2 border border-white/5">"{item.observacoes}"</p>
                          )}
                        </div>
                      </div>
                      <span className="font-display font-black italic text-xl text-primary tracking-tighter">{formatCurrency(item.preco * item.quantidade)}</span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-4 bg-background/80 rounded-2xl p-1 border border-white/5">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantidade - 1)}
                          className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                        >
                          <Minus size={18} />
                        </button>
                        <span className="font-display font-black italic text-lg w-4 text-center text-white">{item.quantidade}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantidade + 1)}
                          className="w-10 h-10 flex items-center justify-center text-primary hover:text-white transition-colors"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="p-3 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-8 bg-surface/80 backdrop-blur-2xl border-t border-white/10 space-y-6">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Subtotal</span>
                  <span className="text-3xl font-display font-black italic tracking-tighter text-primary">{formatCurrency(total)}</span>
                </div>
                <Button className="w-full h-16 text-xl font-display font-black italic uppercase tracking-tight rounded-[1.5rem] shadow-[0_10px_30px_rgba(255,157,0,0.2)]" onClick={() => setStep('delivery')}>
                  Checkout <ChevronRight className="ml-2" />
                </Button>
              </div>
            )}
          </motion.div>
        );

      case 'delivery':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeliveryType('delivery')}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-3 p-6 rounded-[2rem] border transition-all duration-500",
                    deliveryType === 'delivery' 
                      ? "bg-primary/10 border-primary shadow-[0_0_30px_rgba(255,157,0,0.1)] text-primary" 
                      : "bg-surface/40 border-white/5 text-gray-500 grayscale hover:grayscale-0"
                  )}
                >
                  <Truck size={32} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Delivery</span>
                </button>
                <button 
                  onClick={() => setDeliveryType('pickup')}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-3 p-6 rounded-[2rem] border transition-all duration-500",
                    deliveryType === 'pickup' 
                      ? "bg-primary/10 border-primary shadow-[0_0_30px_rgba(255,157,0,0.1)] text-primary" 
                      : "bg-surface/40 border-white/5 text-gray-500 grayscale hover:grayscale-0"
                  )}
                >
                  <Store size={32} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Retirada</span>
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Informações Pessoais</h4>
                  <Input label="Seu Nome" placeholder="Ex: João Silva" value={customerName} onChange={e => setCustomerName(e.target.value)} icon={<User size={18} />} className="rounded-2xl" />
                  <Input label="WhatsApp" placeholder="(00) 00000-0000" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} icon={<Phone size={18} />} className="rounded-2xl" />
                </div>
                
                {deliveryType === 'delivery' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4"
                  >
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Endereço de Entrega</h4>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Bairro</label>
                      <div className="relative">
                        <select 
                          value={neighborhood}
                          onChange={e => setNeighborhood(e.target.value)}
                          className="w-full bg-surface/60 border border-white/10 rounded-2xl px-5 py-4 text-white font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none transition-all"
                        >
                          <option value="">Selecione seu bairro</option>
                          {deliveryAreas.map(area => (
                            <option key={area.id} value={area.bairro}>{area.bairro} - {formatCurrency(area.valor)}</option>
                          ))}
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                          <ChevronRight size={18} className="rotate-90" />
                        </div>
                      </div>
                    </div>
                    <Input label="Endereço Completo" placeholder="Rua, número, complemento..." value={address} onChange={e => setAddress(e.target.value)} icon={<MapPin size={18} />} className="rounded-2xl" />
                  </motion.div>
                )}
              </div>
            </div>

            <div className="p-8 bg-surface/80 backdrop-blur-2xl border-t border-white/10 grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={() => setStep('cart')} className="rounded-2xl h-14 font-display font-black italic uppercase tracking-tight">Voltar</Button>
              <Button onClick={() => setStep('payment')} className="rounded-2xl h-14 font-display font-black italic uppercase tracking-tight">Próximo</Button>
            </div>
          </motion.div>
        );

      case 'payment':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Forma de Pagamento</h4>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { name: 'Pix', icon: <Zap size={22} />, color: 'text-cyan-400' },
                    { name: 'Cartão de Crédito', icon: <CreditCard size={22} />, color: 'text-purple-400' },
                    { name: 'Cartão de Débito', icon: <CreditCard size={22} />, color: 'text-blue-400' },
                    { name: 'Dinheiro', icon: <DollarSign size={22} />, color: 'text-green-400' }
                  ].map((method) => (
                    <button
                      key={method.name}
                      onClick={() => setPaymentMethod(method.name)}
                      className={cn(
                        "flex items-center justify-between p-5 rounded-[1.5rem] border transition-all duration-300 group",
                        paymentMethod === method.name 
                          ? "bg-primary/10 border-primary text-primary shadow-[0_0_20px_rgba(255,157,0,0.1)]" 
                          : "bg-surface/40 border-white/5 text-gray-500 hover:border-white/20"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn("transition-transform duration-500 group-hover:scale-110", paymentMethod === method.name ? method.color : "text-gray-500")}>
                          {method.icon}
                        </div>
                        <span className="font-display font-black italic uppercase tracking-tight text-lg">{method.name}</span>
                      </div>
                      {paymentMethod === method.name && (
                        <motion.div 
                          layoutId="active-payment"
                          className="w-3 h-3 bg-primary rounded-full shadow-[0_0_15px_rgba(255,157,0,1)]" 
                        />
                      )}
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {paymentMethod === 'Dinheiro' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0, y: -10 }} 
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      className="overflow-hidden"
                    >
                      <Input label="Troco para quanto?" placeholder="Ex: 50.00" type="number" value={changeFor} onChange={e => setChangeFor(e.target.value)} className="rounded-2xl" />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pt-4">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1 mb-4">Observações</h4>
                  <textarea 
                    placeholder="Alguma recomendação especial?" 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)}
                    className="w-full bg-surface/40 border border-white/5 rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px] resize-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="p-8 bg-surface/80 backdrop-blur-2xl border-t border-white/10 grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={() => setStep('delivery')} className="rounded-2xl h-14 font-display font-black italic uppercase tracking-tight">Voltar</Button>
              <Button onClick={() => setStep('review')} className="rounded-2xl h-14 font-display font-black italic uppercase tracking-tight">Revisar</Button>
            </div>
          </motion.div>
        );

      case 'review':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
              <div className="bg-surface/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 space-y-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Resumo dos Itens</h4>
                  <div className="space-y-3">
                    {items.map(item => (
                      <div key={item.id} className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-white">{item.quantidade}x {item.nome}</p>
                          {item.adicionais?.length ? (
                            <p className="text-[10px] text-primary/60 uppercase font-black">+{item.adicionais.length} adicionais</p>
                          ) : null}
                        </div>
                        <span className="font-display font-black italic text-sm text-white">{formatCurrency(item.preco * item.quantidade)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 space-y-3">
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest text-gray-500">
                    <span>Subtotal</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest text-gray-500">
                    <span>Taxa de Entrega</span>
                    <span>{formatCurrency(deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between items-end pt-4">
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Total Final</span>
                    <span className="text-4xl font-display font-black italic tracking-tighter text-primary">{formatCurrency(finalTotal)}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 grid grid-cols-1 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-400">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Local de Entrega</h4>
                      <p className="text-sm font-bold text-white">{deliveryType === 'delivery' ? `${address}, ${neighborhood}` : 'Retirada na Loja'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-400">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Pagamento Escolhido</h4>
                      <p className="text-sm font-bold text-white">{paymentMethod}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-surface/80 backdrop-blur-2xl border-t border-white/10 grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={() => setStep('payment')} className="rounded-2xl h-14 font-display font-black italic uppercase tracking-tight">Voltar</Button>
              <Button 
                className="rounded-2xl h-14 font-display font-black italic uppercase tracking-tight bg-green-500 hover:bg-green-600 text-white shadow-[0_10px_30px_rgba(34,197,94,0.3)]" 
                onClick={handleCheckout} 
                loading={loading}
              >
                Confirmar
              </Button>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-background z-[70] shadow-2xl flex flex-col border-l border-white/10"
          >
            <div className="p-6 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold">Carrinho</h2>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                    {step === 'cart' ? 'Seus Itens' : step === 'delivery' ? 'Entrega' : step === 'payment' ? 'Pagamento' : 'Revisão'}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            {renderStep()}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
