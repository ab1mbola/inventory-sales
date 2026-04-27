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
      {/* Mobile Toggle Header (Visible only on mobile) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Package size={18} className="text-white" />
          </div>
          <span className="font-bold text-slate-900 tracking-tight">Inventory</span>
        </div>
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 text-slate-500 hover:text-slate-900"
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed lg:sticky top-0 left-0 z-[70] h-screen bg-white border-r border-slate-200 flex flex-col transition-all duration-300 transform ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Logo Section */}
        <div className={`px-5 py-6 border-b border-slate-100 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">📦 Inventory</h1>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">Admin Portal</p>
            </div>
          )}
          {isCollapsed && <Package size={24} className="text-blue-600" />}
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors cursor-pointer"
          >
            <ChevronLeft className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all relative group ${
                  isActive
                    ? 'bg-blue-600/5 text-blue-600 font-bold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon size={20} className={isCollapsed ? 'mx-auto' : ''} />
              {!isCollapsed && <span className="truncate">{label}</span>}
              
              {/* Tooltip for collapsed mode */}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                  {label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 space-y-2">
           <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                {user?.name?.substring(0, 2).toUpperCase() || 'AD'}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{user?.name || 'Admin User'}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@inventory.com'}</p>
                </div>
              )}
           </div>
           
           <button 
             onClick={logout}
             className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-red-500 hover:bg-red-50 transition-colors cursor-pointer ${isCollapsed ? 'justify-center' : ''}`}
           >
             <LogOut size={16} />
             {!isCollapsed && <span>Logout</span>}
           </button>
        </div>
      </aside>
    </>
  );
}
