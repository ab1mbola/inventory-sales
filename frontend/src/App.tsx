import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import POS from './pages/POS';
import Sales from './pages/Sales';
import Reports from './pages/Reports';
import Customers from './pages/Customers';
import Debt from './pages/Debt';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';

import FullPageLoader from './components/FullPageLoader';

function ProtectedLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <FullPageLoader message="Authenticating Terminal..." />;
  }


  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white">
      <Sidebar />
      <main className="flex-1 overflow-auto pt-16 lg:pt-0">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/debt" element={<Debt />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<ProtectedLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
