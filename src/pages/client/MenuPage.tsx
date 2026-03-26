import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/context/StoreContext';
import { useCart } from '@/context/CartContext';
import { ProductCard } from '@/components/client/ProductCard';
import { BannerCarousel } from '@/components/client/BannerCarousel';
import { ProductModal } from '@/components/client/ProductModal';
import { CartSidebar } from '@/components/client/CartSidebar';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  ShoppingBag, 
  Clock, 
  MapPin, 
  Info,
  ChevronRight,
  Star,
  Zap,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MenuPage() {
  const { config, categories, products, banners } = useStore();
  const { items, total } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showPromo, setShowPromo] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    
    // Show promo after 1 minute
    const timer = setTimeout(() => setShowPromo(true), 60000);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  const scrollToCategory = (catId: string) => {
    setSelectedCategory(catId);
    const element = categoryRefs.current[catId];
    if (element) {
      const offset = 120; // Adjust based on header height
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.descricao?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'todos' || p.categoria_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const productsByCategory = categories.map(cat => ({
    ...cat,
    products: products.filter(p => 
      p.categoria_id === cat.id && 
      (p.nome.toLowerCase().includes(searchQuery.toLowerCase()) || 
       p.descricao?.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })).filter(cat => cat.products.length > 0);

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Cover & Logo Section */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <img 
          src={config?.cover_url || "https://picsum.photos/seed/burger-cover/1920/1080?blur=4"} 
          className="w-full h-full object-cover opacity-60"
          alt="Cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Logo */}
          <div className="w-32 h-32 rounded-full border-4 border-background bg-surface overflow-hidden shadow-2xl">
            <img 
              src={config?.logo_url || 'https://picsum.photos/seed/logo/200'} 
              className="w-full h-full object-cover"
              alt="Logo"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Store Info */}
          <div className="space-y-2">
            <h1 className="text-3xl font-display font-bold text-primary tracking-tighter">
              {config?.nome_loja || 'BS Burger'}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[10px]",
                config?.esta_aberto ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
              )}>
                <span className={cn("w-2 h-2 rounded-full animate-pulse", config?.esta_aberto ? "bg-green-500" : "bg-red-500")} />
                {config?.esta_aberto ? 'Aberto Agora' : 'Fechado'}
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <MapPin size={14} className="text-primary" />
                <span>{config?.endereco || 'Teresina, PI'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-8 sticky top-4 z-40">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={20} />
            <input 
              type="text"
              placeholder="O que você deseja comer hoje?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-xl"
            />
          </div>
        </div>

        {/* Banners */}
        {banners.length > 0 && (
          <div className="mt-8">
            <BannerCarousel banners={banners} />
          </div>
        )}

        {/* Categories Horizontal Scroll */}
        <div className="mt-8 sticky top-20 md:top-24 z-30 bg-background/80 backdrop-blur-md py-4 -mx-4 px-4 overflow-x-auto no-scrollbar flex gap-3 scroll-smooth">
          <button
            onClick={() => scrollToCategory('todos')}
            className={cn(
              "px-6 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all border shrink-0",
              selectedCategory === 'todos' 
                ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(255,157,0,0.4)]" 
                : "bg-surface text-gray-400 border-white/5 hover:border-primary/50"
            )}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => scrollToCategory(cat.id)}
              className={cn(
                "px-6 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all border shrink-0",
                selectedCategory === cat.id 
                  ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(255,157,0,0.4)]" 
                  : "bg-surface text-gray-400 border-white/5 hover:border-primary/50"
              )}
            >
              {cat.nome}
            </button>
          ))}
        </div>

        {/* Product List Grouped by Category */}
        <div className="mt-8 space-y-12">
          {productsByCategory.map((cat) => (
            <div 
              key={cat.id} 
              ref={el => { categoryRefs.current[cat.id] = el; }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-display font-bold text-white tracking-tighter uppercase italic">
                  {cat.nome}
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent" />
              </div>

              <div className="grid grid-cols-1 gap-4">
                {cat.products.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onClick={() => setSelectedProduct(product)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Cart Button (Mobile) */}
      <AnimatePresence>
        {items.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-4 right-4 z-50 md:hidden"
          >
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-primary text-black font-bold py-4 px-6 rounded-2xl flex items-center justify-between shadow-[0_0_30px_rgba(255,157,0,0.4)] active:scale-95 transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="bg-black/20 px-2 py-1 rounded-lg text-xs">
                  {items.reduce((acc, i) => acc + i.quantidade, 0)}
                </div>
                <span>Ver Carrinho</span>
              </div>
              <span className="text-lg">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Cart Sidebar Toggle */}
      <div className="fixed bottom-8 right-8 z-50 hidden md:block">
        <button
          onClick={() => setIsCartOpen(true)}
          className="w-16 h-16 bg-primary text-black rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,157,0,0.4)] hover:scale-110 transition-transform relative"
        >
          <ShoppingBag size={28} />
          {items.length > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background">
              {items.reduce((acc, i) => acc + i.quantidade, 0)}
            </span>
          )}
        </button>
      </div>

      {/* Modals & Sidebar */}
      <ProductModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />
      
      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />

      {/* Promo Popup */}
      <AnimatePresence>
        {showPromo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPromo(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative w-full max-w-md glass-card border-primary/50 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-primary animate-pulse" />
              <button 
                onClick={() => setShowPromo(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full text-gray-400"
              >
                <X size={20} />
              </button>

              <div className="p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto border border-primary/30">
                  <Zap size={40} className="text-primary animate-bounce" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-3xl font-display font-bold text-primary italic uppercase tracking-tighter">
                    Oferta Relâmpago!
                  </h2>
                  <p className="text-gray-400">
                    Use o cupom <span className="text-white font-bold bg-white/10 px-2 py-1 rounded">BURGER20</span> e ganhe 20% de desconto na sua primeira compra!
                  </p>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => setShowPromo(false)}
                    className="w-full bg-primary text-black font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(255,157,0,0.4)]"
                  >
                    APROVEITAR AGORA
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
