import { useState } from 'react';
import { useCustomers } from '../hooks/useCustomers';
import { 
  Users, 
  Search, 
  X,
  Mail, 
  Phone, 
  MapPin, 
  Edit2, 
  Trash2, 
  UserPlus
} from 'lucide-react';
import type { Customer } from '../types';
import FullPageLoader from '../components/FullPageLoader';


export default function Customers() {
  const { data: customers, isLoading, createCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    creditLimit: ''
  });

  const filteredCustomers = customers?.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await updateCustomer({ id: editingCustomer.id, ...formData, creditLimit: Number(formData.creditLimit) });
      } else {
        await createCustomer({ ...formData, creditLimit: Number(formData.creditLimit) });
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      alert('Failed to save customer');
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      creditLimit: customer.creditLimit?.toString() || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteCustomer(id);
      } catch (error) {
        alert('Failed to delete customer');
      }
    }
  };

  const resetForm = () => {
    setEditingCustomer(null);
    setFormData({ name: '', email: '', phone: '', address: '', creditLimit: '' });
  };

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto space-y-8 bg-white font-sans">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-black pb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold tracking-tighter uppercase leading-none italic">Customers</h1>
          <p className="text-[10px] text-muted mt-3 uppercase tracking-[0.3em] font-bold italic">Manage your customer database</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="craft-btn flex items-center justify-center gap-3 px-6 h-12 text-[10px]"
        >
          <UserPlus size={18} />
          Add Customer
        </button>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors" size={18} />
          <input
            type="text"
            placeholder="SEARCH BY NAME, PHONE OR EMAIL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-6 h-12 bg-white border border-border text-[11px] uppercase tracking-[0.1em] focus:border-accent focus:outline-none transition-all placeholder:text-muted/50"
          />
        </div>
        <div className="craft-card px-6 h-12 flex items-center justify-between bg-surface/30">
          <span className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Total</span>
          <span className="text-lg font-serif font-bold italic text-primary leading-none">{customers?.length || 0}</span>
        </div>
      </div>

      {/* Customers Grid */}
      {isLoading ? (
        <FullPageLoader message="Loading Customers..." />
      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers?.map((customer) => (
            <div key={customer.id} className="craft-card p-6 group hover:bg-surface/50 transition-all border-l-4 border-l-primary hover:border-l-accent">
              <div className="flex justify-between items-start mb-8">
                <div className="w-12 h-12 border border-primary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <Users size={20} strokeWidth={1} />
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(customer)} className="p-2 text-muted hover:text-primary transition-colors cursor-pointer">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(customer.id)} className="p-2 text-muted hover:text-accent transition-colors cursor-pointer">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <h3 className="text-xl font-serif font-bold tracking-tight mb-4 italic">{customer.name}</h3>
              
              <div className="space-y-4">
                {customer.phone && (
                  <div className="flex items-center gap-4 text-[11px] text-muted uppercase tracking-wider font-medium">
                    <Phone size={14} className="text-primary/40" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                {customer.email && (
                  <div className="flex items-center gap-4 text-[11px] text-muted uppercase tracking-wider font-medium">
                    <Mail size={14} className="text-primary/40" />
                    <span className="truncate lowercase tracking-normal">{customer.email}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-center gap-4 text-[11px] text-muted uppercase tracking-wider font-medium">
                    <MapPin size={14} className="text-primary/40" />
                    <span className="truncate">{customer.address}</span>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-border grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] uppercase font-bold text-muted tracking-[0.2em] mb-2 italic">Credit Limit</p>
                  <p className="text-sm font-bold text-accent italic">₦{customer.creditLimit?.toLocaleString() || '0'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase font-bold text-muted tracking-[0.2em] mb-2 italic">Sales</p>
                  <p className="text-sm font-bold text-primary italic">{customer._count?.sales || 0} TRX</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-start justify-center p-6 lg:p-12 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto no-scrollbar"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white border border-black w-full max-w-xl my-auto shadow-[20px_20px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden animate-in slide-in-from-bottom-8 duration-500"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border flex items-center justify-between bg-surface/50">
              <h2 className="text-xl font-serif font-bold italic tracking-tight">{editingCustomer ? 'Edit Customer' : 'Add Customer'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted hover:text-accent transition-colors cursor-pointer"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-[0.3em]">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-12 px-6 bg-white border border-border text-[11px] uppercase tracking-widest focus:border-accent focus:outline-none transition-all placeholder:text-muted/30"
                    placeholder="NAME"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-[0.3em]">Phone Number</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full h-12 px-6 bg-white border border-border text-[11px] uppercase tracking-widest focus:border-accent focus:outline-none transition-all"
                      placeholder="080..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-[0.3em]">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full h-12 px-6 bg-white border border-border text-[11px] focus:border-accent focus:outline-none transition-all"
                      placeholder="EMAIL"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-[0.3em]">Credit Limit (₦)</label>
                  <input
                    type="number"
                    value={formData.creditLimit}
                    onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                    className="w-full h-12 px-6 bg-white border border-border text-sm font-bold text-accent focus:border-accent focus:outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-[0.3em]">Address</label>
                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-6 py-3 bg-white border border-border text-[11px] uppercase tracking-widest focus:border-accent focus:outline-none transition-all resize-none"
                    placeholder="ADDRESS"
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-12 border border-border text-muted hover:text-primary hover:border-primary text-[10px] font-bold uppercase tracking-[0.3em] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-12 craft-btn text-[10px] cursor-pointer"
                >
                  {editingCustomer ? 'Save Changes' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

