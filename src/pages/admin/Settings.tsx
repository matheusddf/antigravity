import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { supabase } from '@/lib/supabase';
import { StoreConfig, DeliveryArea } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import { Save, Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AdminSettings() {
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [areas, setAreas] = useState<DeliveryArea[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [cRes, aRes] = await Promise.all([
      supabase.from('configuracoes').select('*').single(),
      supabase.from('delivery_areas').select('*').order('bairro')
    ]);
    setConfig(cRes.data);
    setAreas(aRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    const { error } = await supabase.from('configuracoes').update(config).eq('id', config.id);
    if (error) toast.error('Erro ao salvar');
    else toast.success('Configurações salvas');
  };

  const handleAddArea = async () => {
    const bairro = prompt('Nome do bairro:');
    const valor = parseFloat(prompt('Valor da taxa:') || '0');
    if (bairro) {
      await supabase.from('delivery_areas').insert([{ bairro, valor }]);
      fetchData();
    }
  };

  if (loading) return null;

  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <h2 className="text-2xl font-display font-bold text-primary">Configurações da Loja</h2>
        <form onSubmit={handleSaveConfig} className="glass-card space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Nome da Loja" 
              value={config?.nome_loja} 
              onChange={e => setConfig(prev => prev ? {...prev, nome_loja: e.target.value} : null)} 
            />
            <Input 
              label="WhatsApp (com DDD)" 
              value={config?.whatsapp} 
              onChange={e => setConfig(prev => prev ? {...prev, whatsapp: e.target.value} : null)} 
            />
            <Input 
              label="Logo URL" 
              value={config?.logo_url || ''} 
              onChange={e => setConfig(prev => prev ? {...prev, logo_url: e.target.value} : null)} 
            />
            <Input 
              label="Cover URL" 
              value={config?.cover_url || ''} 
              onChange={e => setConfig(prev => prev ? {...prev, cover_url: e.target.value} : null)} 
            />
            <div className="flex items-center gap-4 pt-6">
              <span className="text-sm font-medium text-gray-400">Status da Loja:</span>
              <button 
                type="button"
                onClick={() => setConfig(prev => prev ? {...prev, esta_aberto: !prev.esta_aberto} : null)}
                className={cn("px-6 py-2 rounded-full font-bold transition-all", config?.esta_aberto ? "bg-green-500 text-white" : "bg-red-500 text-white")}
              >
                {config?.esta_aberto ? 'ABERTO' : 'FECHADO'}
              </button>
            </div>
          </div>
          <Button type="submit" className="gap-2">
            <Save size={20} /> Salvar Alterações
          </Button>
        </form>
      </section>

      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-display font-black italic uppercase tracking-tighter text-primary">Taxas de Entrega</h2>
            <p className="text-gray-500 text-sm">Gerencie os bairros e valores de frete.</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleAddArea} className="rounded-2xl gap-2">
            <Plus size={18} /> Adicionar Bairro
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {areas.map(area => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={area.id} 
              className="bg-surface/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 flex items-center justify-between group hover:border-primary/30 transition-all"
            >
              <div className="space-y-1">
                <p className="text-xl font-display font-black italic uppercase tracking-tight text-white">{area.bairro}</p>
                <p className="text-primary font-black text-2xl tracking-tighter italic">{formatCurrency(area.valor)}</p>
              </div>
              <button 
                onClick={async () => {
                  if (confirm(`Excluir taxa do bairro ${area.bairro}?`)) {
                    await supabase.from('delivery_areas').delete().eq('id', area.id);
                    fetchData();
                  }
                }}
                className="p-4 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
              >
                <Trash2 size={22} />
              </button>
            </motion.div>
          ))}
        </div>

        {areas.length === 0 && (
          <div className="text-center py-20 bg-surface/20 rounded-[3rem] border border-dashed border-white/10">
            <p className="text-gray-500 italic font-medium">Nenhum bairro cadastrado ainda.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
