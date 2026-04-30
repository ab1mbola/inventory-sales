import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-border flex items-center justify-between px-6 z-50">
        <h1 className="font-serif text-xl font-bold tracking-tight uppercase">Inventory</h1>
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 text-primary hover:text-accent transition-colors"
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[60]"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed lg:sticky top-0 left-0 z-[70] h-screen bg-white border-r border-border flex flex-col transition-all duration-500 ease-[cubic-bezier(0.85,0,0.15,1)] transform ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'w-20' : 'w-72'}`}
      >
        {/* Logo Section */}
        <div className={`px-6 py-8 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <div className="group cursor-default">
              <h1 className="font-serif text-2xl font-bold tracking-tighter leading-none">INVENTORY</h1>
              <div className="h-0.5 w-0 group-hover:w-full bg-accent transition-all duration-500 mt-1" />
              <p className="text-[10px] text-muted uppercase font-bold tracking-[0.2em] mt-2">Management System</p>
            </div>
          )}
          {isCollapsed && <div className="font-serif text-2xl font-bold text-accent">V</div>}
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1 hover:text-accent transition-colors cursor-pointer"
          >
            <ChevronLeft className={`transition-transform duration-500 ${isCollapsed ? 'rotate-180' : ''}`} size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto no-scrollbar">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3.5 text-xs uppercase tracking-widest transition-all relative group ${
                  isActive
                    ? 'text-accent font-bold active'
                    : 'text-muted hover:text-primary'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isCollapsed ? 'mx-auto' : ''} />
                  {!isCollapsed && <span className="truncate">{label}</span>}
                  
                  {/* Active indicator */}
                  <div className={`absolute left-0 w-1 bg-accent transition-all duration-300 ${isCollapsed ? 'hidden' : ''} h-0 group-[.active]:h-6 top-1/2 -translate-y-1/2`} />
                  
                  {/* Tooltip for collapsed mode */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-4 px-3 py-1.5 bg-primary text-white text-[10px] tracking-widest uppercase rounded-none opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                      {label}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-surface/30">
           <div className={`flex items-center gap-4 ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="w-10 h-10 border border-primary flex items-center justify-center text-xs font-bold bg-white group hover:bg-accent hover:border-accent hover:text-white transition-all cursor-pointer">
                {user?.name?.substring(0, 2).toUpperCase() || 'AD'}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-primary truncate uppercase tracking-wider">{user?.name || 'Admin User'}</p>
                  <p className="text-[10px] text-muted truncate lowercase">{user?.email || 'admin@inventory.com'}</p>
                </div>
              )}
           </div>
           
           <button 
             onClick={logout}
             className={`mt-4 w-full flex items-center gap-4 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-muted hover:text-accent transition-colors cursor-pointer ${isCollapsed ? 'justify-center' : ''}`}
           >
             <LogOut size={16} />
             {!isCollapsed && <span>Sign Out</span>}
           </button>
        </div>
      </aside>
    </>
  );
}
