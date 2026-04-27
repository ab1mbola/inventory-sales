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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[110] p-4 overflow-y-auto">
      <div className="bg-white text-gray-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header (Hidden on print) */}
        <div className="p-4 bg-gray-100 flex items-center justify-between border-b border-gray-200 print:hidden">
          <h3 className="font-bold">Sale Receipt</h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint}
              className="p-2 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors cursor-pointer"
              title="Print Receipt"
            >
              <Printer size={18} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="p-8 flex-1 overflow-y-auto print:p-0 print:overflow-visible" id="receipt-content">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold uppercase tracking-widest">📦 INVENTORY</h1>
            <p className="text-sm text-gray-500">Sales Management System</p>
            <p className="text-xs text-gray-400 mt-1">Receipt ID: {sale.id.slice(0, 8).toUpperCase()}</p>
            <p className="text-xs text-gray-400">{new Date(sale.createdAt).toLocaleString()}</p>
          </div>

          <div className="border-t border-b border-dashed border-gray-300 py-4 mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-2 font-medium">Item</th>
                  <th className="pb-2 font-medium text-center">Qty</th>
                  <th className="pb-2 font-medium text-right">Price</th>
                  <th className="pb-2 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sale.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 pr-2">
                      <div className="font-medium text-gray-800">{item.product?.name || 'Unknown Product'}</div>
                      <div className="text-[10px] text-gray-400 uppercase">{item.product?.sku}</div>
                    </td>
                    <td className="py-3 text-center text-gray-600">{item.quantity}</td>
                    <td className="py-3 text-right text-gray-600">₦{Number(item.price).toLocaleString()}</td>
                    <td className="py-3 text-right font-medium text-gray-800">₦{(item.price * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-800 font-medium">₦{Number(sale.totalAmount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tax (0%)</span>
              <span className="text-gray-800 font-medium">₦0</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-gray-100 pt-2 mt-2">
              <span className="text-gray-900">Total</span>
              <span className="text-blue-600">₦{Number(sale.totalAmount).toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2 mb-6">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Payment Method:</span>
              <span className="font-bold text-gray-700 uppercase">{sale.paymentMethod}</span>
            </div>
            {sale.paymentMethod === 'CASH' && sale.amountReceived && (
              <>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Amount Paid:</span>
                  <span className="font-bold text-gray-700">₦{Number(sale.amountReceived).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Change:</span>
                  <span className="font-bold text-green-600">₦{Number(sale.changeAmount).toLocaleString()}</span>
                </div>
              </>
            )}
            {(sale.paymentMethod === 'CREDIT' || sale.customerName) && (
              <div className="border-t border-gray-200 pt-2 mt-2">
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Customer Details</p>
                <p className="text-sm font-medium text-gray-800">{sale.customerName || 'N/A'}</p>
                {sale.customerPhone && <p className="text-xs text-gray-500">{sale.customerPhone}</p>}
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-400 italic">Thank you for your business!</p>
            <p className="text-[10px] text-gray-300 mt-4">This is a system generated receipt.</p>
          </div>
        </div>

        {/* Footer (Hidden on print) */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 print:hidden">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all cursor-pointer"
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
