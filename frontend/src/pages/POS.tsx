import { useState, useMemo } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useCustomers } from '../hooks/useCustomers';
import { useCreateSale } from '../hooks/useSales';
import { useCartStore } from '../store/cartStore';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Banknote, 
  RefreshCcw, 
  User, 
  UserPlus,
  Check,
  ChevronDown,
  Loader2
} from 'lucide-react';
import LoadingOverlay from '../components/LoadingOverlay';
import ReceiptModal from '../components/ReceiptModal';
import FullPageLoader from '../components/FullPageLoader';
import type { Sale, Customer, Product, Category } from '../types';


export default function POS() {
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories } = useCategories();
  const { data: customers, createCustomer } = useCustomers();
  const createSale = useCreateSale();
  
  const { items, addItem, removeItem, updateQuantity, clearCart, total } = useCartStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'TRANSFER' | 'CREDIT'>('CASH');
  
  // Customer Selection
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [isAddingNewCustomer, setIsAddingNewCustomer] = useState(false);

  // Checkout Details
  const [amountReceived, setAmountReceived] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const cartTotal = total();
  
  const canGoToStep2 = true; // Walk-ins allowed, so step 1 is always valid
  const canGoToStep3 = items.length > 0;
  const canExecute = paymentMethod !== 'CASH' || (amountReceived && parseFloat(amountReceived) >= cartTotal);
  const change = useMemo(() => {
    if (paymentMethod !== 'CASH' || !amountReceived) return 0;
    const received = parseFloat(amountReceived);
    return isNaN(received) ? 0 : Math.max(0, received - cartTotal);
  }, [amountReceived, cartTotal, paymentMethod]);

  const filteredProducts = (products as Product[])?.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredCustomers = (customers as Customer[])?.filter((c) => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone?.includes(customerSearch)
  );

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    // Validations
    if (paymentMethod === 'CASH') {
      const received = parseFloat(amountReceived);
      if (isNaN(received) || received < cartTotal) {
        alert('Insufficient cash amount received.');
        return;
      }
    }

    if (paymentMethod === 'CREDIT' && !selectedCustomer && !customerName.trim()) {
      alert('Customer selection is required for credit sales.');
      return;
    }
    
    try {
      let finalCustomerId = selectedCustomer?.id;
      let finalCustomerName = selectedCustomer?.name || customerName.trim();
      let finalCustomerPhone = selectedCustomer?.phone || customerPhone.trim();

      // Inline customer creation if needed
      if (!selectedCustomer && customerName.trim() && isAddingNewCustomer) {
        const newCust = await createCustomer({ name: customerName, phone: customerPhone });
        finalCustomerId = newCust.id;
      }

      const sale = await createSale.mutateAsync({
        paymentMethod,
        amountReceived: paymentMethod === 'CASH' ? parseFloat(amountReceived) : undefined,
        changeAmount: paymentMethod === 'CASH' ? change : undefined,
        customerId: finalCustomerId,
        customerName: finalCustomerName || undefined,
        customerPhone: finalCustomerPhone || undefined,
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: Number(item.product.price),
          cost: Number(item.product.cost)
        }))
      });
      
      setCompletedSale(sale);
      clearCart();
      resetCheckoutState();
    } catch (error) {
      alert('Failed to process sale. Please check stock levels or database connection.');
    }
  };

  const resetCheckoutState = () => {
    setAmountReceived('');
    setCustomerName('');
    setCustomerPhone('');
    setSelectedCustomer(null);
    setIsAddingNewCustomer(false);
  };

  if (productsLoading) return <FullPageLoader message="Initializing Point of Sale..." />;


  const steps = [
    { id: 1, title: 'Customer Identification', icon: User },
    { id: 2, title: 'Product Catalog', icon: ShoppingCart },
    { id: 3, title: 'Payment & Execution', icon: Banknote },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white font-sans overflow-hidden">
      {createSale.isPending && <LoadingOverlay message="Processing Payment..." />}
      
      {completedSale && (
        <ReceiptModal 
          sale={completedSale} 
          onClose={() => {
            setCompletedSale(null);
            setCurrentStep(1); // Reset to step 1 after sale
          }} 
        />
      )}

      {/* Fixed Header with Step Indicator */}
      <div className="flex-shrink-0 border-b border-black p-6 lg:p-8 bg-white z-30">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-2xl font-serif font-bold tracking-tighter uppercase leading-none italic">Checkout</h1>
            <p className="text-[10px] text-muted mt-2 uppercase tracking-[0.3em] font-bold italic">Process: Step {currentStep} of 3</p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-4 lg:gap-8">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isCompleted = currentStep > s.id;
              const isActive = currentStep === s.id;
              
              return (
                <div key={s.id} className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 flex items-center justify-center border transition-all ${
                      isActive ? 'bg-primary border-primary text-white' : 
                      isCompleted ? 'bg-accent border-accent text-white' : 
                      'border-border text-muted'
                    }`}>
                      {isCompleted ? <Check size={14} /> : <Icon size={14} />}
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-widest hidden lg:block ${
                      isActive ? 'text-primary' : 'text-muted'
                    }`}>
                      {s.title}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="w-8 lg:w-16 h-px bg-border" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar relative bg-surface/10">
        <div className="max-w-[1400px] mx-auto h-full flex flex-col">
          
          {currentStep === 1 && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-20 animate-in fade-in slide-in-from-bottom-8 duration-500">
              <div className="w-full max-w-2xl space-y-12">
                <div className="text-center space-y-4">
                   <User className="mx-auto text-accent mb-8" size={48} strokeWidth={1} />
                   <h2 className="text-3xl font-serif font-bold italic uppercase tracking-tighter">Who are we serving?</h2>
                   <p className="text-[10px] text-muted uppercase tracking-[0.3em]">Select an existing account or register a new one</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <button 
                    onClick={() => {
                      setIsAddingNewCustomer(false);
                      setIsCustomerDropdownOpen(true);
                    }}
                    className={`craft-card p-10 flex flex-col items-center gap-6 group transition-all ${
                      selectedCustomer && !isAddingNewCustomer ? 'border-primary bg-primary/5' : 'hover:border-black'
                    }`}
                  >
                    <Search size={32} className="text-muted group-hover:text-primary transition-colors" />
                    <div className="text-center">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] block mb-2">Search Database</span>
                      <span className="text-xs text-muted">Use existing customer info</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => {
                      setIsAddingNewCustomer(true);
                      setIsCustomerDropdownOpen(false);
                      setSelectedCustomer(null);
                    }}
                    className={`craft-card p-10 flex flex-col items-center gap-6 group transition-all ${
                      isAddingNewCustomer ? 'border-primary bg-primary/5' : 'hover:border-black'
                    }`}
                  >
                    <UserPlus size={32} className="text-muted group-hover:text-primary transition-colors" />
                    <div className="text-center">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] block mb-2">Register New</span>
                      <span className="text-xs text-muted">Create a new customer profile</span>
                    </div>
                  </button>
                </div>

                <div className="pt-8">
                  {isAddingNewCustomer ? (
                    <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-muted uppercase tracking-widest">Full Name</label>
                          <input
                            type="text"
                            placeholder="e.g. John Doe"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full h-12 px-6 bg-white border border-border text-[11px] uppercase tracking-widest focus:border-accent focus:outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-muted uppercase tracking-widest">Phone Number</label>
                          <input
                            type="text"
                            placeholder="+234..."
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            className="w-full h-12 px-6 bg-white border border-border text-[11px] uppercase tracking-widest focus:border-accent focus:outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  ) : selectedCustomer ? (
                    <div className="p-6 border border-primary bg-primary/5 flex items-center justify-between animate-in zoom-in-95 duration-300">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-primary text-white flex items-center justify-center font-bold text-xs">
                          {selectedCustomer.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-primary uppercase tracking-tight">{selectedCustomer.name}</p>
                          <p className="text-[9px] text-muted font-bold uppercase tracking-widest mt-1">{selectedCustomer.phone || 'NO PHONE'}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedCustomer(null)}
                        className="text-[9px] text-muted hover:text-accent font-bold uppercase tracking-widest underline"
                      >
                        Deselect
                      </button>
                    </div>
                  ) : isCustomerDropdownOpen ? (
                    <div className="space-y-4 animate-in slide-in-from-top-4 duration-300 relative">
                      <input 
                        autoFocus
                        type="text"
                        placeholder="TYPE NAME OR PHONE TO SEARCH..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="w-full h-14 px-8 bg-white border border-black text-[11px] uppercase tracking-widest focus:border-accent focus:outline-none"
                      />
                      {customerSearch && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,0.1)] z-50 max-h-[300px] overflow-y-auto no-scrollbar">
                          {filteredCustomers?.length === 0 ? (
                            <div className="p-10 text-center text-[10px] uppercase tracking-widest text-muted italic">No matching records</div>
                          ) : (
                            filteredCustomers?.map(c => (
                              <button
                                key={c.id}
                                onClick={() => {
                                  setSelectedCustomer(c);
                                  setIsCustomerDropdownOpen(false);
                                  setCustomerSearch('');
                                }}
                                className="w-full px-8 py-5 text-left hover:bg-surface flex items-center justify-between transition-colors border-b border-border last:border-0"
                              >
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-primary uppercase tracking-tight">{c.name}</p>
                                  <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1">{c.phone || 'NO CHANNEL'}</p>
                                </div>
                                <Check size={16} className="text-accent opacity-0 group-hover:opacity-100" />
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                       <button 
                        onClick={() => setCurrentStep(2)}
                        className="text-[10px] text-muted hover:text-accent font-bold uppercase tracking-[0.4em] transition-colors"
                       >
                         Continue as Walk-in Customer
                       </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden animate-in fade-in duration-500">
              {/* Product Grid Container */}
              <div className="flex-1 flex flex-col min-w-0 border-r border-black/5">
                <div className="p-8 bg-white/50 border-b border-black/5 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative group flex-1 max-w-xl">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors" size={18} />
                      <input
                        type="text"
                        placeholder="SEARCH PRODUCTS..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-12 pl-16 pr-6 bg-white border border-border text-[11px] uppercase tracking-widest focus:border-accent focus:outline-none transition-all placeholder:text-muted/30"
                      />
                    </div>
                    <div className="flex gap-3 overflow-x-auto no-scrollbar">
                      <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-6 py-2 border text-[9px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                          selectedCategory === 'all' ? 'bg-primary border-primary text-white' : 'bg-white border-border text-muted hover:border-primary'
                        }`}
                      >
                        All
                      </button>
                      {categories?.map((cat: Category) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`px-6 py-2 border text-[9px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                            selectedCategory === cat.id ? 'bg-primary border-primary text-white' : 'bg-white border-border text-muted hover:border-primary'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 no-scrollbar">
                  {filteredProducts?.map((product: Product) => {
                    const inCart = items.find(i => i.product.id === product.id);
                    const isOutOfStock = product.stockLevel <= 0;
                    
                    return (
                      <button
                        key={product.id}
                        disabled={isOutOfStock}
                        onClick={() => addItem(product)}
                        className={`flex flex-col text-left bg-white border craft-card p-4 group relative transition-all active:scale-95 ${
                          isOutOfStock ? 'opacity-30 grayscale cursor-not-allowed border-border' : 'border-border hover:border-accent cursor-pointer'
                        }`}
                      >
                        {inCart && (
                          <div className="absolute top-2 right-2 w-8 h-8 bg-accent text-white flex items-center justify-center text-[10px] font-bold z-10 border-2 border-white">
                            {inCart.quantity}
                          </div>
                        )}
                        <div className="aspect-square border border-surface bg-surface/30 flex items-center justify-center text-muted group-hover:text-accent transition-colors mb-4">
                           <ShoppingCart size={32} strokeWidth={0.5} />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-[10px] font-bold uppercase tracking-tight text-primary leading-tight h-8 overflow-hidden line-clamp-2">{product.name}</h3>
                          <div className="pt-2 border-t border-border flex items-center justify-between">
                            <span className="text-xs font-serif font-bold italic text-primary">₦{Number(product.price).toLocaleString()}</span>
                            <span className="text-[8px] font-bold text-muted">{product.stockLevel}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cart Summary (Step 2 Specific) */}
              <div className="w-full lg:w-[350px] bg-white border-l border-black flex flex-col">
                <div className="p-6 border-b border-black flex items-center justify-between bg-surface/30">
                  <h3 className="text-xs font-serif font-bold italic uppercase tracking-tighter">Current Order</h3>
                  <button onClick={clearCart} className="text-[9px] font-bold uppercase text-muted hover:text-accent tracking-widest">Purge</button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                  {items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted/20 space-y-4">
                      <ShoppingCart size={48} strokeWidth={0.5} />
                      <p className="text-[9px] uppercase font-bold tracking-[0.4em]">Empty Cart</p>
                    </div>
                  ) : (
                    items.map((item) => (
                      <div key={item.product.id} className="p-3 border border-border bg-white space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="text-[10px] font-bold uppercase tracking-tight text-primary truncate flex-1">{item.product.name}</h4>
                          <button onClick={() => removeItem(item.product.id)} className="text-muted hover:text-accent ml-2"><Trash2 size={12} /></button>
                        </div>
                        <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest">
                           <div className="flex items-center gap-3">
                              <button onClick={() => updateQuantity(item.product.id, Math.max(0, item.quantity - 1))} className="hover:text-accent"><Minus size={10} /></button>
                              <span>{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="hover:text-accent"><Plus size={10} /></button>
                           </div>
                           <span className="text-primary">₦{(item.quantity * Number(item.product.price)).toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-6 border-t border-black bg-surface/30">
                   <div className="flex justify-between items-end">
                      <span className="text-[9px] font-bold text-muted uppercase tracking-[0.3em]">Total</span>
                      <span className="text-2xl font-serif font-bold italic text-primary">₦{cartTotal.toLocaleString()}</span>
                   </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-20 animate-in fade-in slide-in-from-top-8 duration-500">
               <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-16">
                  {/* Order Review */}
                  <div className="space-y-8">
                    <h3 className="text-2xl font-serif font-bold italic uppercase tracking-tighter border-b border-black pb-4">Order Review</h3>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar pr-4">
                      {items.map(item => (
                        <div key={item.product.id} className="flex justify-between items-center py-3 border-b border-border border-dashed">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-tight">{item.product.name}</p>
                            <p className="text-[9px] text-muted font-bold uppercase mt-1">{item.quantity} × ₦{Number(item.product.price).toLocaleString()}</p>
                          </div>
                          <span className="text-xs font-serif font-bold italic">₦{(item.quantity * Number(item.product.price)).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-6 space-y-2">
                       <div className="flex justify-between text-muted text-[10px] uppercase font-bold tracking-widest">
                          <span>Items Count</span>
                          <span>{items.reduce((acc, i) => acc + i.quantity, 0)} Units</span>
                       </div>
                       <div className="flex justify-between text-primary text-xl font-serif font-bold italic pt-4 border-t border-black">
                          <span>Grand Total</span>
                          <span>₦{cartTotal.toLocaleString()}</span>
                       </div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="space-y-8">
                    <h3 className="text-2xl font-serif font-bold italic uppercase tracking-tighter border-b border-black pb-4">Payment Method</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: 'CASH', label: 'Cash', icon: Banknote },
                        { id: 'CARD', label: 'Card', icon: CreditCard },
                        { id: 'TRANSFER', label: 'Trans', icon: RefreshCcw },
                        { id: 'CREDIT', label: 'Credit', icon: User },
                      ].map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id as any)}
                          className={`h-20 flex flex-col items-center justify-center gap-3 border transition-all ${
                            paymentMethod === method.id 
                              ? 'bg-primary border-primary text-white shadow-2xl' 
                              : 'bg-white border-border text-muted hover:border-black hover:text-primary'
                          }`}
                        >
                          <method.icon size={20} strokeWidth={1} />
                          <span className="text-[9px] uppercase font-bold tracking-[0.2em]">{method.label}</span>
                        </button>
                      ))}
                    </div>

                    {paymentMethod === 'CASH' && (
                      <div className="p-8 border border-accent bg-accent/5 space-y-6 animate-in zoom-in-95 duration-300">
                         <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-accent/60 uppercase tracking-[0.2em]">Amount Received</label>
                            <input
                              type="number"
                              placeholder="0.00"
                              value={amountReceived}
                              onChange={(e) => setAmountReceived(e.target.value)}
                              className="w-40 h-14 bg-white border border-accent px-6 text-xl font-serif font-bold italic text-accent focus:outline-none"
                            />
                         </div>
                         <div className="flex items-center justify-between pt-6 border-t border-accent/20">
                            <label className="text-[10px] font-bold text-accent/60 uppercase tracking-[0.2em]">Balance to Return</label>
                            <span className="text-2xl font-serif font-bold italic text-accent">₦{change.toLocaleString()}</span>
                         </div>
                      </div>
                    )}

                    <div className="p-6 border border-black bg-surface/30">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 border border-black flex items-center justify-center bg-white">
                             <User size={16} className="text-primary" />
                          </div>
                          <div>
                             <p className="text-[9px] font-bold text-muted uppercase tracking-widest">Customer Context</p>
                             <p className="text-[11px] font-bold text-primary uppercase">
                                {selectedCustomer?.name || (customerName.trim() ? customerName : 'Walk-in Customer')}
                             </p>
                          </div>
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Footer Navigation */}
      <div className="flex-shrink-0 border-t border-black p-6 bg-white z-30 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className={`flex items-center gap-3 px-8 h-12 text-xs font-bold uppercase tracking-[0.3em] border border-black transition-all ${
              currentStep === 1 ? 'opacity-0 pointer-events-none' : 'hover:bg-black hover:text-white'
            }`}
          >
            <ChevronDown className="rotate-90" size={16} />
            Back
          </button>

          <div className="flex items-center gap-8">
            <div className="hidden lg:flex flex-col items-end">
               <span className="text-[9px] text-muted font-bold uppercase tracking-[0.4em]">Subtotal</span>
               <span className="text-2xl font-serif font-bold italic tracking-tighter">₦{cartTotal.toLocaleString()}</span>
            </div>
            
            {currentStep < 3 ? (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={currentStep === 1 ? !canGoToStep2 : !canGoToStep3}
                className="flex items-center gap-6 px-12 h-12 bg-black text-white text-xs font-bold uppercase tracking-[0.4em] hover:bg-accent transition-all disabled:opacity-20"
              >
                Proceed to {steps.find(s => s.id === currentStep + 1)?.title}
                <ChevronDown className="-rotate-90" size={16} />
              </button>
            ) : (
              <button
                disabled={!canExecute || createSale.isPending}
                onClick={handleCheckout}
                className="flex items-center gap-6 px-12 h-12 bg-primary text-white text-xs font-bold uppercase tracking-[0.4em] hover:bg-black transition-all disabled:opacity-20"
              >
                {createSale.isPending ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                EXECUTE TRANSACTION
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
