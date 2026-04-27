import { useState } from 'react';
import { useDebt, useCustomerDebt } from '../hooks/useDebt';
import { 
  Wallet, 
  Search, 
  History, 
  ChevronRight, 
  ArrowDownLeft, 
  ArrowUpRight, 
  User, 
  Phone, 
  Calendar,
  Filter,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import type { DebtorStats, PaymentType } from '../types';

export default function Debt() {
  const { debtors, isLoadingDebtors, recordPayment } = useDebt();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDebtorId, setSelectedDebtorId] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentType>('CASH');
  const [paymentNote, setPaymentNote] = useState('');

  const { data: customerDetails, isLoading: isLoadingDetails } = useCustomerDebt(selectedDebtorId || undefined);

  const filteredDebtors = debtors?.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.phone?.includes(searchTerm)
  );

  const totalOutstanding = debtors?.reduce((sum, d) => sum + d.totalOwed, 0) || 0;

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebtorId || !paymentAmount) return;

    try {
      await recordPayment({
        customerId: selectedDebtorId,
        amount: Number(paymentAmount),
        method: paymentMethod,
        note: paymentNote
      });
      setIsPaymentModalOpen(false);
      setPaymentAmount('');
      setPaymentNote('');
      alert('Payment recorded successfully!');
    } catch (error) {
      alert('Failed to record payment');
    }
  };

  const selectedDebtor = debtors?.find(d => d.id === selectedDebtorId);

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto h-[calc(100vh-64px)] lg:h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-100">Credit Tracking</h1>
          <p className="text-sm text-gray-400 mt-1">Monitor outstanding debts and manage repayments.</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 px-6 py-3 rounded-2xl flex flex-col items-end">
          <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider">Total Outstanding</span>
          <span className="text-2xl font-bold text-red-500">₦{totalOutstanding.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 overflow-hidden">
        {/* Left Column: Debtors List */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4 min-h-0">
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search debtors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-2xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
            {isLoadingDebtors ? (
              <div className="p-10 text-center text-gray-500">Loading debtors...</div>
            ) : filteredDebtors?.length === 0 ? (
              <div className="p-10 text-center text-gray-500 bg-gray-900/30 rounded-2xl border border-dashed border-gray-800">
                <AlertCircle className="mx-auto mb-2 opacity-50" />
                No outstanding debts found.
              </div>
            ) : (
              filteredDebtors?.map((debtor) => (
                <button
                  key={debtor.id}
                  onClick={() => setSelectedDebtorId(debtor.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all relative overflow-hidden group ${
                    selectedDebtorId === debtor.id 
                      ? 'bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-500/5' 
                      : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-100 truncate">{debtor.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{debtor.phone || 'No phone'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-500">₦{debtor.totalOwed.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-500 uppercase mt-0.5">Owed</p>
                    </div>
                  </div>
                  
                  {debtor.lastPaymentDate && (
                    <div className="mt-3 pt-3 border-t border-gray-800/50 flex items-center gap-2 text-[10px] text-gray-400">
                      <Calendar size={10} />
                      Last payment: {format(new Date(debtor.lastPaymentDate), 'MMM d, yyyy')}
                    </div>
                  )}
                  
                  {selectedDebtorId === debtor.id && (
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-600" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Debt Details & History */}
        <div className="flex-1 bg-gray-900/50 border border-gray-800 rounded-3xl flex flex-col min-h-0 overflow-hidden">
          {!selectedDebtorId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-10 space-y-4">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center">
                <Wallet size={40} className="opacity-20" />
              </div>
              <p>Select a customer to view debt details and record payments.</p>
            </div>
          ) : isLoadingDetails ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Detail Header */}
              <div className="p-6 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400">
                    <User size={32} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-100">{customerDetails?.name}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-gray-400"><Phone size={12}/> {customerDetails?.phone}</span>
                      <span className="w-1 h-1 bg-gray-700 rounded-full" />
                      <span className="text-xs text-emerald-400 font-bold uppercase">Limit: ₦{customerDetails?.creditLimit?.toLocaleString() || '0'}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20 active:scale-95 flex items-center gap-2"
                >
                  <ArrowDownLeft size={18} />
                  Record Repayment
                </button>
              </div>

              {/* History Tabs/List */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex border-b border-gray-800 bg-gray-950/30">
                  <div className="px-6 py-4 border-b-2 border-blue-500 text-sm font-bold text-blue-400 flex items-center gap-2">
                    <History size={16} />
                    Transaction History
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {/* Combined history of credit sales and payments */}
                  {[
                    ...(customerDetails?.sales || []).map(s => ({ ...s, type: 'SALE' as const })),
                    ...(customerDetails?.payments || []).map(p => ({ ...p, type: 'PAYMENT' as const }))
                  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((item, idx) => (
                    <div key={idx} className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                      item.type === 'SALE' 
                        ? 'bg-red-500/5 border-red-500/10 hover:border-red-500/20' 
                        : 'bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/20'
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          item.type === 'SALE' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {item.type === 'SALE' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-100">
                            {item.type === 'SALE' ? 'Credit Purchase' : 'Debt Repayment'}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {format(new Date(item.createdAt), 'MMM d, yyyy • h:mm a')}
                            {item.type === 'PAYMENT' && (item as any).note && ` • ${(item as any).note}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${item.type === 'SALE' ? 'text-red-400' : 'text-emerald-400'}`}>
                          {item.type === 'SALE' ? `+₦${Number(item.totalAmount).toLocaleString()}` : `-₦${Number((item as any).amount).toLocaleString()}`}
                        </p>
                        {item.type === 'SALE' && (
                          <p className="text-[10px] text-gray-500 uppercase mt-0.5">Sale ID: {item.id.slice(0, 8)}</p>
                        )}
                        {item.type === 'PAYMENT' && (
                          <p className="text-[10px] text-gray-500 uppercase mt-0.5">Method: {(item as any).method}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-100">Record Payment</h2>
                <p className="text-xs text-gray-400 mt-1">For {selectedDebtor?.name}</p>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-gray-500 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Repayment Amount (₦)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="number"
                    required
                    autoFocus
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-100 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="0.00"
                  />
                </div>
                <div className="flex justify-between mt-1 px-1">
                   <span className="text-[10px] text-gray-500 italic">Remaining Debt: ₦{(selectedDebtor!.totalOwed - Number(paymentAmount || 0)).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['CASH', 'TRANSFER', 'CARD'] as const).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`py-2 text-[10px] font-bold uppercase rounded-lg border transition-all ${
                        paymentMethod === m 
                          ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/20' 
                          : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-600'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Note (Optional)</label>
                <textarea
                  rows={2}
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  placeholder="e.g. Partial payment for last week's stock"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!paymentAmount || Number(paymentAmount) <= 0}
                  className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function X({ size, className }: { size?: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
