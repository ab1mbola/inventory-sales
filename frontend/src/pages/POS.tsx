import { useState, useMemo } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useCustomers } from '../hooks/useCustomers';
import { useCreateSale } from '../hooks/useSales';
import { useCartStore } from '../store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';
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
import AnimatedPage from '../components/AnimatedPage';
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

  if (productsLoading) return <FullPageLoader message="Loading POS..." />;


  const steps = [
    { id: 1, title: 'Customer', icon: User },
    { id: 2, title: 'Cart', icon: ShoppingCart },
    { id: 3, title: 'Checkout', icon: Banknote },
  ];

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <AnimatedPage className="flex flex-col h-[calc(100vh-10px)] bg-white font-sans overflow-hidden">
      {createSale.isPending && <LoadingOverlay message="Processing Payment..." />}
      
      <AnimatePresence>
        {completedSale && (
          <ReceiptModal 
            sale={completedSale} 
            onClose={() => {
              setCompletedSale(null);
              setCurrentStep(1); // Reset to step 1 after sale
            }} 
          />
        )}
      </AnimatePresence>

      {/* Fixed Header with Step Indicator */}
      <div className="flex-shrink-0 border-b border-black p-6 lg:p-10 bg-white z-30">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tighter uppercase leading-none italic">Point of Sale</h1>
            <p className="text-[9px] text-muted mt-3 uppercase tracking-[0.5em] font-bold opacity-60 italic">Step {currentStep}</p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-6 lg:gap-12">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isCompleted = currentStep > s.id;
              const isActive = currentStep === s.id;
              
              return (
                <div key={s.id} className="flex items-center gap-6">
                  <div className="flex items-center gap-4">
                    <motion.div 
                      animate={{ 
                        scale: isActive ? 1.1 : 1,
                        backgroundColor: isActive ? 'var(--color-primary)' : isCompleted ? 'var(--color-accent)' : 'transparent',
                        borderColor: isActive ? 'var(--color-primary)' : isCompleted ? 'var(--color-accent)' : 'var(--color-border)'
                      }}
                      className={`w-10 h-10 flex items-center justify-center border transition-all ${
                        isActive || isCompleted ? 'text-white shadow-lg' : 'text-muted'
                      }`}
                    >
                      {isCompleted ? <Check size={16} /> : <Icon size={16} />}
                    </motion.div>
                    <span className={`text-[10px] font-bold uppercase tracking-[0.2em] hidden lg:block ${
                      isActive ? 'text-primary' : 'text-muted opacity-40'
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
      <div className="flex-1 overflow-y-auto no-scrollbar relative bg-surface/20">
        <div className="max-w-[1400px] mx-auto h-full flex flex-col">
          
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div 
                key="step1"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] as const }}
                className="flex-1 flex flex-col items-center justify-center p-8 lg:p-10"
              >
                <div className="w-full max-w-2xl space-y-16">
                  <div className="text-center space-y-6">
                     <User className="mx-auto text-accent mb-8" size={56} strokeWidth={0.5} />
                     <h2 className="text-4xl font-serif font-bold italic uppercase tracking-tighter">Select Customer</h2>
                     <p className="text-[10px] text-muted uppercase tracking-[0.4em] font-bold opacity-60">Choose or create a customer for this sale</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <motion.button 
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setIsAddingNewCustomer(false);
                        setIsCustomerDropdownOpen(true);
                      }}
                      className={`craft-card p-12 flex flex-col items-center gap-8 group transition-all ${
                        selectedCustomer && !isAddingNewCustomer ? 'border-primary bg-primary/5' : 'hover:border-black'
                      }`}
                    >
                      <Search size={40} strokeWidth={1} className="text-muted group-hover:text-primary transition-colors" />
                      <div className="text-center">
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] block mb-3">Search Customer</span>
                        <span className="text-[9px] text-muted uppercase font-bold opacity-40">Select Existing</span>
                      </div>
                    </motion.button>

                    <motion.button 
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setIsAddingNewCustomer(true);
                        setIsCustomerDropdownOpen(false);
                        setSelectedCustomer(null);
                      }}
                      className={`craft-card p-12 flex flex-col items-center gap-8 group transition-all ${
                        isAddingNewCustomer ? 'border-primary bg-primary/5' : 'hover:border-black'
                      }`}
                    >
                      <UserPlus size={40} strokeWidth={1} className="text-muted group-hover:text-primary transition-colors" />
                      <div className="text-center">
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] block mb-3">New Customer</span>
                        <span className="text-[9px] text-muted uppercase font-bold opacity-40">Add New</span>
                      </div>
                    </motion.button>
                  </div>

                  <div className="pt-10">
                    {isAddingNewCustomer ? (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <label className="text-[9px] font-bold text-muted uppercase tracking-[0.3em]">Customer Name</label>
                            <input
                              type="text"
                              placeholder="e.g. MARCUS AURELIUS"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              className="input-premium"
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="text-[9px] font-bold text-muted uppercase tracking-[0.3em]">Phone Number</label>
                            <input
                              type="text"
                              placeholder="+234 ..."
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              className="input-premium"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ) : selectedCustomer ? (
                      <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-8 border border-primary bg-primary/5 flex items-center justify-between">
                        <div className="flex items-center gap-8">
                          <div className="w-14 h-14 bg-primary text-white flex items-center justify-center font-bold text-sm">
                            {selectedCustomer.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-[12px] font-bold text-primary uppercase tracking-widest">{selectedCustomer.name}</p>
                            <p className="text-[9px] text-muted font-bold uppercase tracking-[0.3em] mt-2 opacity-60">{selectedCustomer.phone || 'No Phone'}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setSelectedCustomer(null)}
                          className="text-[9px] text-muted hover:text-accent font-bold uppercase tracking-[0.3em] underline decoration-1 underline-offset-4"
                        >
                          Deselect
                        </button>
                      </motion.div>
                    ) : isCustomerDropdownOpen ? (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 relative">
                        <input 
                          autoFocus
                          type="text"
                          placeholder="Search by name or phone..."
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                          className="w-full h-16 px-10 bg-white border border-black text-[11px] uppercase tracking-[0.3em] focus:border-accent focus:outline-none placeholder:opacity-20"
                        />
                        {customerSearch && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-black shadow-[30px_30px_0px_0px_rgba(0,0,0,0.05)] z-50 max-h-[400px] overflow-y-auto no-scrollbar">
                            {filteredCustomers?.length === 0 ? (
                              <div className="p-16 text-center text-[10px] uppercase tracking-[0.5em] text-muted italic opacity-40">No customers found</div>
                            ) : (
                              filteredCustomers?.map(c => (
                                <button
                                  key={c.id}
                                  onClick={() => {
                                    setSelectedCustomer(c);
                                    setIsCustomerDropdownOpen(false);
                                    setCustomerSearch('');
                                  }}
                                  className="w-full px-10 py-6 text-left hover:bg-surface flex items-center justify-between transition-colors border-b border-border last:border-0"
                                >
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-primary uppercase tracking-widest">{c.name}</p>
                                    <p className="text-[10px] text-muted font-bold uppercase tracking-[0.3em] mt-2 opacity-60">{c.phone || 'No Phone'}</p>
                                  </div>
                                  <Check size={16} className="text-accent" />
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <div className="text-center py-10">
                         <button 
                          onClick={() => setCurrentStep(2)}
                          className="text-[10px] text-muted hover:text-accent font-bold uppercase tracking-[0.6em] transition-all hover:tracking-[0.8em]"
                         >
                           Continue as Guest
                         </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div 
                key="step2"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] as const }}
                className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden"
              >
                {/* Product Grid Container */}
                <div className="flex-1 flex flex-col min-w-0 border-r border-black/5">
                  <div className="p-10 bg-white/50 border-b border-black/5 space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="relative group flex-1 max-w-2xl">
                        <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors" size={20} strokeWidth={1} />
                        <input
                          type="text"
                          placeholder="Search products..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full h-14 pl-20 pr-8 bg-white border border-border text-[11px] uppercase tracking-[0.2em] focus:border-accent focus:outline-none transition-all placeholder:text-muted/20"
                        />
                      </div>
                      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                        <button
                          onClick={() => setSelectedCategory('all')}
                          className={`px-8 h-14 border text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-all ${
                            selectedCategory === 'all' ? 'bg-primary border-primary text-white shadow-lg' : 'bg-white border-border text-muted hover:border-primary'
                          }`}
                        >
                          All Categories
                        </button>
                        {categories?.map((cat: Category) => (
                          <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-8 h-14 border text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-all ${
                              selectedCategory === cat.id ? 'bg-primary border-primary text-white shadow-lg' : 'bg-white border-border text-muted hover:border-primary'
                            }`}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <motion.div 
                    layout
                    className="flex-1 overflow-y-auto p-10 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 no-scrollbar"
                  >
                    {filteredProducts?.map((product: Product) => {
                      const inCart = items.find(i => i.product.id === product.id);
                      const isOutOfStock = product.stockLevel <= 0;
                      
                      return (
                        <motion.button
                          layout
                          key={product.id}
                          disabled={isOutOfStock}
                          onClick={() => addItem(product)}
                          whileHover={isOutOfStock ? {} : { y: -5, borderColor: 'var(--color-accent)' }}
                          whileTap={isOutOfStock ? {} : { scale: 0.95 }}
                          className={`flex flex-col text-left bg-white border craft-card p-6 group relative transition-all ${
                            isOutOfStock ? 'opacity-30 grayscale cursor-not-allowed border-border' : 'border-border cursor-pointer shadow-sm'
                          }`}
                        >
                          {inCart && (
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-4 right-4 w-10 h-10 bg-accent text-white flex items-center justify-center text-[11px] font-bold z-10 border-4 border-white shadow-lg"
                            >
                              {inCart.quantity}
                            </motion.div>
                          )}
                          <div className="aspect-square border border-surface bg-surface/50 flex items-center justify-center text-muted group-hover:text-accent transition-colors mb-6 overflow-hidden">
                             <ShoppingCart size={48} strokeWidth={0.5} className="group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <div className="space-y-4">
                            <h3 className="text-[11px] font-bold uppercase tracking-widest text-primary leading-snug h-10 overflow-hidden line-clamp-2">{product.name}</h3>
                            <div className="pt-4 border-t border-border flex items-center justify-between">
                              <span className="text-sm font-serif font-bold italic text-primary">₦{Number(product.price).toLocaleString()}</span>
                              <span className="text-[9px] font-bold text-muted opacity-40">{product.stockLevel} ITEMS</span>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                </div>

                {/* Cart Summary */}
                <div className="w-full lg:w-[400px] bg-white border-l border-black flex flex-col shadow-2xl">
                  <div className="p-8 border-b border-black flex items-center justify-between bg-surface/50">
                    <h3 className="text-sm font-serif font-bold italic uppercase tracking-tighter">Shopping Cart</h3>
                    <button onClick={clearCart} className="text-[9px] font-bold uppercase text-muted hover:text-accent tracking-[0.3em] transition-colors">Clear All</button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
                    {items.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-muted/10 space-y-8">
                        <ShoppingCart size={64} strokeWidth={0.5} />
                        <p className="text-[10px] uppercase font-bold tracking-[0.5em] opacity-40">Cart is empty</p>
                      </div>
                    ) : (
                      <AnimatePresence>
                        {items.map((item) => (
                          <motion.div 
                            key={item.product.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="p-5 border border-border bg-white space-y-4 group hover:border-primary transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary truncate flex-1">{item.product.name}</h4>
                              <button onClick={() => removeItem(item.product.id)} className="text-muted hover:text-accent ml-4 transition-colors"><Trash2 size={14} strokeWidth={1} /></button>
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em]">
                               <div className="flex items-center gap-5">
                                  <button onClick={() => updateQuantity(item.product.id, Math.max(0, item.quantity - 1))} className="w-6 h-6 flex items-center justify-center hover:bg-surface transition-colors border border-transparent hover:border-border"><Minus size={12} /></button>
                                  <span className="min-w-[20px] text-center">{item.quantity}</span>
                                  <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center hover:bg-surface transition-colors border border-transparent hover:border-border"><Plus size={12} /></button>
                               </div>
                               <span className="text-primary font-serif italic text-sm">₦{(item.quantity * Number(item.product.price)).toLocaleString()}</span>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </div>
                  <div className="p-10 border-t border-black bg-surface">
                     <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold text-muted uppercase tracking-[0.4em] opacity-60">Grand Total</span>
                        <span className="text-3xl font-serif font-bold italic text-primary tracking-tighter">₦{cartTotal.toLocaleString()}</span>
                     </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div 
                key="step3"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] as const }}
                className="flex-1 flex flex-col items-center justify-center p-8 lg:p-20"
              >
                 <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-24">
                    {/* Order Review */}
                    <div className="space-y-12">
                      <h3 className="text-3xl font-serif font-bold italic uppercase tracking-tighter border-b border-black pb-8">Order Summary</h3>
                      <div className="space-y-6 max-h-[450px] overflow-y-auto no-scrollbar pr-6">
                        {items.map(item => (
                          <div key={item.product.id} className="flex justify-between items-center py-5 border-b border-border border-dashed">
                            <div>
                              <p className="text-[12px] font-bold uppercase tracking-widest">{item.product.name}</p>
                              <p className="text-[10px] text-muted font-bold uppercase mt-2 opacity-60">{item.quantity} QTY @ ₦{Number(item.product.price).toLocaleString()}</p>
                            </div>
                            <span className="text-sm font-serif font-bold italic">₦{(item.quantity * Number(item.product.price)).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-8 space-y-3">
                         <div className="flex justify-between text-muted text-[10px] uppercase font-bold tracking-[0.4em] opacity-60">
                            <span>Total Items</span>
                            <span>{items.reduce((acc, i) => acc + i.quantity, 0)} Units</span>
                         </div>
                         <div className="flex justify-between text-primary text-3xl font-serif font-bold italic pt-8 border-t border-black tracking-tighter">
                            <span>Grand Total</span>
                            <span>₦{cartTotal.toLocaleString()}</span>
                         </div>
                      </div>
                    </div>

                    {/* Payment Details */}
                    <div className="space-y-12">
                      <h3 className="text-3xl font-serif font-bold italic uppercase tracking-tighter border-b border-black pb-8">Payment Method</h3>
                      <div className="grid grid-cols-2 gap-6">
                        {[
                          { id: 'CASH', label: 'Cash', icon: Banknote },
                          { id: 'CARD', label: 'Card', icon: CreditCard },
                          { id: 'TRANSFER', label: 'Transfer', icon: RefreshCcw },
                          { id: 'CREDIT', label: 'Credit', icon: User },
                        ].map((method) => (
                          <motion.button
                            key={method.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setPaymentMethod(method.id as any)}
                            className={`h-24 flex flex-col items-center justify-center gap-4 border transition-all ${
                              paymentMethod === method.id 
                                ? 'bg-primary border-primary text-white shadow-2xl' 
                                : 'bg-white border-border text-muted hover:border-black hover:text-primary'
                            }`}
                          >
                            <method.icon size={24} strokeWidth={1} />
                            <span className="text-[10px] uppercase font-bold tracking-[0.3em]">{method.label}</span>
                          </motion.button>
                        ))}
                      </div>

                      <AnimatePresence>
                        {paymentMethod === 'CASH' && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-10 border border-accent bg-accent-soft/30 space-y-8">
                               <div className="flex items-center justify-between">
                                  <label className="text-[10px] font-bold text-accent/60 uppercase tracking-[0.3em]">Amount Received</label>
                                  <input
                                    type="number"
                                    placeholder="0.00"
                                    value={amountReceived}
                                    onChange={(e) => setAmountReceived(e.target.value)}
                                    className="w-48 h-16 bg-white border border-accent px-8 text-2xl font-serif font-bold italic text-accent focus:outline-none placeholder:opacity-20"
                                  />
                               </div>
                               <div className="flex items-center justify-between pt-8 border-t border-accent/20">
                                  <label className="text-[10px] font-bold text-accent/60 uppercase tracking-[0.3em]">Change Amount</label>
                                  <span className="text-3xl font-serif font-bold italic text-accent tracking-tighter">₦{change.toLocaleString()}</span>
                                </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="p-8 border border-black bg-surface/50">
                         <div className="flex items-center gap-6">
                            <div className="w-12 h-12 border border-black flex items-center justify-center bg-white">
                               <User size={20} strokeWidth={1} className="text-primary" />
                            </div>
                            <div>
                               <p className="text-[9px] font-bold text-muted uppercase tracking-[0.4em] opacity-60">Customer</p>
                               <p className="text-[12px] font-bold text-primary uppercase tracking-widest mt-2">
                                  {selectedCustomer?.name || (customerName.trim() ? customerName : 'Guest')}
                               </p>
                            </div>
                         </div>
                      </div>
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Fixed Footer Navigation */}
      <div className="flex-shrink-0 border-t border-black p-8 lg:p-10 bg-white z-30 shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.1)]">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <motion.button
            whileHover={{ x: -4 }}
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className={`flex items-center gap-4 px-10 h-14 text-[10px] font-bold uppercase tracking-[0.4em] border border-black transition-all ${
              currentStep === 1 ? 'opacity-0 pointer-events-none' : 'hover:bg-black hover:text-white'
            }`}
          >
            <ChevronDown className="rotate-90" size={18} />
            Previous Step
          </motion.button>

          <div className="flex items-center gap-12">
            <div className="hidden lg:flex flex-col items-end">
               <span className="text-[10px] text-muted font-bold uppercase tracking-[0.5em] opacity-40">Total</span>
               <span className="text-3xl font-serif font-bold italic tracking-tighter">₦{cartTotal.toLocaleString()}</span>
            </div>
            
            {currentStep < 3 ? (
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: 'var(--color-accent)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={currentStep === 1 ? !canGoToStep2 : !canGoToStep3}
                className="flex items-center gap-8 px-16 h-14 bg-black text-white text-[10px] font-bold uppercase tracking-[0.5em] transition-all disabled:opacity-10 shadow-2xl"
              >
                Next: {steps.find(s => s.id === currentStep + 1)?.title}
                <ChevronDown className="-rotate-90" size={18} />
              </motion.button>
            ) : (
              <motion.button
                layout
                disabled={!canExecute || createSale.isPending}
                onClick={handleCheckout}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-8 px-16 h-14 bg-primary text-white text-[10px] font-bold uppercase tracking-[0.5em] transition-all disabled:opacity-10 shadow-2xl"
              >
                {createSale.isPending ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                Complete Sale
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}


