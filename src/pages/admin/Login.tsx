import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { Lock } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast.success('Login realizado com sucesso!');
      navigate('/admin');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4 border border-primary/20">
            <Lock size={32} />
          </div>
          <h1 className="text-3xl font-display font-bold text-primary">Painel Admin</h1>
          <p className="text-gray-400">Entre com suas credenciais para gerenciar sua loja</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <Input 
            label="E-mail" 
            type="email" 
            placeholder="admin@exemplo.com" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Input 
            label="Senha" 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <Button className="w-full" type="submit" loading={loading}>
            Entrar no Sistema
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
