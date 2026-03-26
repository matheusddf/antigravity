import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Category } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categorias').select('*').order('ordem');
    if (data) setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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

    const { error } = editingCategory 
      ? await supabase.from('categorias').update({ nome, ordem }).eq('id', editingCategory.id)
      : await supabase.from('categorias').insert([{ nome, ordem }]);

    if (error) toast.error('Erro ao salvar');
    else {
      toast.success('Salvo com sucesso');
      setIsModalOpen(false);
      fetchCategories();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">Categorias</h1>
          <p className="text-gray-400">Organize seu cardápio</p>
        </div>
        <Button onClick={() => { setEditingCategory(null); setIsModalOpen(true); }}>
          <Plus className="mr-2" /> Nova Categoria
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="glass-card p-4 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="text-gray-600 group-hover:text-primary transition-colors">
                <GripVertical size={20} />
              </div>
              <div>
                <h3 className="font-bold">{cat.nome}</h3>
                <p className="text-xs text-gray-500">Ordem: {cat.ordem}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => { setEditingCategory(cat); setIsModalOpen(true); }}
                className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
              >
                <Edit2 size={20} />
              </button>
              <button 
                onClick={() => handleDelete(cat.id)}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-black/80 z-[60]" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-surface z-[70] rounded-3xl p-8 border border-white/10">
              <h2 className="text-2xl font-display font-bold mb-6">{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</h2>
              <form className="space-y-4" onSubmit={handleSave}>
                <Input label="Nome da Categoria" name="nome" defaultValue={editingCategory?.nome} required />
                <Input label="Ordem de Exibição" name="ordem" type="number" defaultValue={editingCategory?.ordem} />
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
