import { useState } from 'react';
import { useDebt, useCustomerDebt } from '../hooks/useDebt';
import { 
  Wallet, 
  Search, 
  History, 
  ArrowDownLeft, 
  ArrowUpRight, 
  User, 
  Calendar,
  DollarSign,
  AlertCircle,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import type { PaymentType } from '../types';
import FullPageLoader from '../components/FullPageLoader';


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
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto h-[calc(100vh-64px)] lg:h-screen flex flex-col overflow-hidden bg-white font-sans">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-black pb-6 flex-shrink-0 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold tracking-tighter uppercase leading-none italic">Debts</h1>
          <p className="text-[10px] text-muted mt-3 uppercase tracking-[0.3em] font-bold italic">Review and manage customer debts</p>
        </div>
        <div className="craft-card px-6 py-3 flex flex-col items-end bg-surface/30 border-l-4 border-l-accent">
          <span className="text-[10px] uppercase font-bold text-accent tracking-[0.2em] mb-1">Total Debt</span>
          <span className="text-xl font-serif font-bold italic leading-none text-primary">₦{totalOutstanding.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-12 min-h-0 overflow-hidden">
        {/* Left Column: Debtors List */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6 min-h-0">
          <div className="relative group flex-shrink-0">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors" size={16} />
            <input
              type="text"
              placeholder="SEARCH CUSTOMERS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-16 pr-6 bg-white border border-border text-[11px] uppercase tracking-widest focus:border-accent focus:outline-none transition-all placeholder:text-muted/30"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 no-scrollbar">
            {isLoadingDebtors ? (
              <div className="p-10 text-center text-muted text-[10px] uppercase tracking-[0.2em] font-bold">Loading Debtors...</div>
            ) : filteredDebtors?.length === 0 ? (
              <div className="p-16 text-center text-muted bg-surface/30 border border-dashed border-border craft-card">
                <AlertCircle className="mx-auto mb-4 opacity-20" size={32} strokeWidth={1} />
                <p className="text-[10px] uppercase font-bold tracking-[0.2em]">No debts found</p>
              </div>
            ) : (
              filteredDebtors?.map((debtor) => (
                <button
                  key={debtor.id}
                  onClick={() => setSelectedDebtorId(debtor.id)}
                  className={`w-full text-left p-4 border transition-all relative overflow-hidden group ${
                    selectedDebtorId === debtor.id 
                      ? 'bg-primary border-primary' 
                      : 'bg-white border-border hover:border-accent'
                  }`}
                >
                  <div className="flex justify-between items-start relative z-10">
                    <div className="min-w-0">
                      <h3 className={`text-base font-serif font-bold italic tracking-tight ${selectedDebtorId === debtor.id ? 'text-white' : 'text-primary'}`}>{debtor.name}</h3>
                      <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${selectedDebtorId === debtor.id ? 'text-white/60' : 'text-muted'}`}>{debtor.phone || 'No Phone'}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-serif font-bold italic leading-none ${selectedDebtorId === debtor.id ? 'text-white' : 'text-accent'}`}>₦{debtor.totalOwed.toLocaleString()}</p>
                      <p className={`text-[8px] font-bold uppercase tracking-widest mt-1 ${selectedDebtorId === debtor.id ? 'text-white/60' : 'text-muted'}`}>Owed</p>
                    </div>
                  </div>
                  
                  {debtor.lastPaymentDate && (
                    <div className={`mt-6 pt-4 border-t flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.2em] relative z-10 ${
                      selectedDebtorId === debtor.id ? 'border-white/10 text-white/40' : 'border-border text-muted/50'
                    }`}>
                      <Calendar size={12} />
                      Last Payment: {format(new Date(debtor.lastPaymentDate), 'MMM d, yyyy')}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="flex-1 craft-card flex flex-col min-h-0 overflow-hidden bg-surface/10">
          {!selectedDebtorId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted p-20 space-y-8">
              <div className="w-32 h-32 border border-border flex items-center justify-center bg-white shadow-inner">
                <Wallet size={48} strokeWidth={0.5} className="opacity-30" />
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Select a Customer</p>
                <p className="text-[11px] mt-4 uppercase tracking-widest opacity-50">Select a customer to view history</p>
              </div>
            </div>
          ) : isLoadingDetails ? (
            <div className="flex-1 flex items-center justify-center">
              <FullPageLoader message="Loading History..." />
            </div>
          ) : (

            <div className="flex-1 flex flex-col min-h-0">
              {/* Detail Header */}
              <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-end justify-between gap-6 bg-white">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 border border-primary flex items-center justify-center bg-primary text-white">
                    <User size={32} strokeWidth={0.5} />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-bold italic tracking-tight text-primary">{customerDetails?.name}</h2>
                    <div className="flex flex-col gap-1 mt-2">
                      <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Phone: {customerDetails?.phone || 'N/A'}</p>
                      <p className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Credit Limit: ₦{customerDetails?.creditLimit?.toLocaleString() || '0'}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="craft-btn h-12 px-8 flex items-center gap-3 text-[10px]"
                >
                  <ArrowDownLeft size={18} />
                  Add Payment
                </button>
              </div>

              {/* History */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="px-10 py-6 border-b border-border bg-white flex items-center justify-between">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-3">
                    <History size={16} />
                    Transaction History
                  </h3>
                  <div className="h-px bg-border flex-1 mx-8" />
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-surface/30">
                  {[
                    ...(customerDetails?.sales || []).map(s => ({ ...s, type: 'SALE' as const })),
                    ...(customerDetails?.payments || []).map(p => ({ ...p, type: 'PAYMENT' as const }))
                  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((item, idx) => (
                    <div key={idx} className={`p-4 border flex items-center justify-between transition-all bg-white hover:border-accent ${
                      item.type === 'SALE' ? 'border-border' : 'border-accent/20'
                    }`}>
                      <div className="flex items-center gap-6">
                        <div className={`w-10 h-10 border flex items-center justify-center ${
                          item.type === 'SALE' ? 'border-primary text-primary' : 'border-accent text-accent'
                        }`}>
                          {item.type === 'SALE' ? <ArrowUpRight size={18} strokeWidth={1} /> : <ArrowDownLeft size={18} strokeWidth={1} />}
                        </div>
                        <div>
                          <p className={`text-xs font-bold uppercase tracking-widest ${item.type === 'SALE' ? 'text-primary' : 'text-accent'}`}>
                            {item.type === 'SALE' ? 'Credit Sale' : 'Payment'}
                          </p>
                          <p className="text-[9px] font-bold text-muted uppercase tracking-[0.15em] mt-1">
                            {format(new Date(item.createdAt), 'MMM d, yyyy • HH:mm')}
                            {item.type === 'PAYMENT' && (item as any).note && ` • ${(item as any).note}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-base font-serif font-bold italic ${item.type === 'SALE' ? 'text-primary' : 'text-accent'}`}>
                          {item.type === 'SALE' ? `+₦${Number(item.totalAmount).toLocaleString()}` : `-₦${Number((item as any).amount).toLocaleString()}`}
                        </p>
                        <p className="text-[8px] font-bold text-muted/50 uppercase tracking-widest mt-1">
                          {item.type === 'SALE' ? `REF: ${item.id.slice(0, 8)}` : `METHOD: ${(item as any).method}`}
                        </p>
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
        <div 
          className="fixed inset-0 z-[100] flex items-start justify-center p-6 lg:p-12 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto no-scrollbar"
          onClick={() => setIsPaymentModalOpen(false)}
        >
          <div 
            className="bg-white border border-black w-full max-w-xl my-auto shadow-[20px_20px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden animate-in slide-in-from-bottom-8 duration-500"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border flex flex-col gap-2 bg-surface/50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-serif font-bold italic tracking-tight">Add Payment</h2>
                <button onClick={() => setIsPaymentModalOpen(false)} className="text-muted hover:text-accent transition-colors cursor-pointer"><X size={20} /></button>
              </div>
              <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Customer: {selectedDebtor?.name}</p>
            </div>
            
            <form onSubmit={handleRecordPayment} className="p-6 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-muted uppercase tracking-[0.3em]">Amount (₦)</label>
                <div className="relative">
                  <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-muted" size={20} strokeWidth={1} />
                  <input
                    type="number"
                    required
                    autoFocus
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full h-14 pl-16 pr-6 bg-white border border-border text-2xl font-serif font-bold italic focus:border-accent focus:outline-none transition-all placeholder:text-muted/10"
                    placeholder="0.00"
                  />
                </div>
                <div className="pt-2 border-t border-dashed border-border flex justify-between">
                   <span className="text-[9px] font-bold text-muted uppercase tracking-[0.2em]">Remaining Debt: ₦{(selectedDebtor!.totalOwed - Number(paymentAmount || 0)).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold text-muted uppercase tracking-[0.3em]">Payment Method</label>
                <div className="grid grid-cols-3 gap-6">
                  {(['CASH', 'TRANSFER', 'CARD'] as const).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`h-14 text-[10px] font-bold uppercase tracking-[0.2em] border transition-all cursor-pointer ${
                        paymentMethod === m 
                          ? 'bg-primary border-primary text-white shadow-xl' 
                          : 'bg-white border-border text-muted hover:border-primary'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold text-muted uppercase tracking-[0.3em]">Note</label>
                <textarea
                  rows={2}
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full px-6 py-4 bg-white border border-border text-[11px] uppercase tracking-widest focus:border-accent focus:outline-none transition-all resize-none"
                  placeholder="ENTER NOTE..."
                />
              </div>

              <div className="pt-6 flex gap-6">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="flex-1 h-12 border border-border text-muted hover:text-primary hover:border-primary text-[10px] font-bold uppercase tracking-[0.3em] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!paymentAmount || Number(paymentAmount) <= 0}
                  className="flex-1 h-12 craft-btn text-[10px] cursor-pointer"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

