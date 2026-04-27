import { useState } from 'react';
import { useDebt, useCustomerDebt } from '../hooks/useDebt';
import { 
  Wallet, 
  Search, 
  History, 
  ArrowDownLeft, 
  ArrowUpRight, 
  User, 
  Phone, 
  Calendar,
  DollarSign,
  AlertCircle,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import type { PaymentType } from '../types';

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
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto h-[calc(100vh-64px)] lg:h-screen flex flex-col overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Credit Tracking</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor outstanding debts and manage repayments.</p>
        </div>
        <div className="bg-white border border-slate-200 px-6 py-4 rounded-3xl flex flex-col items-end shadow-sm">
          <span className="text-[10px] uppercase font-black text-red-500 tracking-widest mb-1">Total Outstanding</span>
          <span className="text-2xl font-black text-slate-900">₦{totalOutstanding.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 overflow-hidden">
        {/* Left Column: Debtors List */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4 min-h-0">
          <div className="relative flex-shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search debtors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 no-scrollbar">
            {isLoadingDebtors ? (
              <div className="p-10 text-center text-slate-400 font-medium">Loading debtors...</div>
            ) : filteredDebtors?.length === 0 ? (
              <div className="p-10 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                <AlertCircle className="mx-auto mb-2 opacity-30" />
                No outstanding debts found.
              </div>
            ) : (
              filteredDebtors?.map((debtor) => (
                <button
                  key={debtor.id}
                  onClick={() => setSelectedDebtorId(debtor.id)}
                  className={`w-full text-left p-5 rounded-[2rem] border transition-all relative overflow-hidden group shadow-sm ${
                    selectedDebtorId === debtor.id 
                      ? 'bg-blue-600 border-blue-600 shadow-xl shadow-blue-500/10' 
                      : 'bg-white border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex justify-between items-start relative z-10">
                    <div className="min-w-0">
                      <h3 className={`font-black truncate ${selectedDebtorId === debtor.id ? 'text-white' : 'text-slate-900'}`}>{debtor.name}</h3>
                      <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${selectedDebtorId === debtor.id ? 'text-blue-100' : 'text-slate-400'}`}>{debtor.phone || 'No phone'}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-base font-black ${selectedDebtorId === debtor.id ? 'text-white' : 'text-red-600'}`}>₦{debtor.totalOwed.toLocaleString()}</p>
                      <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${selectedDebtorId === debtor.id ? 'text-blue-100' : 'text-slate-400'}`}>Owed</p>
                    </div>
                  </div>
                  
                  {debtor.lastPaymentDate && (
                    <div className={`mt-4 pt-4 border-t flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider relative z-10 ${
                      selectedDebtorId === debtor.id ? 'border-blue-500 text-blue-100' : 'border-slate-50 text-slate-400'
                    }`}>
                      <Calendar size={12} />
                      Last paid: {format(new Date(debtor.lastPaymentDate), 'MMM d, yyyy')}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Debt Details & History */}
        <div className="flex-1 bg-white border border-slate-200 rounded-[2.5rem] flex flex-col min-h-0 overflow-hidden shadow-sm">
          {!selectedDebtorId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-10 space-y-6">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center shadow-inner">
                <Wallet size={48} className="opacity-40" />
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-slate-400">No Debtor Selected</p>
                <p className="text-sm font-medium mt-1">Select a customer to view history and record payments.</p>
              </div>
            </div>
          ) : isLoadingDetails ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Detail Header */}
              <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-50/30">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                    <User size={40} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">{customerDetails?.name}</h2>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest"><Phone size={14} className="text-slate-300" /> {customerDetails?.phone}</span>
                      <span className="w-1 h-1 bg-slate-200 rounded-full" />
                      <span className="text-xs text-emerald-600 font-black uppercase tracking-widest">Credit Limit: ₦{customerDetails?.creditLimit?.toLocaleString() || '0'}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center gap-3 cursor-pointer"
                >
                  <ArrowDownLeft size={20} strokeWidth={2.5} />
                  Repayment
                </button>
              </div>

              {/* History Tabs/List */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex border-b border-slate-50 bg-white">
                  <div className="px-8 py-5 border-b-4 border-blue-600 text-xs font-black uppercase tracking-[0.2em] text-blue-600 flex items-center gap-2">
                    <History size={16} strokeWidth={2.5} />
                    Transactions
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-5 no-scrollbar">
                  {[
                    ...(customerDetails?.sales || []).map(s => ({ ...s, type: 'SALE' as const })),
                    ...(customerDetails?.payments || []).map(p => ({ ...p, type: 'PAYMENT' as const }))
                  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((item, idx) => (
                    <div key={idx} className={`p-5 rounded-[1.5rem] border flex items-center justify-between transition-all shadow-sm ${
                      item.type === 'SALE' 
                        ? 'bg-rose-50 border-rose-100 hover:border-rose-200' 
                        : 'bg-emerald-50 border-emerald-100 hover:border-emerald-200'
                    }`}>
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${
                          item.type === 'SALE' ? 'bg-white text-rose-600' : 'bg-white text-emerald-600'
                        }`}>
                          {item.type === 'SALE' ? <ArrowUpRight size={22} strokeWidth={2.5} /> : <ArrowDownLeft size={22} strokeWidth={2.5} />}
                        </div>
                        <div>
                          <p className={`text-sm font-black ${item.type === 'SALE' ? 'text-rose-900' : 'text-emerald-900'}`}>
                            {item.type === 'SALE' ? 'Credit Purchase' : 'Debt Repayment'}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {format(new Date(item.createdAt), 'MMM d, yyyy • HH:mm')}
                            {item.type === 'PAYMENT' && (item as any).note && ` • ${(item as any).note}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-base font-black ${item.type === 'SALE' ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {item.type === 'SALE' ? `+₦${Number(item.totalAmount).toLocaleString()}` : `-₦${Number((item as any).amount).toLocaleString()}`}
                        </p>
                        {item.type === 'SALE' && (
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">REF: {item.id.slice(0, 8)}</p>
                        )}
                        {item.type === 'PAYMENT' && (
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">MODE: {(item as any).method}</p>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Payment</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Customer: {selectedDebtor?.name}</p>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-900 p-2 hover:bg-slate-50 rounded-full transition-colors cursor-pointer">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleRecordPayment} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Repayment Amount (₦)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={24} strokeWidth={2.5} />
                  <input
                    type="number"
                    required
                    autoFocus
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-2xl font-black focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder-slate-200"
                    placeholder="0.00"
                  />
                </div>
                <div className="flex justify-between mt-2 px-1">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Balance after: ₦{(selectedDebtor!.totalOwed - Number(paymentAmount || 0)).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Method</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['CASH', 'TRANSFER', 'CARD'] as const).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all cursor-pointer ${
                        paymentMethod === m 
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100' 
                          : 'bg-white border-slate-200 text-slate-400 hover:border-slate-400'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Note (Optional)</label>
                <textarea
                  rows={2}
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none placeholder-slate-300"
                  placeholder="Reference or reason..."
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="flex-1 px-6 py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 font-black uppercase tracking-widest rounded-2xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!paymentAmount || Number(paymentAmount) <= 0}
                  className="flex-1 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-300 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-emerald-500/20 cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

