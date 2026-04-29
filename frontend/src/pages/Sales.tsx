import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import type { Sale } from '../types';
import { format } from 'date-fns';
import { Search, Filter, Printer, Eye } from 'lucide-react';
import { useState } from 'react';
import ReceiptModal from '../components/ReceiptModal';
import FullPageLoader from '../components/FullPageLoader';


export function useSales() {
  return useQuery<Sale[]>({
    queryKey: ['sales'],
    queryFn: () => api.get('/sales').then((res) => res.data),
  });
}

export default function Sales() {
  const { data: sales, isLoading } = useSales();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const filteredSales = sales?.filter(sale => 
    sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <FullPageLoader message="Retrieving Ledger..." />;


  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto space-y-8 bg-white font-sans">
      {selectedSale && (
        <ReceiptModal 
          sale={selectedSale} 
          onClose={() => setSelectedSale(null)} 
        />
      )}

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-black pb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold tracking-tighter uppercase leading-none italic">Sales</h1>
          <p className="text-[10px] text-muted mt-3 uppercase tracking-[0.4em] font-bold italic">Archive of Historical Transactions</p>
        </div>
        <div className="craft-card px-6 py-3 flex flex-col items-end bg-surface/30 border-l-4 border-l-primary">
          <span className="text-[10px] uppercase font-bold text-muted tracking-[0.3em] mb-1">Total Sales</span>
          <span className="text-xl font-serif font-bold italic leading-none text-primary">{filteredSales?.length || 0}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors" size={18} />
        <input
          type="text"
          placeholder="SEARCH BY ID OR CUSTOMER NAME..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-12 pl-16 pr-6 bg-white border border-black text-[11px] uppercase tracking-[0.2em] focus:border-accent focus:outline-none transition-all placeholder:text-muted/20 font-bold"
        />
      </div>

      {/* Sales Table */}
      <div className="craft-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
            <thead>
              <tr className="bg-surface border-b border-black text-left">
                <th className="px-6 py-4 text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Date & Time</th>
                <th className="px-6 py-4 text-[10px] font-bold text-primary uppercase tracking-[0.3em]">ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Customer</th>
                <th className="px-6 py-4 text-[10px] font-bold text-primary uppercase tracking-[0.3em] text-right">Items</th>
                <th className="px-6 py-4 text-[10px] font-bold text-primary uppercase tracking-[0.3em] text-right">Total</th>
                <th className="px-6 py-4 text-[10px] font-bold text-primary uppercase tracking-[0.3em] text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-primary uppercase tracking-[0.3em] text-right">Actions</th>
              </tr>
            </thead>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredSales?.map((sale) => (
                <tr key={sale.id} className="hover:bg-surface/50 transition-all group">
                  <td className="px-6 py-4 whitespace-nowrap text-[10px] font-bold text-muted uppercase tracking-widest">
                    {format(new Date(sale.createdAt), 'MMM dd, yyyy • HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[10px] font-bold text-primary/40 uppercase tracking-widest font-mono">
                    {sale.id.slice(0, 8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-[13px] font-bold uppercase tracking-tight text-primary">{sale.customerName || 'WALK-IN'}</div>
                    <div className="text-[9px] text-muted font-bold uppercase tracking-[0.2em] mt-2 italic">{sale.paymentMethod}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-[11px] font-bold text-muted">
                    {sale.items?.reduce((acc, item) => acc + item.quantity, 0) || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-base font-serif font-bold italic text-primary">
                    ₦{Number(sale.totalAmount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                     <span className={`inline-block px-3 py-1 border text-[9px] font-bold uppercase tracking-[0.2em] ${
                        sale.paymentMethod === 'CREDIT' ? 'border-accent text-accent' : 'border-primary/20 text-primary/40'
                      }`}>
                        {sale.paymentMethod === 'CREDIT' ? 'Credit' : 'Paid'}
                      </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-6">
                      <button 
                        onClick={() => setSelectedSale(sale)}
                        className="text-muted hover:text-primary transition-all cursor-pointer"
                        title="View Receipt"
                      >
                        <Eye size={18} strokeWidth={1} />
                      </button>
                      <button 
                         onClick={() => {
                          setSelectedSale(sale);
                          setTimeout(() => window.print(), 100);
                         }}
                         className="text-muted hover:text-accent transition-all cursor-pointer"
                         title="Print"
                      >
                        <Printer size={18} strokeWidth={1} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
