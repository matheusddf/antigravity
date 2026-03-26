import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    orderCount: 0,
    avgOrderValue: 0,
    growth: 12.5
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: orders } = await supabase.from('pedidos').select('*');
      if (orders) {
        const total = orders.reduce((acc, o) => acc + o.total, 0);
        setStats({
          totalSales: total,
          orderCount: orders.length,
          avgOrderValue: orders.length > 0 ? total / orders.length : 0,
          growth: 15.2
        });

        // Group by day for chart
        const grouped = orders.reduce((acc: any, o) => {
          const date = new Date(o.criado_em).toLocaleDateString();
          acc[date] = (acc[date] || 0) + o.total;
          return acc;
        }, {});

        setChartData(Object.entries(grouped).map(([name, total]) => ({ name, total })));

        // Status data
        const statusCounts = orders.reduce((acc: any, o) => {
          acc[o.status] = (acc[o.status] || 0) + 1;
          return acc;
        }, {});

        const statusLabels: Record<string, string> = {
          'pendente': 'Pendentes',
          'preparando': 'Em Preparo',
          'enviado': 'Enviados',
          'entregue': 'Entregues',
          'cancelado': 'Cancelados'
        };

        setStatusData(Object.entries(statusCounts).map(([name, value]) => ({ 
          name: statusLabels[name] || name, 
          value 
        })));

        // Top products (simulated based on items in orders)
        const productCounts: Record<string, { nome: string, count: number, total: number }> = {};
        orders.forEach(order => {
          if (Array.isArray(order.itens)) {
            order.itens.forEach((item: any) => {
              if (!productCounts[item.id]) {
                productCounts[item.id] = { nome: item.nome, count: 0, total: 0 };
              }
              productCounts[item.id].count += item.quantidade;
              productCounts[item.id].total += (item.preco * item.quantidade);
            });
          }
        });

        setTopProducts(
          Object.values(productCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
        );
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Vendas Totais', value: formatCurrency(stats.totalSales), icon: DollarSign, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Total de Pedidos', value: stats.orderCount, icon: ShoppingBag, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Ticket Médio', value: formatCurrency(stats.avgOrderValue), icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Crescimento', value: `+${stats.growth}%`, icon: ArrowUpRight, color: 'text-primary', bg: 'bg-primary/10' },
  ];

  const COLORS = ['#ff9d00', '#7000ff', '#00ff88', '#00d1ff', '#ff4444'];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-display font-black italic uppercase tracking-tighter text-primary">Dashboard</h1>
          <p className="text-gray-500 text-sm">Visão geral do desempenho do seu negócio.</p>
        </div>
        <div className="flex items-center gap-4 bg-surface/40 backdrop-blur-xl p-2 rounded-2xl border border-white/5">
          <button className="px-6 py-2.5 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/20">Hoje</button>
          <button className="px-6 py-2.5 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Semana</button>
          <button className="px-6 py-2.5 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Mês</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-surface/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 space-y-6 group hover:border-primary/30 transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-all" />
            
            <div className="flex items-center justify-between relative z-10">
              <div className={cn("p-4 rounded-2xl shadow-lg", card.bg)}>
                <card.icon className={card.color} size={28} />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{card.label}</p>
                <p className="text-2xl font-display font-black italic tracking-tighter text-white mt-1">{card.value}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-[10px] font-bold text-primary italic tracking-widest relative z-10">
              <TrendingUp size={12} />
              <span>{card.label === 'Crescimento' ? 'Meta Mensal' : '+12% este mês'}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface/40 backdrop-blur-xl p-8 rounded-[3rem] border border-white/5 space-y-8"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-display font-black italic uppercase tracking-tight text-white">Faturamento Diário</h3>
            <div className="px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest">Últimos 7 dias</div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff9d00" stopOpacity={1} />
                    <stop offset="100%" stopColor="#ff9d00" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#666" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(v) => v.split('/')[0]}
                />
                <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v}`} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(10,10,10,0.9)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '20px',
                    padding: '15px'
                  }}
                  itemStyle={{ color: '#ff9d00', fontWeight: 'bold' }}
                />
                <Bar dataKey="total" fill="url(#barGradient)" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-surface/40 backdrop-blur-xl p-8 rounded-[3rem] border border-white/5 space-y-8"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-display font-black italic uppercase tracking-tight text-white">Desempenho de Vendas</h3>
            <div className="px-4 py-1.5 bg-purple-500/10 rounded-full border border-purple-500/20 text-[10px] font-black text-purple-400 uppercase tracking-widest">Tendência</div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7000ff" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#7000ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#666" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(v) => v.split('/')[0]}
                />
                <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v}`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(10,10,10,0.9)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '20px',
                    padding: '15px'
                  }}
                  itemStyle={{ color: '#7000ff', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#7000ff" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#7000ff', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 8, strokeWidth: 0 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-surface/40 backdrop-blur-xl p-8 rounded-[3rem] border border-white/5 space-y-8"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-display font-black italic uppercase tracking-tight text-white">Produtos Mais Vendidos</h3>
            <Package size={20} className="text-primary" />
          </div>
          <div className="space-y-4">
            {topProducts.length > 0 ? topProducts.map((product, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5 group hover:border-primary/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black italic">
                    #{idx + 1}
                  </div>
                  <div>
                    <p className="font-display font-black italic uppercase tracking-tight text-white">{product.nome}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{product.count} unidades vendidas</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-primary font-black italic tracking-tighter">{formatCurrency(product.total)}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Total acumulado</p>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500 space-y-2">
                <Package size={40} className="opacity-20" />
                <p className="text-xs font-black uppercase tracking-widest">Nenhum dado disponível</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-surface/40 backdrop-blur-xl p-8 rounded-[3rem] border border-white/5 space-y-8"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-display font-black italic uppercase tracking-tight text-white">Status dos Pedidos</h3>
            <Clock size={20} className="text-purple-400" />
          </div>
          <div className="h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(10,10,10,0.9)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '20px',
                    padding: '15px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {statusData.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 space-y-2">
                <AlertCircle size={40} className="opacity-20" />
                <p className="text-xs font-black uppercase tracking-widest">Sem pedidos</p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {statusData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{entry.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
