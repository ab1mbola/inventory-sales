import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import type { Sale } from '../types';
import { format } from 'date-fns';
import { ShoppingBag, Search, Filter, Printer, Eye } from 'lucide-react';
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

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading Sales History...</div>;

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
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-100">Sales History</h1>
          <p className="text-sm text-gray-400 mt-1">Manage and review all past transactions.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search by ID or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-xl border border-gray-700 hover:bg-gray-700 transition-colors">
          <Filter size={18} />
          <span>Filters</span>
        </button>
      </div>

      {/* Sales Table */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-3xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50 text-left">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Sale ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Items</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Total</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredSales?.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-800/30 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {format(new Date(sale.createdAt), 'MMM dd, HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-500">
                    #{sale.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-200">{sale.customerName || 'Walk-in'}</div>
                    <div className="text-[10px] text-gray-500 uppercase">{sale.paymentMethod}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-400">
                    {sale.items?.reduce((acc, item) => acc + item.quantity, 0) || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-blue-400">
                    ₦{Number(sale.totalAmount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                     <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        sale.paymentMethod === 'CREDIT' ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'
                      }`}>
                        {sale.paymentMethod === 'CREDIT' ? 'Pending' : 'Success'}
                      </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                    <button 
                      onClick={() => setSelectedSale(sale)}
                      className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all cursor-pointer"
                      title="View Receipt"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                       onClick={() => {
                        setSelectedSale(sale);
                        setTimeout(() => window.print(), 100);
                       }}
                       className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all cursor-pointer"
                       title="Print"
                    >
                      <Printer size={18} />
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
