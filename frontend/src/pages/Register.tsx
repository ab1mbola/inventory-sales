import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { Package, ArrowRight, Loader2, Building2, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedPage from '../components/AnimatedPage';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
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
      const res = await api.post('/auth/register', { 
        email, 
        password, 
        name, 
        companyName 
      });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err: any) {
      const errorData = err.response?.data?.error;
      const errorMessage = typeof errorData === 'string' 
        ? errorData 
        : errorData?.message || errorData?.code || err.response?.data?.message || 'Registration Failed.';
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
    <AnimatedPage className="min-h-screen bg-background flex flex-col items-center justify-center p-8 relative overflow-hidden font-sans">
      {/* Editorial Background Element */}
      <motion.div 
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 0.03, x: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute top-0 right-0 p-12 pointer-events-none select-none text-right"
      >
        <h1 className="font-sans text-[20vw] font-black leading-none tracking-tighter uppercase">Register</h1>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-sm relative z-10"
      >
        <motion.div variants={item} className="text-left mb-12 border-b border-border pb-10">
          <div className="flex items-center gap-4 mb-10 group">
            <motion.div 
              whileHover={{ scale: 1.1, backgroundColor: "var(--color-primary)" }}
              className="w-14 h-14 border-2 border-black rounded-2xl flex items-center justify-center bg-black transition-all duration-500"
            >
               <Package size={28} className="text-white" />
            </motion.div>
            <h2 className="font-sans text-4xl font-black tracking-tighter uppercase">Mnemos</h2>
          </div>
          <h1 className="text-6xl font-sans font-black tracking-tighter uppercase leading-none text-primary">Join</h1>
          <p className="text-[10px] text-muted mt-6 uppercase tracking-[0.5em] font-bold opacity-40">Create your account</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="border border-accent/20 bg-accent-soft/30 rounded-xl p-5 text-[10px] font-bold uppercase tracking-widest text-accent"
            >
              Registration Error: {typeof error === 'string' ? error : 'Registration Rejected'}
            </motion.div>
          )}

          <motion.div variants={item} className="space-y-6">
            <div className="group">
              <label className="text-[9px] font-bold text-muted uppercase tracking-[0.4em] ml-1 group-focus-within:text-accent transition-colors duration-500">Full Name</label>
              <div className="relative mt-3">
                <User size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted/40 group-focus-within:text-black transition-colors" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="FULL NAME"
                  className="w-full pl-12 pr-6 py-5 bg-surface border border-border rounded-xl focus:border-accent focus:ring-4 focus:ring-accent-soft outline-none transition-all text-xs tracking-[0.1em] uppercase font-bold placeholder:opacity-20"
                />
              </div>
            </div>

            <div className="group">
              <label className="text-[9px] font-bold text-muted uppercase tracking-[0.4em] ml-1 group-focus-within:text-accent transition-colors duration-500">Company Name</label>
              <div className="relative mt-3">
                <Building2 size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted/40 group-focus-within:text-black transition-colors" />
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="ACME CORP"
                  className="w-full pl-12 pr-6 py-5 bg-surface border border-border rounded-xl focus:border-accent focus:ring-4 focus:ring-accent-soft outline-none transition-all text-xs tracking-[0.1em] uppercase font-bold placeholder:opacity-20"
                />
              </div>
            </div>

            <div className="group">
              <label className="text-[9px] font-bold text-muted uppercase tracking-[0.4em] ml-1 group-focus-within:text-accent transition-colors duration-500">Email Address</label>
              <div className="relative mt-3">
                <Mail size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted/40 group-focus-within:text-black transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full pl-12 pr-6 py-5 bg-surface border border-border rounded-xl focus:border-accent focus:ring-4 focus:ring-accent-soft outline-none transition-all text-xs tracking-[0.1em] uppercase font-bold placeholder:opacity-20"
                />
              </div>
            </div>

            <div className="group">
              <label className="text-[9px] font-bold text-muted uppercase tracking-[0.4em] ml-1 group-focus-within:text-accent transition-colors duration-500">Password</label>
              <div className="relative mt-3">
                <Lock size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted/40 group-focus-within:text-black transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-16 py-5 bg-surface border border-border rounded-xl focus:border-accent focus:ring-4 focus:ring-accent-soft outline-none transition-all text-xs tracking-widest font-bold placeholder:opacity-20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-muted/40 hover:text-black transition-colors cursor-pointer"
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
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-5 bg-primary text-white font-bold uppercase tracking-[0.4em] text-[10px] rounded-full transition-all duration-300 flex items-center justify-center gap-6 group disabled:opacity-20 cursor-pointer shadow-2xl hover:bg-accent hover:shadow-accent"
          >
            {isLoading ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight size={20} className="group-hover:translate-x-3 transition-transform duration-300" />
              </>
            )}
          </motion.button>
        </form>

        <motion.div variants={item} className="mt-16 text-center">
          <p className="text-[10px] text-muted uppercase tracking-[0.3em] font-bold">
            Already registered? <Link to="/login" className="text-accent hover:tracking-[0.5em] transition-all ml-4 underline decoration-1 underline-offset-4">Sign In</Link>
          </p>
        </motion.div>

        {/* Footer */}
        <motion.div variants={item} className="mt-20 flex justify-between items-center opacity-30">
           <div className="h-px bg-border flex-1 mr-6" />
           <p className="text-[9px] font-bold uppercase tracking-[0.5em] whitespace-nowrap">
             Mnemos System — v1.0
           </p>
           <div className="h-px bg-border flex-1 ml-6" />
        </motion.div>
      </motion.div>
    </AnimatedPage>
  );
}
