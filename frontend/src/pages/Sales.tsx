import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import type { Sale } from '../types';
import { format } from 'date-fns';
import { Search, Printer, Eye, FileText } from 'lucide-react';
import { useState } from 'react';
import ReceiptModal from '../components/ReceiptModal';
import FullPageLoader from '../components/FullPageLoader';
import AnimatedPage from '../components/AnimatedPage';
import { motion, AnimatePresence } from 'framer-motion';


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

  if (isLoading) return <FullPageLoader message="Loading Sales..." />;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { ease: [0.23, 1, 0.32, 1] as const, duration: 0.6 } }
  };

  return (
    <AnimatedPage className="p-4 lg:p-12 max-w-[1600px] mx-auto space-y-12 bg-white font-sans">
      <AnimatePresence>
        {selectedSale && (
          <ReceiptModal 
            sale={selectedSale} 
            onClose={() => setSelectedSale(null)} 
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 border-b border-black pb-12">
        <div>
          <h1 className="text-4xl lg:text-6xl font-serif font-bold tracking-tighter uppercase leading-none italic">Sales</h1>
          <p className="text-[10px] text-muted mt-6 uppercase tracking-[0.5em] font-bold opacity-60 italic">Manage Sales & Transactions</p>
        </div>
        <div className="flex items-center gap-10">
           <div className="text-right">
              <p className="text-[9px] text-muted uppercase tracking-[0.3em] font-bold opacity-60">Total Sales</p>
              <p className="font-serif text-3xl font-bold italic leading-none mt-2">{filteredSales?.length || 0}</p>
           </div>
           <div className="h-14 w-px bg-black opacity-10" />
           <div className="text-right">
              <p className="text-[9px] text-muted uppercase tracking-[0.3em] font-bold opacity-60">System Status</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-2 italic text-accent">Online</p>
           </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group border-b border-black/5">
        <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors" size={18} strokeWidth={1} />
        <input
          type="text"
          placeholder="SEARCH BY ID OR CUSTOMER NAME..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-16 pl-10 pr-6 bg-transparent text-[11px] uppercase tracking-[0.4em] focus:outline-none transition-all placeholder:opacity-20 font-bold"
        />
      </div>

      {/* Sales Table */}
      <div className="craft-card overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface/50 border-b border-black text-left">
                <th className="px-8 py-6 text-[9px] font-bold text-muted uppercase tracking-[0.4em]">Date & Time</th>
                <th className="px-8 py-6 text-[9px] font-bold text-muted uppercase tracking-[0.4em]">Sale ID</th>
                <th className="px-8 py-6 text-[9px] font-bold text-muted uppercase tracking-[0.4em]">Customer</th>
                <th className="px-8 py-6 text-[9px] font-bold text-muted uppercase tracking-[0.4em] text-right">Quantity</th>
                <th className="px-8 py-6 text-[9px] font-bold text-muted uppercase tracking-[0.4em] text-right">Total Amount</th>
                <th className="px-8 py-6 text-[9px] font-bold text-muted uppercase tracking-[0.4em] text-center">Status</th>
                <th className="px-8 py-6 text-[9px] font-bold text-muted uppercase tracking-[0.4em] text-right">Actions</th>
              </tr>
            </thead>
            <motion.tbody 
              variants={container}
              initial="hidden"
              animate="show"
              className="divide-y divide-border"
            >
              {filteredSales?.map((sale) => (
                <motion.tr key={sale.id} variants={item} className="hover:bg-surface/30 transition-all duration-500 group">
                  <td className="px-8 py-8 whitespace-nowrap text-[10px] font-bold text-muted/60 uppercase tracking-widest">
                    {format(new Date(sale.createdAt), 'MMM dd, yyyy • HH:mm')}
                  </td>
                  <td className="px-8 py-8 whitespace-nowrap text-[10px] font-bold text-primary/30 uppercase tracking-widest font-mono">
                    {sale.id.slice(0, 8)}
                  </td>
                  <td className="px-8 py-8 whitespace-nowrap">
                    <div className="text-sm font-bold uppercase tracking-widest text-primary group-hover:text-accent transition-colors duration-500">{sale.customerName || 'Walk-in Customer'}</div>
                    <div className="text-[9px] text-muted font-bold uppercase tracking-[0.3em] mt-2 italic opacity-40">{sale.paymentMethod}</div>
                  </td>
                  <td className="px-8 py-8 whitespace-nowrap text-right text-[11px] font-bold text-muted opacity-60">
                    {sale.items?.reduce((acc, item) => acc + item.quantity, 0) || 0} ITEMS
                  </td>
                  <td className="px-8 py-8 whitespace-nowrap text-right text-xl font-serif font-bold italic text-primary tracking-tighter">
                    ₦{Number(sale.totalAmount).toLocaleString()}
                  </td>
                  <td className="px-8 py-8 whitespace-nowrap text-center">
                     <span className={`inline-block px-5 py-2 border text-[9px] font-bold uppercase tracking-[0.3em] ${
                        sale.paymentMethod === 'CREDIT' ? 'border-accent bg-accent-soft/30 text-accent' : 'border-primary/10 bg-surface text-primary/40'
                      }`}>
                        {sale.paymentMethod === 'CREDIT' ? 'Credit' : 'Paid'}
                      </span>
                  </td>
                  <td className="px-8 py-8 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-10 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                      <button 
                        onClick={() => setSelectedSale(sale)}
                        className="text-primary hover:text-accent transition-all transform hover:scale-110 cursor-pointer"
                        title="View Receipt"
                      >
                        <Eye size={18} strokeWidth={1} />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedSale(sale);
                          setTimeout(() => window.print(), 100);
                        }}
                        className="text-primary hover:text-accent transition-all transform hover:scale-110 cursor-pointer"
                        title="Print Receipt"
                      >
                        <Printer size={18} strokeWidth={1} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {(!filteredSales || filteredSales.length === 0) && (
                <motion.tr variants={item}>
                  <td colSpan={7} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-6 opacity-20">
                      <FileText size={48} strokeWidth={0.5} />
                      <p className="text-[10px] uppercase tracking-[0.6em] font-bold italic">No sales found</p>
                    </div>
                  </td>
                </motion.tr>
              )}
            </motion.tbody>
          </table>
        </div>
      </div>
    </AnimatedPage>
  );
}


