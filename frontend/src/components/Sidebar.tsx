import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  ShoppingCart, 
  Receipt, 
  BarChart3, 
  Users,
  Wallet,
  Settings,
  ChevronLeft, 
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/debt', label: 'Credit Tracking', icon: Wallet },
  { to: '/pos', label: 'Point of Sale', icon: ShoppingCart },
  { to: '/sales', label: 'Sales History', icon: Receipt },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  return (
    <>
      {/* Mobile Toggle Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 z-50">
        <h1 className="font-serif text-xl font-bold tracking-tight uppercase">Mnemos</h1>
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 text-primary hover:text-accent transition-colors"
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[60]"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <motion.aside 
        animate={{ width: isCollapsed ? 80 : 288 }}
        className={`fixed lg:sticky top-0 left-0 z-[70] h-screen bg-white border-r border-border flex flex-col transform ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } transition-transform lg:transition-none duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]`}
      >
        {/* Logo Section */}
        <div className={`px-6 py-10 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="group cursor-default"
            >
              <h1 className="font-serif text-2xl font-bold tracking-tighter leading-none">MNEMOS</h1>
              <div className="h-0.5 w-0 group-hover:w-full bg-accent transition-all duration-500 mt-1" />
              <p className="text-[9px] text-muted uppercase font-bold tracking-[0.4em] mt-3 opacity-60">Terminal 01</p>
            </motion.div>
          )}
          {isCollapsed && <div className="font-serif text-2xl font-bold text-accent">M</div>}
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 hover:bg-surface transition-colors cursor-pointer rounded-full"
          >
            <ChevronLeft className={`transition-transform duration-500 ${isCollapsed ? 'rotate-180' : ''}`} size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto no-scrollbar">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3.5 text-[10px] uppercase tracking-[0.2em] transition-all relative group rounded-none ${
                  isActive
                    ? 'text-accent font-bold active'
                    : 'text-muted hover:text-primary hover:bg-surface'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isCollapsed ? 'mx-auto' : ''} />
                  {!isCollapsed && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="truncate"
                    >
                      {label}
                    </motion.span>
                  )}
                  
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-active"
                      className={`absolute left-0 w-1 bg-accent h-6 top-1/2 -translate-y-1/2 ${isCollapsed ? 'hidden' : ''}`}
                    />
                  )}
                  
                  {/* Tooltip for collapsed mode */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-4 px-4 py-2 bg-primary text-white text-[9px] tracking-[0.2em] uppercase rounded-none opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-xl">
                      {label}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-surface/50">
           <div className={`flex items-center gap-4 ${isCollapsed ? 'justify-center' : ''}`}>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-10 h-10 border border-primary flex items-center justify-center text-[10px] font-bold bg-white cursor-pointer hover:border-accent hover:text-accent transition-colors"
              >
                {user?.name?.substring(0, 2).toUpperCase() || 'AD'}
              </motion.div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-primary truncate uppercase tracking-widest">{user?.name || 'Admin User'}</p>
                  <p className="text-[9px] text-muted truncate lowercase opacity-60">{user?.email || 'admin@craft.io'}</p>
                </div>
              )}
           </div>
           
           <button 
             onClick={logout}
             className={`mt-6 w-full flex items-center gap-4 px-4 py-2.5 text-[9px] uppercase tracking-[0.3em] text-muted hover:text-accent transition-colors cursor-pointer border border-transparent hover:border-accent/10 ${isCollapsed ? 'justify-center border-none' : ''}`}
           >
             <LogOut size={14} />
             {!isCollapsed && <span>Sign Out</span>}
           </button>
        </div>
      </motion.aside>
    </>
  );
}

