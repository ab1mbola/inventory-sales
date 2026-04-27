import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import type { Sale } from '../types';
import { format } from 'date-fns';
import { Search, Filter, Printer, Eye } from 'lucide-react';
import { useState } from 'react';
import ReceiptModal from '../components/ReceiptModal';

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

  if (isLoading) return <div className="p-8 text-center text-slate-400">Loading Sales History...</div>;

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
      {selectedSale && (
        <ReceiptModal 
          sale={selectedSale} 
          onClose={() => setSelectedSale(null)} 
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Sales History</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and review all past transactions.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by ID or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-inner"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-2 bg-white text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors font-bold text-xs uppercase tracking-widest cursor-pointer">
          <Filter size={16} />
          <span>Filters</span>
        </button>
      </div>

      {/* Sales Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100 text-left">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Time</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sale ID</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Items</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSales?.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50 transition-colors group border-b border-slate-50 last:border-0">
                  <td className="px-6 py-5 whitespace-nowrap text-xs font-bold text-slate-500">
                    {format(new Date(sale.createdAt), 'MMM dd, HH:mm')}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-[10px] font-mono text-slate-400 font-bold">
                    #{sale.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="text-sm font-black text-slate-900">{sale.customerName || 'Walk-in'}</div>
                    <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{sale.paymentMethod}</div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-bold text-slate-400">
                    {sale.items?.reduce((acc, item) => acc + item.quantity, 0) || 0}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-black text-blue-600">
                    ₦{Number(sale.totalAmount).toLocaleString()}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-center">
                     <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        sale.paymentMethod === 'CREDIT' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {sale.paymentMethod === 'CREDIT' ? 'Credit' : 'Success'}
                      </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-right space-x-3">
                    <button 
                      onClick={() => setSelectedSale(sale)}
                      className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer shadow-inner"
                      title="View Receipt"
                    >
                      <Eye size={18} strokeWidth={2.5} />
                    </button>
                    <button 
                       onClick={() => {
                        setSelectedSale(sale);
                        setTimeout(() => window.print(), 100);
                       }}
                       className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer shadow-inner"
                       title="Print"
                    >
                      <Printer size={18} strokeWidth={2.5} />
                    </button>
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
