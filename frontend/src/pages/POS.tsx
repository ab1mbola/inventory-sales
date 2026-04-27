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
  Wallet,
  UserPlus,
  Check,
  ChevronDown
} from 'lucide-react';
import LoadingOverlay from '../components/LoadingOverlay';
import ReceiptModal from '../components/ReceiptModal';
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

  const cartTotal = total();
  
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

  if (productsLoading) return <div className="p-8 text-center text-slate-400">Loading POS...</div>;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] lg:h-screen bg-slate-50 overflow-hidden">
      {createSale.isPending && <LoadingOverlay message="Processing Transaction..." />}
      
      {completedSale && (
        <ReceiptModal 
          sale={completedSale} 
          onClose={() => setCompletedSale(null)} 
        />
      )}

      {/* Left Column: Product Selection */}
      <div className="flex-1 flex flex-col min-w-0 border-b lg:border-b-0 lg:border-r border-slate-200">
        {/* Search & Categories */}
        <div className="p-4 bg-white border-b border-slate-200 shadow-sm z-10">
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${
                selectedCategory === 'all' 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              All Items
            </button>
            {categories?.map((cat: Category) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${
                  selectedCategory === cat.id 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredProducts?.map((product: Product) => {
            const inCart = items.find(i => i.product.id === product.id);
            const isOutOfStock = product.stockLevel <= 0;
            
            return (
              <button
                key={product.id}
                disabled={isOutOfStock}
                onClick={() => addItem(product)}
                className={`flex flex-col text-left bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all active:scale-95 group relative shadow-sm ${
                  isOutOfStock ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 cursor-pointer'
                }`}
              >
                {inCart && (
                  <div className="absolute top-2 right-2 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold z-10 shadow-lg border-2 border-white animate-in zoom-in-50 duration-200">
                    {inCart.quantity}
                  </div>
                )}
                <div className="aspect-square bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-blue-500/40 transition-colors border-b border-slate-100">
                   <ShoppingCart size={44} strokeWidth={1.5} />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold text-slate-900 truncate">{product.name}</h3>
                  <p className="text-[10px] text-slate-400 font-medium mb-3 uppercase tracking-wider">{product.sku}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-blue-600 font-bold text-sm">₦{Number(product.price).toLocaleString()}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      product.stockLevel <= product.minStock ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      {product.stockLevel}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Cart & Checkout */}
      <div className="w-full lg:w-[400px] xl:w-[420px] bg-white flex flex-col shadow-2xl z-20 border-t lg:border-t-0 border-slate-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <ShoppingCart size={18} />
            </div>
            <h2 className="font-bold text-slate-900">Current Order</h2>
          </div>
          <button 
            onClick={clearCart}
            className="text-[10px] font-bold uppercase text-slate-400 hover:text-red-500 transition-colors cursor-pointer tracking-widest"
          >
            Clear All
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-3 opacity-60">
              <div className="p-6 bg-slate-50 rounded-full">
                <ShoppingCart size={48} strokeWidth={1} />
              </div>
              <p className="text-sm font-medium">Your cart is empty</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="flex gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 animate-in slide-in-from-right-4 duration-200">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{item.product.name}</h4>
                  <p className="text-xs text-blue-600 font-bold mt-1">
                    ₦{Number(item.product.price).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
                  <button 
                    onClick={() => updateQuantity(item.product.id, Math.max(0, item.quantity - 1))}
                    className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-bold text-slate-900 min-w-[24px] text-center">
                    {item.quantity}
                  </span>
                  <button 
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button 
                  onClick={() => removeItem(item.product.id)}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Checkout Details */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-5">
          {/* Customer Selection Logic */}
          <div className="space-y-4 p-4 bg-white rounded-2xl border border-slate-200 relative shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <User size={14} />
                <span>Customer Details</span>
              </div>
              <button 
                onClick={() => {
                  setIsAddingNewCustomer(!isAddingNewCustomer);
                  setSelectedCustomer(null);
                }}
                className="text-[10px] text-blue-600 hover:text-blue-700 font-bold uppercase flex items-center gap-1 tracking-wider"
              >
                {isAddingNewCustomer ? 'Select Existing' : 'Add New'}
                <UserPlus size={12} />
              </button>
            </div>

            {isAddingNewCustomer ? (
              <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            ) : (
              <div className="relative">
                <button 
                  onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-left text-slate-900 flex items-center justify-between group hover:bg-slate-100 transition-colors"
                >
                  <span className={selectedCustomer ? 'text-blue-600 font-bold' : 'text-slate-400 font-medium'}>
                    {selectedCustomer ? selectedCustomer.name : 'Select or search customer...'}
                  </span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${isCustomerDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isCustomerDropdownOpen && (
                  <div className="absolute bottom-full left-0 right-0 mb-3 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
                    <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                      <input 
                        autoFocus
                        type="text"
                        placeholder="Search by name or phone..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div className="max-h-[200px] overflow-y-auto no-scrollbar">
                      {filteredCustomers?.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-xs italic">No results found</div>
                      ) : (
                        filteredCustomers?.map(c => (
                          <button
                            key={c.id}
                            onClick={() => {
                              setSelectedCustomer(c);
                              setIsCustomerDropdownOpen(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center justify-between group transition-colors border-b border-slate-50 last:border-0"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-700 group-hover:text-blue-700 transition-colors">{c.name}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{c.phone || 'No phone'}</p>
                            </div>
                            {selectedCustomer?.id === c.id && <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center"><Check size={12} /></div>}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cash Details */}
          {paymentMethod === 'CASH' && (
            <div className="space-y-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 shadow-sm animate-in zoom-in-95 duration-200">
               <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">
                <Wallet size={14} />
                <span>Cash Payment</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount Received</label>
                   <input
                    type="number"
                    placeholder="0.00"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    className="w-32 px-4 py-2 bg-white border border-blue-200 rounded-xl text-sm text-right text-blue-600 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-inner"
                  />
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-blue-100">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Change Due</label>
                   <span className="text-lg font-bold text-emerald-600">₦{change.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary & Checkout */}
        <div className="p-6 bg-white border-t border-slate-100 space-y-6 shadow-[0_-8px_20px_rgba(0,0,0,0.02)]">
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
              <span>Subtotal</span>
              <span className="text-slate-600 font-black">₦{cartTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-2xl font-black text-slate-900 pt-3 border-t border-slate-100">
              <span>Total Amount</span>
              <span className="text-blue-600">₦{cartTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { id: 'CASH', label: 'Cash', icon: Banknote },
              { id: 'CARD', label: 'Card', icon: CreditCard },
              { id: 'TRANSFER', label: 'Trans', icon: RefreshCcw },
              { id: 'CREDIT', label: 'Credit', icon: User },
            ].map((method) => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id as any)}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all cursor-pointer ${
                  paymentMethod === method.id 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' 
                    : 'bg-white border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-600'
                }`}
              >
                <method.icon size={18} />
                <span className="text-[8px] uppercase font-black tracking-widest leading-none">{method.label}</span>
              </button>
            ))}
          </div>

          <button
            disabled={items.length === 0 || createSale.isPending}
            onClick={handleCheckout}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-300 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-3 cursor-pointer mt-2"
          >
            <ShoppingCart size={24} />
            PAY NOW
          </button>
        </div>
      </div>
    </div>
  );
}
