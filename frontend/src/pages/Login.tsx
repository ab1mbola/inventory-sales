import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { Package, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
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
      setError(err.response?.data?.error || 'Authentication Failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 relative overflow-hidden font-sans">
      {/* Editorial Background Element */}
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none select-none">
        <h1 className="font-serif text-[20vw] font-bold leading-none tracking-tighter uppercase">Inventory</h1>
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo Section */}
        <div className="text-left mb-16 border-b border-black pb-8">
          <div className="flex items-center gap-4 mb-8 group cursor-default">
            <div className="w-12 h-12 border-2 border-black flex items-center justify-center group-hover:bg-accent group-hover:border-accent transition-all duration-500">
               <Package size={24} className="text-black group-hover:text-white transition-colors" />
            </div>
            <h2 className="font-serif text-3xl font-bold tracking-tighter uppercase">Inventory</h2>
          </div>
          <h1 className="text-5xl font-serif font-bold tracking-tighter uppercase leading-none italic text-accent">Sign In</h1>
          <p className="text-[10px] text-muted mt-4 uppercase tracking-[0.4em] font-bold">Access Terminal v1.0</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-10">
          {error && (
            <div className="border border-red-500 text-red-500 p-4 text-[10px] font-bold uppercase tracking-widest animate-in fade-in slide-in-from-top-2 duration-300">
              Error: {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="group">
              <label className="text-[9px] font-bold text-muted uppercase tracking-[0.3em] ml-1 group-focus-within:text-accent transition-colors">Credential Email</label>
              <div className="relative mt-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="IDENTITY@SYSTEM.IO"
                  className="w-full px-4 py-5 bg-white border border-border focus:border-black outline-none transition-all text-xs tracking-wider uppercase font-bold placeholder:text-muted/30"
                />
              </div>
            </div>

            <div className="group">
              <label className="text-[9px] font-bold text-muted uppercase tracking-[0.3em] ml-1 group-focus-within:text-accent transition-colors">Access Passphrase</label>
              <div className="relative mt-2">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-5 bg-white border border-border focus:border-black outline-none transition-all text-xs tracking-wider font-bold"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-6 bg-black hover:bg-accent text-white font-bold uppercase tracking-[0.5em] text-[10px] transition-all duration-500 flex items-center justify-center gap-4 group active:scale-[0.98] disabled:opacity-20 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <span>Authenticate</span>
                <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-500" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-20 flex justify-between items-center opacity-40">
           <div className="h-px bg-black flex-1 mr-4" />
           <p className="text-[9px] font-bold uppercase tracking-widest whitespace-nowrap">
             Inventory System — 2026
           </p>
           <div className="h-px bg-black flex-1 ml-4" />
        </div>
      </div>
    </div>
  );
}
