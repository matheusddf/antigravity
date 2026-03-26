import { motion, HTMLMotionProps } from 'motion/react';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  children: ReactNode;
}

export function Button({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  loading, 
  children, 
  ...props 
}: ButtonProps) {
  const variants = {
    primary: 'bg-primary text-black hover:bg-white shadow-[0_0_20px_rgba(255,165,0,0.3)]',
    secondary: 'bg-surface text-white hover:bg-white/10',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-black',
    ghost: 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5',
    danger: 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'inline-flex items-center justify-center rounded-2xl font-display font-black italic uppercase tracking-tighter transition-all disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </motion.button>
  );
}
