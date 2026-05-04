import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { Package, ArrowRight, Loader2, Building2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
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

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none select-none text-right">
        <h1 className="font-serif text-[15vw] font-bold leading-none tracking-tighter uppercase">Join</h1>
        <h1 className="font-serif text-[10vw] font-bold leading-none tracking-tighter uppercase italic">Inventory</h1>
      </div>

      <div className="w-full max-w-sm relative z-10">
        <div className="text-left mb-12 border-b border-black pb-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 border-2 border-black flex items-center justify-center bg-black">
               <Package size={24} className="text-white" />
            </div>
            <h2 className="font-serif text-3xl font-bold tracking-tighter uppercase">Inventory</h2>
          </div>
          <h1 className="text-5xl font-serif font-bold tracking-tighter uppercase leading-none italic text-accent">Sign Up</h1>
          <p className="text-[10px] text-muted mt-4 uppercase tracking-[0.4em] font-bold">New Organization Enrollment</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="border border-red-500 text-red-500 p-4 text-[10px] font-bold uppercase tracking-widest animate-in fade-in slide-in-from-top-2 duration-300">
              Error: {typeof error === 'string' ? error : JSON.stringify(error)}
            </div>
          )}

          <div className="space-y-4">
            <div className="group">
              <label className="text-[9px] font-bold text-muted uppercase tracking-[0.3em] ml-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="JOHN DOE"
                className="w-full mt-2 px-4 py-4 bg-white border border-border focus:border-black outline-none transition-all text-xs tracking-wider uppercase font-bold"
              />
            </div>

            <div className="group">
              <label className="text-[9px] font-bold text-muted uppercase tracking-[0.3em] ml-1">Company Name</label>
              <div className="relative mt-2">
                <Building2 size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="ACME CORP"
                  className="w-full pl-10 pr-4 py-4 bg-white border border-border focus:border-black outline-none transition-all text-xs tracking-wider uppercase font-bold"
                />
              </div>
            </div>

            <div className="group">
              <label className="text-[9px] font-bold text-muted uppercase tracking-[0.3em] ml-1">Credential Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="IDENTITY@SYSTEM.IO"
                className="w-full mt-2 px-4 py-4 bg-white border border-border focus:border-black outline-none transition-all text-xs tracking-wider uppercase font-bold"
              />
            </div>

            <div className="group">
              <label className="text-[9px] font-bold text-muted uppercase tracking-[0.3em] ml-1">Access Passphrase</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full mt-2 px-4 py-4 bg-white border border-border focus:border-black outline-none transition-all text-xs tracking-wider font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-6 bg-black hover:bg-accent text-white font-bold uppercase tracking-[0.5em] text-[10px] transition-all duration-500 flex items-center justify-center gap-4 group disabled:opacity-20 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <span>Initialize Organization</span>
                <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-500" />
              </>
            )}
          </button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-[10px] text-muted uppercase tracking-widest font-bold">
            Already registered? <Link to="/login" className="text-accent hover:underline ml-2">Sign In</Link>
          </p>
        </div>

        <div className="mt-16 flex justify-between items-center opacity-40">
           <div className="h-px bg-black flex-1 mr-4" />
           <p className="text-[9px] font-bold uppercase tracking-widest whitespace-nowrap">
             Organization Setup — v1.0
           </p>
           <div className="h-px bg-black flex-1 ml-4" />
        </div>
      </div>
    </div>
  );
}
