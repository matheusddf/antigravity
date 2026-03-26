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
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center text-gray-600">
                    <ShoppingBag size={40} />
                  </div>
                  <p className="text-gray-400">Seu carrinho está vazio</p>
                  <Button onClick={onClose} variant="outline">Ver Cardápio</Button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="glass-card p-4 space-y-3">
                    <div className="flex justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-white leading-tight">{item.nome}</h4>
                        {item.adicionais?.length ? (
                          <p className="text-[10px] text-primary mt-1">
                            + {item.adicionais.map(a => a.nome).join(', ')}
                          </p>
                        ) : null}
                        {item.removidos?.length ? (
                          <p className="text-[10px] text-red-400 mt-1">
                            - Sem: {item.removidos.join(', ')}
                          </p>
                        ) : null}
                        {item.observacoes && (
                          <p className="text-[10px] italic text-gray-500 mt-1">"{item.observacoes}"</p>
                        )}
                      </div>
                      <span className="font-bold text-primary">{formatCurrency(item.preco * item.quantidade)}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="flex items-center gap-3 bg-background rounded-lg p-1">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantidade - 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="font-bold w-4 text-center">{item.quantidade}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantidade + 1)}
                          className="w-8 h-8 flex items-center justify-center text-primary hover:text-white"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-red-500/50 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 bg-surface border-t border-white/10 space-y-4">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>
                <Button className="w-full h-14 text-lg" onClick={() => setStep('delivery')}>
                  Continuar <ChevronRight className="ml-2" />
                </Button>
              </div>
            )}
          </div>
        );

      case 'delivery':
        return (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
              <div className="flex gap-2">
                <button 
                  onClick={() => setDeliveryType('delivery')}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                    deliveryType === 'delivery' ? "bg-primary/10 border-primary text-primary" : "bg-surface border-white/5 text-gray-500"
                  )}
                >
                  <Truck size={24} />
                  <span className="text-xs font-bold uppercase tracking-widest">Delivery</span>
                </button>
                <button 
                  onClick={() => setDeliveryType('pickup')}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                    deliveryType === 'pickup' ? "bg-primary/10 border-primary text-primary" : "bg-surface border-white/5 text-gray-500"
                  )}
                >
                  <Store size={24} />
                  <span className="text-xs font-bold uppercase tracking-widest">Retirada</span>
                </button>
              </div>

              <div className="space-y-4">
                <Input label="Seu Nome" placeholder="Como devemos te chamar?" value={customerName} onChange={e => setCustomerName(e.target.value)} icon={<User size={18} />} />
                <Input label="WhatsApp" placeholder="(00) 00000-0000" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} icon={<Phone size={18} />} />
                
                {deliveryType === 'delivery' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Bairro</label>
                      <select 
                        value={neighborhood}
                        onChange={e => setNeighborhood(e.target.value)}
                        className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="">Selecione seu bairro</option>
                        {deliveryAreas.map(area => (
                          <option key={area.id} value={area.bairro}>{area.bairro} - {formatCurrency(area.valor)}</option>
                        ))}
                      </select>
                    </div>
                    <Input label="Endereço Completo" placeholder="Rua, número, complemento..." value={address} onChange={e => setAddress(e.target.value)} icon={<MapPin size={18} />} />
                  </>
                )}
              </div>
            </div>

            <div className="p-6 bg-surface border-t border-white/10 grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={() => setStep('cart')}>Voltar</Button>
              <Button onClick={() => setStep('payment')}>Próximo</Button>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Forma de Pagamento</h4>
                <div className="grid grid-cols-1 gap-3">
                  {['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro'].map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border transition-all",
                        paymentMethod === method ? "bg-primary/10 border-primary text-primary" : "bg-surface border-white/5 text-gray-500"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {method === 'Pix' && <Zap size={20} />}
                        {method.includes('Cartão') && <CreditCard size={20} />}
                        {method === 'Dinheiro' && <DollarSign size={20} />}
                        <span className="font-bold">{method}</span>
                      </div>
                      {paymentMethod === method && <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(255,157,0,1)]" />}
                    </button>
                  ))}
                </div>

                {paymentMethod === 'Dinheiro' && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <Input label="Troco para quanto?" placeholder="Ex: 50.00" type="number" value={changeFor} onChange={e => setChangeFor(e.target.value)} />
                  </motion.div>
                )}

                <div className="pt-4">
                  <Input label="Observações do Pedido" placeholder="Alguma recomendação especial?" value={notes} onChange={e => setNotes(e.target.value)} icon={<MessageSquare size={18} />} />
                </div>
              </div>
            </div>

            <div className="p-6 bg-surface border-t border-white/10 grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={() => setStep('delivery')}>Voltar</Button>
              <Button onClick={() => setStep('review')}>Revisar</Button>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
              <div className="glass-card p-6 space-y-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Resumo do Pedido</h4>
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-400">{item.quantidade}x {item.nome}</span>
                      <span className="font-bold">{formatCurrency(item.preco * item.quantidade)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/5 space-y-2">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Subtotal</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Taxa de Entrega</span>
                    <span>{formatCurrency(deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-primary pt-2">
                    <span>Total</span>
                    <span>{formatCurrency(finalTotal)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Entrega em</h4>
                    <p className="text-sm">{deliveryType === 'delivery' ? `${address}, ${neighborhood}` : 'Retirada na Loja'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Pagamento</h4>
                    <p className="text-sm">{paymentMethod}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-surface border-t border-white/10 grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={() => setStep('payment')}>Voltar</Button>
              <Button className="bg-green-500 hover:bg-green-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]" onClick={handleCheckout} loading={loading}>
                Finalizar Pedido
              </Button>
            </div>
          </div>
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
