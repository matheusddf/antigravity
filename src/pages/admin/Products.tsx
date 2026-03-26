import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Category, Product } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, GripVertical, Star, Eye, EyeOff } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchData = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        supabase.from('produtos').select('*').order('criado_em', { ascending: false }),
        supabase.from('categorias').select('*').order('ordem')
      ]);
      setProducts(pRes.data || []);
      setCategories(cRes.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    const { error } = await supabase.from('produtos').delete().eq('id', id);
    if (error) toast.error('Erro ao excluir');
    else {
      toast.success('Produto excluído');
      fetchData();
    }
  };

  const toggleStatus = async (product: Product, field: 'disponivel' | 'destaque') => {
    const { error } = await supabase
      .from('produtos')
      .update({ [field]: !product[field] })
      .eq('id', product.id);
    
    if (error) toast.error('Erro ao atualizar');
    else fetchData();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">Produtos</h1>
          <p className="text-gray-400">Gerencie seu cardápio</p>
        </div>
        <Button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}>
          <Plus className="mr-2" /> Novo Produto
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {products.map((product) => (
          <div key={product.id} className="glass-card p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <img 
                src={product.imagens_url[0] || 'https://picsum.photos/seed/food/200'} 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-white/10 shrink-0"
                alt=""
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold truncate">{product.nome}</h3>
                  {product.destaque && <Star size={14} className="text-yellow-400 fill-current shrink-0" />}
                </div>
                <p className="text-xs sm:text-sm text-gray-500 truncate">{categories.find(c => c.id === product.categoria_id)?.nome}</p>
                <p className="text-primary font-bold">{formatCurrency(product.preco)}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-3 sm:pt-0 border-t border-white/5 sm:border-0">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggleStatus(product, 'disponivel')}
                  className={cn("p-2 rounded-lg transition-colors", product.disponivel ? "text-green-400 hover:bg-green-400/10" : "text-red-400 hover:bg-red-400/10")}
                  title={product.disponivel ? "Disponível" : "Indisponível"}
                >
                  {product.disponivel ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
                <button 
                  onClick={() => toggleStatus(product, 'destaque')}
                  className={cn("p-2 rounded-lg transition-colors", product.destaque ? "text-yellow-400 hover:bg-yellow-400/10" : "text-gray-500 hover:bg-white/5")}
                  title={product.destaque ? "Em Destaque" : "Normal"}
                >
                  <Star size={20} fill={product.destaque ? "currentColor" : "none"} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                  className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                >
                  <Edit2 size={20} />
                </button>
                <button 
                  onClick={() => handleDelete(product.id)}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Product Modal (Simplified for this demo) */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-black/80 z-[60]" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-xl bg-surface z-[70] rounded-3xl p-8 border border-white/10">
              <h2 className="text-2xl font-display font-bold mb-6">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h2>
              <form className="space-y-4" onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = {
                  nome: formData.get('nome') as string,
                  descricao: formData.get('descricao') as string,
                  preco: parseFloat(formData.get('preco') as string),
                  categoria_id: formData.get('categoria_id') as string,
                  imagens_url: [formData.get('imagem_url') as string],
                  disponivel: true,
                  destaque: false
                };

                const { error } = editingProduct 
                  ? await supabase.from('produtos').update(data).eq('id', editingProduct.id)
                  : await supabase.from('produtos').insert([data]);

                if (error) toast.error('Erro ao salvar');
                else {
                  toast.success('Salvo com sucesso');
                  setIsModalOpen(false);
                  fetchData();
                }
              }}>
                <Input label="Nome" name="nome" defaultValue={editingProduct?.nome} required />
                <Input label="Descrição" name="descricao" defaultValue={editingProduct?.descricao || ''} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Preço" name="preco" type="number" step="0.01" defaultValue={editingProduct?.preco} required />
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-400 ml-1">Categoria</label>
                    <select name="categoria_id" className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white" defaultValue={editingProduct?.categoria_id} required>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </div>
                </div>
                <Input label="URL da Imagem" name="imagem_url" defaultValue={editingProduct?.imagens_url[0]} />
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1" type="button" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                  <Button className="flex-1" type="submit">Salvar</Button>
                </div>
              </form>
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
