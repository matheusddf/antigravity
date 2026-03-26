import { createContext, useContext, useState, useEffect } from 'react';
import { OrderItem, Product, Complemento } from '@/types';

interface CartContextType {
  items: OrderItem[];
  addItem: (product: Product, quantity: number, additions: Complemento[], removals: string[], notes: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<OrderItem[]>([]);

  const addItem = (product: Product, quantity: number, additions: Complemento[], removals: string[], notes: string) => {
    const newItem: OrderItem = {
      id: `${product.id}-${Date.now()}`,
      nome: product.nome,
      preco: product.preco,
      quantidade: quantity,
      adicionais: additions,
      removidos: removals,
      observacoes: notes
    };
    setItems(prev => [...prev, newItem]);
  };

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = Math.max(1, item.quantidade + delta);
        return { ...item, quantidade: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((acc, item) => {
    const additionsTotal = item.adicionais?.reduce((sum, add) => sum + add.preco, 0) || 0;
    return acc + (item.preco + additionsTotal) * item.quantidade;
  }, 0);

  const itemCount = items.reduce((acc, item) => acc + item.quantidade, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
