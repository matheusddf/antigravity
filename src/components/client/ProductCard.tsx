import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'motion/react';
import { Plus, Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={onClick}
      className="flex items-center gap-4 p-4 bg-surface/50 hover:bg-surface border border-white/5 rounded-2xl transition-all cursor-pointer group"
    >
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{product.nome}</h3>
          {product.destaque && (
            <div className="p-1 bg-primary/10 rounded-full">
              <Star size={12} className="text-primary fill-current" />
            </div>
          )}
        </div>
        
        <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
          {product.descricao}
        </p>

        <div className="flex items-center justify-between pt-2">
          <span className="text-primary font-bold text-lg">
            {formatCurrency(product.preco)}
          </span>
          
          {!product.disponivel && (
            <span className="text-[10px] font-bold bg-red-500/10 text-red-500 px-2 py-1 rounded-full uppercase tracking-wider">
              Esgotado
            </span>
          )}
        </div>
      </div>

      <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0">
        <img
          src={product.imagens_url[0] || 'https://picsum.photos/seed/burger/300'}
          alt={product.nome}
          className="w-full h-full object-cover rounded-xl border border-white/10"
          referrerPolicy="no-referrer"
        />
        {product.disponivel && (
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-black shadow-lg transform group-hover:scale-110 transition-transform">
            <Plus size={20} strokeWidth={3} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
