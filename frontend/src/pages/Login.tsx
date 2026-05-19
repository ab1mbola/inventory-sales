import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { Package, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedPage from '../components/AnimatedPage';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err: any) {
      const errorData = err.response?.data?.error;
      const errorMessage = typeof errorData === 'string' 
        ? errorData 
        : errorData?.message || errorData?.code || err.response?.data?.message || 'Authentication Failed.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { ease: [0.23, 1, 0.32, 1] as const, duration: 0.8 } }
  };

  return (
    <AnimatedPage className="min-h-screen bg-white flex flex-col items-center justify-center p-8 relative overflow-hidden font-sans">
      {/* Editorial Background Element */}
      <motion.div 
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 0.03, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute top-0 right-0 p-12 pointer-events-none select-none"
      >
        <h1 className="font-serif text-[25vw] font-bold leading-none tracking-tighter uppercase italic">Login</h1>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo Section */}
        <motion.div variants={item} className="text-left mb-16 border-b border-black pb-10">
          <div className="flex items-center gap-4 mb-10 group cursor-default">
            <motion.div 
              whileHover={{ rotate: 90, backgroundColor: "var(--color-accent)", borderColor: "var(--color-accent)" }}
              className="w-14 h-14 border-2 border-black flex items-center justify-center transition-all duration-700"
            >
               <Package size={28} className="text-black group-hover:text-white transition-colors" />
            </motion.div>
            <h2 className="font-serif text-4xl font-bold tracking-tighter uppercase italic">Mnemos</h2>
          </div>
          <h1 className="text-6xl font-serif font-bold tracking-tighter uppercase leading-none italic text-primary">Login</h1>
          <p className="text-[10px] text-muted mt-6 uppercase tracking-[0.5em] font-bold opacity-40 italic">Secure Access v1.0</p>
        </motion.div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-12">
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="border-l-4 border-accent bg-accent-soft/30 p-5 text-[10px] font-bold uppercase tracking-widest text-accent"
            >
              Login Error: {typeof error === 'string' ? error : 'Authorization Denied'}
            </motion.div>
          )}

          <motion.div variants={item} className="space-y-6">
            <div className="group">
              <label className="text-[9px] font-bold text-muted uppercase tracking-[0.4em] ml-1 group-focus-within:text-accent transition-colors duration-500">Email Address</label>
              <div className="relative mt-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-6 py-5 bg-surface border border-border focus:border-black outline-none transition-all text-xs tracking-[0.2em] uppercase font-bold placeholder:opacity-20"
                />
              </div>
            </div>

            <div className="group">
              <label className="text-[9px] font-bold text-muted uppercase tracking-[0.4em] ml-1 group-focus-within:text-accent transition-colors duration-500">Password</label>
              <div className="relative mt-3">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-6 py-5 bg-surface border border-border focus:border-black outline-none transition-all text-xs tracking-widest font-bold placeholder:opacity-20 pr-16"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-muted/40 hover:text-black transition-colors"
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>
          </motion.div>

          <motion.button
            variants={item}
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02, backgroundColor: "var(--color-accent)" }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-7 bg-black text-white font-bold uppercase tracking-[0.6em] text-[10px] transition-all duration-700 flex items-center justify-center gap-6 group active:scale-[0.98] disabled:opacity-20 cursor-pointer shadow-2xl"
          >
            {isLoading ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={20} className="group-hover:translate-x-3 transition-transform duration-700" />
              </>
            )}
          </motion.button>
        </form>

        <motion.div variants={item} className="mt-16 text-center">
          <p className="text-[10px] text-muted uppercase tracking-[0.3em] font-bold">
            Don't have an account? <Link to="/register" className="text-accent hover:tracking-[0.5em] transition-all ml-4 underline decoration-1 underline-offset-4">Register here</Link>
          </p>
        </motion.div>

        {/* Footer */}
        <motion.div variants={item} className="mt-20 flex justify-between items-center opacity-20">
           <div className="h-px bg-black flex-1 mr-6" />
           <p className="text-[9px] font-bold uppercase tracking-[0.5em] whitespace-nowrap italic">
             Mnemos System — 2026
           </p>
           <div className="h-px bg-black flex-1 ml-6" />
        </motion.div>
      </motion.div>
    </AnimatedPage>
  );
}


