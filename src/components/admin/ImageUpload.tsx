import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}

export function ImageUpload({ value, onChange, folder = 'products' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      onChange(publicUrl);
      toast.success('Imagem enviada com sucesso!');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('Erro ao enviar imagem. Verifique se o bucket "images" existe no Supabase.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    onChange('');
  };

  return (
    <div className="space-y-4">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Imagem</label>
      
      {value ? (
        <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden border border-white/10 group">
          <img 
            src={value} 
            alt="Preview" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={removeImage}
              className="p-4 bg-red-500 text-white rounded-2xl shadow-xl hover:scale-110 transition-transform"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full aspect-video rounded-[2rem] border-2 border-dashed border-white/10 bg-surface/20 hover:bg-surface/40 hover:border-primary/50 transition-all cursor-pointer group">
          <div className="flex flex-col items-center justify-center pt-5 pb-6 space-y-4">
            <div className="p-5 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
              {uploading ? (
                <Loader2 size={32} className="text-primary animate-spin" />
              ) : (
                <Upload size={32} className="text-gray-500 group-hover:text-primary transition-colors" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-white uppercase tracking-tight">
                {uploading ? 'Enviando...' : 'Clique para enviar'}
              </p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">PNG, JPG ou WEBP</p>
            </div>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept="image/*" 
            onChange={handleUpload} 
            disabled={uploading} 
          />
        </label>
      )}
    </div>
  );
}
