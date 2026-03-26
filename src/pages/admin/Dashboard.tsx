import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
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
  Line
} from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    orderCount: 0,
    avgOrderValue: 0,
    growth: 12.5
  });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: orders } = await supabase.from('pedidos').select('total, criado_em');
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-primary">Dashboard</h1>
        <p className="text-gray-400">Visão geral do seu negócio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className={cn("p-3 rounded-xl", card.bg)}>
                <card.icon className={card.color} size={24} />
              </div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{card.label}</span>
            </div>
            <p className="text-2xl font-display font-bold">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 space-y-6">
          <h3 className="font-bold text-lg">Faturamento Diário</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#121212', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ color: '#00f2ff' }}
                />
                <Bar dataKey="total" fill="#00f2ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 space-y-6">
          <h3 className="font-bold text-lg">Desempenho de Vendas</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#121212', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ color: '#7000ff' }}
                />
                <Line type="monotone" dataKey="total" stroke="#7000ff" strokeWidth={3} dot={{ r: 4, fill: '#7000ff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
