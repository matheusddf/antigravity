import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Category, Product } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, Star, Eye, EyeOff, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { toast } from 'sonner';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageUrl, setImageUrl] = useState('');

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

  useEffect(() => {
    if (editingProduct) {
      setImageUrl(editingProduct.imagens_url[0] || '');
    } else {
      setImageUrl('');
    }
  }, [editingProduct]);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      nome: formData.get('nome') as string,
      descricao: formData.get('descricao') as string,
      preco: parseFloat(formData.get('preco') as string),
      categoria_id: formData.get('categoria_id') as string,
      imagens_url: [imageUrl],
      disponivel: editingProduct ? editingProduct.disponivel : true,
      destaque: editingProduct ? editingProduct.destaque : false
    };

    if (!imageUrl) {
      toast.error('Por favor, envie uma imagem para o produto');
      return;
    }

    const { error } = editingProduct 
      ? await supabase.from('produtos').update(data).eq('id', editingProduct.id)
      : await supabase.from('produtos').insert([data]);

    if (error) {
      console.error('Error saving product:', error);
      toast.error('Erro ao salvar produto');
    } else {
      toast.success('Produto salvo com sucesso');
      setIsModalOpen(false);
      fetchData();
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-display font-black italic uppercase tracking-tighter text-primary">Produtos</h1>
          <p className="text-gray-500 text-sm">Gerencie os itens do seu cardápio digital.</p>
        </div>
        <Button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="rounded-2xl h-14 px-8 font-display font-black italic uppercase tracking-tight shadow-[0_10px_30px_rgba(255,157,0,0.2)]">
          <Plus className="mr-2" size={20} /> Novo Produto
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {products.map((product) => (
          <motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={product.id} 
            className="bg-surface/40 backdrop-blur-xl p-5 rounded-[2.5rem] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center gap-6 group hover:border-primary/20 transition-all"
          >
            <div className="flex items-center gap-6 w-full sm:w-auto">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-[1.5rem] overflow-hidden border border-white/10 shrink-0">
                <img 
                  src={product.imagens_url[0] || 'https://picsum.photos/seed/food/200'} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  alt={product.nome}
                />
                {!product.disponivel && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <EyeOff size={16} className="text-red-500" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-display font-black italic uppercase tracking-tight text-white truncate">{product.nome}</h3>
                  {product.destaque && <Star size={16} className="text-yellow-400 fill-current shrink-0 animate-pulse" />}
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{categories.find(c => c.id === product.categoria_id)?.nome}</p>
                <p className="text-primary font-black text-xl italic tracking-tighter">{formatCurrency(product.preco)}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-4 sm:pt-0 border-t border-white/5 sm:border-0">
              <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-2xl border border-white/5">
                <button 
                  onClick={() => toggleStatus(product, 'disponivel')}
                  className={cn("p-3 rounded-xl transition-all", product.disponivel ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10")}
                  title={product.disponivel ? "Disponível" : "Indisponível"}
                >
                  {product.disponivel ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
                <button 
                  onClick={() => toggleStatus(product, 'destaque')}
                  className={cn("p-3 rounded-xl transition-all", product.destaque ? "text-yellow-400 bg-yellow-400/10" : "text-gray-500 hover:bg-white/5")}
                  title={product.destaque ? "Em Destaque" : "Normal"}
                >
                  <Star size={20} fill={product.destaque ? "currentColor" : "none"} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                  className="p-4 text-blue-400 hover:bg-blue-400/10 rounded-2xl transition-all"
                >
                  <Edit2 size={22} />
                </button>
                <button 
                  onClick={() => handleDelete(product.id)}
                  className="p-4 text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
                >
                  <Trash2 size={22} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsModalOpen(false)} 
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60]" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-surface z-[70] rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-surface/80 backdrop-blur-xl sticky top-0 z-10">
                <div className="space-y-1">
                  <h2 className="text-3xl font-display font-black italic uppercase tracking-tighter text-white">
                    {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                  </h2>
                  <p className="text-gray-500 text-xs uppercase tracking-widest">Preencha os detalhes abaixo</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white/5 rounded-2xl transition-colors text-gray-500">
                  <X size={24} />
                </button>
              </div>

              <form className="p-8 space-y-8 overflow-y-auto no-scrollbar" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <Input label="Nome do Produto" name="nome" defaultValue={editingProduct?.nome} required className="rounded-2xl" />
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Descrição</label>
                      <textarea 
                        name="descricao" 
                        defaultValue={editingProduct?.descricao || ''} 
                        className="w-full bg-surface border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[120px] resize-none transition-all"
                        placeholder="Descreva o produto..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Preço (R$)" name="preco" type="number" step="0.01" defaultValue={editingProduct?.preco} required className="rounded-2xl" />
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Categoria</label>
                        <select 
                          name="categoria_id" 
                          className="w-full bg-surface border border-white/10 rounded-2xl px-5 py-4 text-white font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none transition-all" 
                          defaultValue={editingProduct?.categoria_id} 
                          required
                        >
                          {categories.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <ImageUpload value={imageUrl} onChange={setImageUrl} />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button variant="outline" className="flex-1 h-14 rounded-2xl font-display font-black italic uppercase tracking-tight" type="button" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                  <Button className="flex-1 h-14 rounded-2xl font-display font-black italic uppercase tracking-tight shadow-[0_10px_30px_rgba(255,157,0,0.2)]" type="submit">Salvar Produto</Button>
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
