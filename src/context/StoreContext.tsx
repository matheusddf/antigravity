import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { StoreConfig, Category, Product, Banner, DeliveryArea } from '@/types';

interface StoreContextType {
  config: StoreConfig | null;
  categories: Category[];
  products: Product[];
  banners: Banner[];
  deliveryAreas: DeliveryArea[];
  loading: boolean;
  refreshData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [deliveryAreas, setDeliveryAreas] = useState<DeliveryArea[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [
        { data: configData },
        { data: catData },
        { data: prodData },
        { data: bannerData },
        { data: areaData }
      ] = await Promise.all([
        supabase.from('configuracoes').select('*').single(),
        supabase.from('categorias').select('*').order('ordem'),
        supabase.from('produtos').select('*'),
        supabase.from('banners').select('*').order('ordem'),
        supabase.from('delivery_areas').select('*').order('bairro')
      ]);

      if (configData) {
        setConfig(configData);
      } else {
        // Fallback or initial config if table is empty
        setConfig({
          id: 'default',
          nome_loja: 'Minha Loja',
          logo_url: null,
          whatsapp: '5586999999999',
          endereco: 'Endereço da Loja',
          horarios: {},
          pagamentos: ['Pix', 'Dinheiro'],
          esta_aberto: true,
          frete_gratis_valor: null
        });
      }
      if (catData) setCategories(catData);
      if (prodData) setProducts(prodData);
      if (bannerData) setBanners(bannerData);
      if (areaData) setDeliveryAreas(areaData);
    } catch (error) {
      console.error('Error fetching store data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Setup real-time subscriptions
    const configSub = supabase.channel('config-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'configuracoes' }, fetchData)
      .subscribe();

    const catSub = supabase.channel('cat-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categorias' }, fetchData)
      .subscribe();

    const prodSub = supabase.channel('prod-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'produtos' }, fetchData)
      .subscribe();

    return () => {
      configSub.unsubscribe();
      catSub.unsubscribe();
      prodSub.unsubscribe();
    };
  }, []);

  return (
    <StoreContext.Provider value={{ config, categories, products, banners, deliveryAreas, loading, refreshData: fetchData }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
