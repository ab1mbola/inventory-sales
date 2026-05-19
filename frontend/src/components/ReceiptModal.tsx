import type { Sale } from '../types';
import { X, Printer } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  sale: Sale;
  onClose: () => void;
}

export default function ReceiptModal({ sale, onClose }: Props) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[110] p-6 lg:p-12 overflow-y-auto no-scrollbar"
      onClick={onClose}
    >
      <div 
        className="bg-white text-primary w-full max-w-md shadow-[20px_20px_0px_0px_rgba(0,0,0,0.1)] border border-black overflow-hidden flex flex-col max-h-[90vh] my-auto animate-in zoom-in-95 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Hidden on print) */}
        <div className="p-8 bg-surface flex items-center justify-between border-b border-black print:hidden">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] italic">Receipt Preview</h3>
          <div className="flex items-center gap-6">
            <button 
              onClick={handlePrint}
              className="text-muted hover:text-accent transition-colors cursor-pointer"
              title="Generate Hardcopy"
            >
              <Printer size={20} strokeWidth={1} />
            </button>
            <button 
              onClick={onClose}
              className="text-muted hover:text-accent transition-colors cursor-pointer"
            >
              <X size={20} strokeWidth={1} />
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="p-10 flex-1 overflow-y-auto print:p-0 print:overflow-visible no-scrollbar bg-white" id="receipt-content">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif font-bold tracking-tighter uppercase italic leading-none">Mnemos</h1>
            <p className="text-[9px] font-bold text-muted uppercase tracking-[0.4em] mt-4">Sales Management System</p>
            <div className="mt-8 flex flex-col items-center gap-2">
              <p className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] border border-black px-4 py-1">REF: {sale.id.slice(0, 8).toUpperCase()}</p>
              <p className="text-[9px] font-bold text-muted mt-2 uppercase tracking-widest">{format(new Date(sale.createdAt), 'MMM dd, yyyy • HH:mm')}</p>
            </div>
          </div>

          <div className="border-t border-b border-black py-8 mb-10">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-muted border-b border-border">
                  <th className="pb-4 text-[9px] font-bold uppercase tracking-[0.2em]">Item</th>
                  <th className="pb-4 text-[9px] font-bold uppercase tracking-[0.2em] text-center">Qty</th>
                  <th className="pb-4 text-[9px] font-bold uppercase tracking-[0.2em] text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sale.items.map((item) => (
                  <tr key={item.id} className="group">
                    <td className="py-6 pr-4">
                      <div className="font-bold text-primary text-[11px] uppercase tracking-tight">{item.product?.name || 'GENERIC ITEM'}</div>
                      <div className="text-[9px] text-muted font-bold uppercase tracking-[0.1em] mt-2 italic">{item.product?.sku}</div>
                    </td>
                    <td className="py-6 text-center text-primary font-bold">{item.quantity}</td>
                    <td className="py-6 text-right font-serif font-bold italic text-primary text-sm">₦{(item.price * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 mb-12">
            <div className="flex justify-between text-[10px] font-bold">
              <span className="text-muted uppercase tracking-[0.2em]">Subtotal</span>
              <span className="text-primary">₦{Number(sale.totalAmount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[10px] font-bold">
              <span className="text-muted uppercase tracking-[0.2em]">Tax (0%)</span>
              <span className="text-primary">₦0</span>
            </div>
            <div className="flex justify-between border-t-2 border-black pt-6 mt-6">
              <span className="text-[11px] font-bold uppercase tracking-[0.4em]">Total</span>
              <span className="text-2xl font-serif font-bold italic text-accent leading-none">₦{Number(sale.totalAmount).toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-surface p-8 space-y-4 mb-12 border border-border">
            <div className="flex justify-between text-[9px] font-bold uppercase tracking-[0.2em]">
              <span className="text-muted">Payment:</span>
              <span className="text-primary">{sale.paymentMethod}</span>
            </div>
            {sale.paymentMethod === 'CASH' && sale.amountReceived && (
              <>
                <div className="flex justify-between text-[9px] font-bold uppercase tracking-[0.2em]">
                  <span className="text-muted">Received:</span>
                  <span className="text-primary">₦{Number(sale.amountReceived).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[9px] font-bold uppercase tracking-[0.2em]">
                  <span className="text-muted">Change:</span>
                  <span className="text-accent">₦{Number(sale.changeAmount).toLocaleString()}</span>
                </div>
              </>
            )}
            {(sale.paymentMethod === 'CREDIT' || sale.customerName) && (
              <div className="border-t border-border pt-6 mt-6">
                <p className="text-[9px] uppercase font-bold text-muted tracking-[0.3em] mb-3 italic">Customer Info</p>
                <p className="text-xs font-bold text-primary uppercase tracking-tight">{sale.customerName || 'UNKNOWN'}</p>
                {sale.customerPhone && <p className="text-[10px] font-bold text-muted mt-2 tracking-widest">{sale.customerPhone}</p>}
              </div>
            )}
          </div>

          <div className="text-center space-y-6">
            <p className="text-[9px] font-bold text-muted uppercase tracking-[0.3em] italic">Thank you for your business!</p>
            <div className="h-px bg-border w-12 mx-auto" />
            <p className="text-[8px] font-bold text-muted/30 uppercase tracking-[0.5em]">Generated by Mnemos System</p>
          </div>
        </div>

        {/* Footer (Hidden on print) */}
        <div className="p-10 bg-surface border-t border-black print:hidden">
          <button 
            onClick={onClose}
            className="w-full h-16 craft-btn text-[10px] cursor-pointer"
          >
            CLOSE & CONTINUE
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
