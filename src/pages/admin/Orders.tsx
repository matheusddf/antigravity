import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Order } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Clock, CheckCircle, Truck, AlertCircle, Eye, Search, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('todos');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('criado_em', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const subscription = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const audio = new Audio('/notification.mp3'); // Assuming a notification sound exists
          audio.play().catch(() => {});
          toast.info('Novo pedido recebido!');
        }
        fetchOrders();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      toast.success(`Status atualizado para: ${newStatus}`);
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const filteredOrders = orders.filter(o => filter === 'todos' || o.status === filter);

  const statusConfig = {
    'novo': { color: 'text-blue-400', bg: 'bg-blue-400/10', icon: AlertCircle, label: 'Novo' },
    'preparando': { color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: Clock, label: 'Preparando' },
    'saiu para entrega': { color: 'text-purple-400', bg: 'bg-purple-400/10', icon: Truck, label: 'Em Entrega' },
    'finalizado': { color: 'text-green-400', bg: 'bg-green-400/10', icon: CheckCircle, label: 'Finalizado' },
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">Pedidos</h1>
          <p className="text-gray-400">Gerencie os pedidos em tempo real</p>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {['todos', 'novo', 'preparando', 'saiu para entrega', 'finalizado'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all border",
                filter === s ? "bg-primary text-black border-primary" : "bg-surface text-gray-400 border-white/10 hover:border-primary/50"
              )}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredOrders.map((order) => (
              <motion.div
                layout
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 group"
              >
                <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                  <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0", statusConfig[order.status as keyof typeof statusConfig].bg)}>
                    {(() => {
                      const Icon = statusConfig[order.status as keyof typeof statusConfig].icon;
                      return <Icon className={cn(statusConfig[order.status as keyof typeof statusConfig].color, "md:size-24")} size={20} />;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base md:text-lg truncate">#{order.id.slice(0, 5)} - {order.nome_cliente}</h3>
                    <p className="text-xs md:text-sm text-gray-500">
                      {format(new Date(order.criado_em), "HH:mm '•' dd/MM", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="md:hidden text-right">
                    <p className="text-primary font-bold">{formatCurrency(order.total)}</p>
                  </div>
                </div>

                <div className="hidden md:block flex-1 px-6">
                  <p className="text-sm text-gray-400 line-clamp-1">
                    {order.itens.map(i => `${i.quantidade}x ${i.nome}`).join(', ')}
                  </p>
                  <p className="text-primary font-bold">{formatCurrency(order.total)}</p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto pt-4 md:pt-0 border-t border-white/5 md:border-0">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="flex-1 md:flex-none bg-surface border border-white/10 rounded-xl px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="novo">Novo</option>
                    <option value="preparando">Preparando</option>
                    <option value="saiu para entrega">Saiu para Entrega</option>
                    <option value="finalizado">Finalizado</option>
                  </select>
                  <Button variant="outline" size="sm" className="shrink-0" onClick={() => setSelectedOrder(order)}>
                    <Eye size={18} />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-surface z-[70] rounded-3xl p-8 overflow-y-auto no-scrollbar border border-white/10"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-display font-bold">Detalhes do Pedido #{selectedOrder.id.slice(0, 5)}</h2>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-white/5 rounded-full"><X /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Cliente</h4>
                    <p className="font-bold">{selectedOrder.nome_cliente}</p>
                    <p className="text-sm text-gray-400">{selectedOrder.telefone}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Entrega</h4>
                    <p className="text-sm">{selectedOrder.tipo_entrega === 'delivery' ? 'Delivery' : 'Retirada'}</p>
                    {selectedOrder.tipo_entrega === 'delivery' && (
                      <p className="text-sm text-gray-400">{selectedOrder.endereco}, {selectedOrder.bairro}</p>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Pagamento</h4>
                    <p className="text-sm">{selectedOrder.forma_pagamento}</p>
                    {selectedOrder.troco && <p className="text-sm text-gray-400">Troco para {formatCurrency(selectedOrder.troco)}</p>}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Itens</h4>
                  {selectedOrder.itens.map((item, idx) => (
                    <div key={idx} className="glass-card p-3 space-y-1">
                      <div className="flex justify-between font-bold">
                        <span>{item.quantidade}x {item.nome}</span>
                        <span>{formatCurrency(item.preco * item.quantidade)}</span>
                      </div>
                      {item.adicionais?.length ? (
                        <p className="text-xs text-gray-500">+ {item.adicionais.map(a => a.nome).join(', ')}</p>
                      ) : null}
                      {item.removidos?.length ? (
                        <p className="text-xs text-red-400">- Sem: {item.removidos.join(', ')}</p>
                      ) : null}
                      {item.observacoes && <p className="text-xs italic text-gray-400">"{item.observacoes}"</p>}
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t border-white/10 space-y-2">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Subtotal</span>
                      <span>{formatCurrency(selectedOrder.total - selectedOrder.taxa_entrega)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Taxa de Entrega</span>
                      <span>{formatCurrency(selectedOrder.taxa_entrega)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-primary">
                      <span>Total</span>
                      <span>{formatCurrency(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
