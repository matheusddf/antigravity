import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { StoreProvider } from '@/context/StoreContext';
import { CartProvider } from '@/context/CartContext';

// Pages (to be created)
import MenuPage from '@/pages/client/MenuPage';
import AdminLayout from '@/layouts/AdminLayout';
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminOrders from '@/pages/admin/Orders';
import AdminProducts from '@/pages/admin/Products';
import AdminCategories from '@/pages/admin/Categories';
import AdminSettings from '@/pages/admin/Settings';
import AdminLogin from '@/pages/admin/Login';

export default function App() {
  return (
    <StoreProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Client Routes */}
            <Route path="/cardapio" element={<MenuPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="pedidos" element={<AdminOrders />} />
              <Route path="produtos" element={<AdminProducts />} />
              <Route path="categorias" element={<AdminCategories />} />
              <Route path="configuracoes" element={<AdminSettings />} />
            </Route>

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/cardapio" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-center" richColors theme="dark" />
      </CartProvider>
    </StoreProvider>
  );
}
