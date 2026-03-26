import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Category } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, GripVertical, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { toast } from 'sonner';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [imageUrl, setImageUrl] = useState('');

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categorias').select('*').order('ordem');
    if (data) setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (editingCategory) {
      setImageUrl(editingCategory.imagem_url || '');
    } else {
      setImageUrl('');
    }
  }, [editingCategory]);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza? Isso pode afetar produtos vinculados.')) return;
    const { error } = await supabase.from('categorias').delete().eq('id', id);
    if (error) toast.error('Erro ao excluir');
    else {
      toast.success('Excluído com sucesso');
      fetchCategories();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const nome = formData.get('nome') as string;
    const ordem = parseInt(formData.get('ordem') as string || '0');

    const data = { nome, ordem, imagem_url: imageUrl };

    const { error } = editingCategory 
      ? await supabase.from('categorias').update(data).eq('id', editingCategory.id)
      : await supabase.from('categorias').insert([data]);

    if (error) {
      console.error('Error saving category:', error);
      toast.error('Erro ao salvar');
    } else {
      toast.success('Salvo com sucesso');
      setIsModalOpen(false);
      fetchCategories();
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-display font-black italic uppercase tracking-tighter text-primary">Categorias</h1>
          <p className="text-gray-500 text-sm">Organize seus produtos por grupos.</p>
        </div>
        <Button onClick={() => { setEditingCategory(null); setIsModalOpen(true); }} className="rounded-2xl h-14 px-8 font-display font-black italic uppercase tracking-tight shadow-[0_10px_30px_rgba(255,157,0,0.2)]">
          <Plus className="mr-2" size={20} /> Nova Categoria
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {categories.map((cat) => (
          <motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={cat.id} 
            className="bg-surface/40 backdrop-blur-xl p-5 rounded-[2.5rem] border border-white/5 flex items-center justify-between group hover:border-primary/20 transition-all"
          >
            <div className="flex items-center gap-6">
              <div className="text-gray-600 group-hover:text-primary transition-colors">
                <GripVertical size={24} />
              </div>
              <div className="flex items-center gap-4">
                {cat.imagem_url && (
                  <img src={cat.imagem_url} className="w-12 h-12 rounded-xl object-cover border border-white/10" alt="" />
                )}
                <div>
                  <h3 className="text-xl font-display font-black italic uppercase tracking-tight text-white">{cat.nome}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Ordem de exibição: {cat.ordem}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => { setEditingCategory(cat); setIsModalOpen(true); }}
                className="p-4 text-blue-400 hover:bg-blue-400/10 rounded-2xl transition-all"
              >
                <Edit2 size={22} />
              </button>
              <button 
                onClick={() => handleDelete(cat.id)}
                className="p-4 text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
              >
                <Trash2 size={22} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

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
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-xl bg-surface z-[70] rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-surface/80 backdrop-blur-xl sticky top-0 z-10">
                <div className="space-y-1">
                  <h2 className="text-3xl font-display font-black italic uppercase tracking-tighter text-white">
                    {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                  </h2>
                  <p className="text-gray-500 text-xs uppercase tracking-widest">Defina o nome e a ordem</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white/5 rounded-2xl transition-colors text-gray-500">
                  <X size={24} />
                </button>
              </div>

              <form className="p-8 space-y-8 overflow-y-auto no-scrollbar" onSubmit={handleSave}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <Input label="Nome da Categoria" name="nome" defaultValue={editingCategory?.nome} required className="rounded-2xl" />
                    <Input label="Ordem de Exibição" name="ordem" type="number" defaultValue={editingCategory?.ordem} className="rounded-2xl" />
                  </div>
                  <div className="space-y-6">
                    <ImageUpload value={imageUrl} onChange={setImageUrl} />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button variant="outline" className="flex-1 h-14 rounded-2xl font-display font-black italic uppercase tracking-tight" type="button" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                  <Button className="flex-1 h-14 rounded-2xl font-display font-black italic uppercase tracking-tight shadow-[0_10px_30px_rgba(255,157,0,0.2)]" type="submit">Salvar Categoria</Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
