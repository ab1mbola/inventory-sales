import type { Sale } from '../types';
import { X, Printer } from 'lucide-react';

interface Props {
  sale: Sale;
  onClose: () => void;
}

export default function ReceiptModal({ sale, onClose }: Props) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 w-full max-w-md rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
        {/* Header (Hidden on print) */}
        <div className="p-6 bg-slate-50 flex items-center justify-between border-b border-slate-100 print:hidden">
          <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Receipt Preview</h3>
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrint}
              className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl text-slate-500 transition-all cursor-pointer border border-transparent hover:border-slate-200"
              title="Print Receipt"
            >
              <Printer size={18} />
            </button>
            <button 
              onClick={onClose}
              className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl text-slate-500 transition-all cursor-pointer border border-transparent hover:border-slate-200"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="p-8 flex-1 overflow-y-auto print:p-0 print:overflow-visible" id="receipt-content">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black uppercase tracking-[0.2em] text-slate-900">INVENTORY</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Sales Management System</p>
            <div className="mt-6 flex flex-col items-center gap-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">REF: {sale.id.slice(0, 8).toUpperCase()}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-1">{new Date(sale.createdAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="border-t border-b border-dashed border-slate-200 py-6 mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-50">
                  <th className="pb-3 font-black uppercase tracking-widest text-[10px]">Item</th>
                  <th className="pb-3 font-black uppercase tracking-widest text-[10px] text-center">Qty</th>
                  <th className="pb-3 font-black uppercase tracking-widest text-[10px] text-right">Price</th>
                  <th className="pb-3 font-black uppercase tracking-widest text-[10px] text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sale.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-4 pr-2">
                      <div className="font-black text-slate-900 text-xs">{item.product?.name || 'Unknown Product'}</div>
                      <div className="text-[9px] text-slate-400 font-black uppercase tracking-[0.1em] mt-0.5">{item.product?.sku}</div>
                    </td>
                    <td className="py-4 text-center text-slate-600 font-bold text-xs">{item.quantity}</td>
                    <td className="py-4 text-right text-slate-600 font-bold text-xs">₦{Number(item.price).toLocaleString()}</td>
                    <td className="py-4 text-right font-black text-slate-900 text-xs">₦{(item.price * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 mb-8">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-400 uppercase tracking-widest">Subtotal</span>
              <span className="text-slate-900">₦{Number(sale.totalAmount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-400 uppercase tracking-widest">Tax (0%)</span>
              <span className="text-slate-900">₦0</span>
            </div>
            <div className="flex justify-between text-xl font-black border-t-2 border-slate-900 pt-4 mt-4">
              <span className="text-slate-900 uppercase tracking-widest">Total</span>
              <span className="text-blue-600">₦{Number(sale.totalAmount).toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 space-y-3 mb-8">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="text-slate-400">Payment:</span>
              <span className="text-slate-900">{sale.paymentMethod}</span>
            </div>
            {sale.paymentMethod === 'CASH' && sale.amountReceived && (
              <>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">Received:</span>
                  <span className="text-slate-900">₦{Number(sale.amountReceived).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">Change:</span>
                  <span className="text-emerald-600">₦{Number(sale.changeAmount).toLocaleString()}</span>
                </div>
              </>
            )}
            {(sale.paymentMethod === 'CREDIT' || sale.customerName) && (
              <div className="border-t border-slate-200 pt-4 mt-4">
                <p className="text-[9px] uppercase font-black text-slate-400 tracking-[0.2em] mb-2">Customer Info</p>
                <p className="text-sm font-black text-slate-900">{sale.customerName || 'N/A'}</p>
                {sale.customerPhone && <p className="text-xs font-bold text-slate-500 mt-1">{sale.customerPhone}</p>}
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="text-xs font-bold text-slate-400 italic">Thank you for your business!</p>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-6">Generated by Inventory OS</p>
          </div>
        </div>

        {/* Footer (Hidden on print) */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 print:hidden">
          <button 
            onClick={onClose}
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 cursor-pointer"
          >
            Close & Continue
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-content, #receipt-content * {
            visibility: visible;
          }
          #receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}} />
    </div>
  );
}
