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

  if (productsLoading) return <div className="p-8 text-center text-gray-400">Loading POS...</div>;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] lg:h-screen bg-gray-950 overflow-hidden">
      {createSale.isPending && <LoadingOverlay message="Processing Transaction..." />}
      
      {completedSale && (
        <ReceiptModal 
          sale={completedSale} 
          onClose={() => setCompletedSale(null)} 
        />
      )}

      {/* Left Column: Product Selection */}
      <div className="flex-1 flex flex-col min-w-0 border-b lg:border-b-0 lg:border-r border-gray-800">
        {/* Search & Categories */}
        <div className="p-4 bg-gray-900/50 border-b border-gray-800">
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedCategory === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              All Items
            </button>
            {categories?.map((cat: Category) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredProducts?.map((product: Product) => {
            const inCart = items.find(i => i.product.id === product.id);
            const isOutOfStock = product.stockLevel <= 0;
            
            return (
              <button
                key={product.id}
                disabled={isOutOfStock}
                onClick={() => addItem(product)}
                className={`flex flex-col text-left bg-gray-900 border border-gray-800 rounded-xl overflow-hidden transition-all active:scale-95 group relative ${
                  isOutOfStock ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer'
                }`}
              >
                {inCart && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold z-10">
                    {inCart.quantity}
                  </div>
                )}
                <div className="aspect-square bg-gray-800 flex items-center justify-center text-gray-600 group-hover:text-blue-500/50 transition-colors">
                   <ShoppingCart size={40} />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-gray-100 truncate">{product.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{product.sku}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-blue-400 font-bold">₦{Number(product.price).toLocaleString()}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                      product.stockLevel <= product.minStock ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                    }`}>
                      {product.stockLevel} left
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Cart & Checkout */}
      <div className="w-full lg:w-[400px] xl:w-[420px] bg-gray-900 flex flex-col shadow-2xl z-10 border-t lg:border-t-0 border-gray-800">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="text-blue-500" size={20} />
            <h2 className="font-bold text-gray-100">Current Order</h2>
          </div>
          <button 
            onClick={clearCart}
            className="text-xs text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
          >
            Clear All
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-2 opacity-50">
              <ShoppingCart size={48} strokeWidth={1} />
              <p>Your cart is empty</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="flex gap-3 bg-gray-800/50 p-3 rounded-xl border border-gray-800">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-100 truncate">{item.product.name}</h4>
                  <p className="text-xs text-blue-400 font-bold mt-1">
                    ₦{Number(item.product.price).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-gray-900 rounded-lg border border-gray-700 p-1">
                  <button 
                    onClick={() => updateQuantity(item.product.id, Math.max(0, item.quantity - 1))}
                    className="p-1 hover:bg-gray-800 rounded text-gray-400 cursor-pointer"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-xs font-bold text-gray-100 min-w-[20px] text-center">
                    {item.quantity}
                  </span>
                  <button 
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="p-1 hover:bg-gray-800 rounded text-gray-400 cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button 
                  onClick={() => removeItem(item.product.id)}
                  className="p-2 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Checkout Details */}
        <div className="p-4 bg-gray-950 border-t border-gray-800 space-y-4">
          {/* Customer Selection Logic */}
          <div className="space-y-3 p-3 bg-gray-900 rounded-xl border border-gray-800 relative">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <User size={14} />
                <span>Customer Selection</span>
              </div>
              <button 
                onClick={() => {
                  setIsAddingNewCustomer(!isAddingNewCustomer);
                  setSelectedCustomer(null);
                }}
                className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase flex items-center gap-1"
              >
                {isAddingNewCustomer ? 'Select Existing' : 'Add New'}
                <UserPlus size={10} />
              </button>
            </div>

            {isAddingNewCustomer ? (
              <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <input
                  type="text"
                  placeholder="New Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="New Phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            ) : (
              <div className="relative">
                <button 
                  onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs text-left text-gray-100 flex items-center justify-between group"
                >
                  <span className={selectedCustomer ? 'text-blue-400 font-bold' : 'text-gray-500'}>
                    {selectedCustomer ? selectedCustomer.name : 'Search existing customer...'}
                  </span>
                  <ChevronDown size={14} className={`text-gray-500 transition-transform ${isCustomerDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isCustomerDropdownOpen && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                    <div className="p-2 border-b border-gray-700 bg-gray-900/50">
                      <input 
                        autoFocus
                        type="text"
                        placeholder="Search by name or phone..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-[11px] text-gray-100 focus:outline-none"
                      />
                    </div>
                    <div className="max-h-[160px] overflow-y-auto">
                      {filteredCustomers?.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-[10px]">No customers found</div>
                      ) : (
                        filteredCustomers?.map(c => (
                          <button
                            key={c.id}
                            onClick={() => {
                              setSelectedCustomer(c);
                              setIsCustomerDropdownOpen(false);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center justify-between group"
                          >
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold text-gray-200 group-hover:text-blue-400 transition-colors">{c.name}</p>
                              <p className="text-[9px] text-gray-500">{c.phone || 'No phone'}</p>
                            </div>
                            {selectedCustomer?.id === c.id && <Check size={12} className="text-blue-500" />}
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
            <div className="space-y-3 p-3 bg-blue-600/5 rounded-xl border border-blue-600/20">
               <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
                <Wallet size={14} />
                <span>Cash Payment Details</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                   <label className="text-xs text-gray-400">Amount Received</label>
                   <input
                    type="number"
                    placeholder="0.00"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    className="w-32 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-right text-blue-400 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-gray-800">
                   <label className="text-xs text-gray-400">Change Due</label>
                   <span className="text-sm font-bold text-green-400">₦{change.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary & Checkout */}
        <div className="p-6 bg-gray-900 border-t border-gray-800 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Subtotal</span>
              <span>₦{cartTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-100 pt-2 border-t border-gray-800">
              <span>Total</span>
              <span className="text-blue-500">₦{cartTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'CASH', label: 'Cash', icon: Banknote },
              { id: 'CARD', label: 'Card', icon: CreditCard },
              { id: 'TRANSFER', label: 'Trans', icon: RefreshCcw },
              { id: 'CREDIT', label: 'Credit', icon: User },
            ].map((method) => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id as any)}
                className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border transition-all cursor-pointer ${
                  paymentMethod === method.id 
                    ? 'bg-blue-600/10 border-blue-600 text-blue-400' 
                    : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-600'
                }`}
              >
                <method.icon size={16} />
                <span className="text-[9px] uppercase font-bold tracking-wider">{method.label}</span>
              </button>
            ))}
          </div>

          <button
            disabled={items.length === 0 || createSale.isPending}
            onClick={handleCheckout}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-900/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingCart size={22} />
            Complete Order
          </button>
        </div>
      </div>
    </div>
  );
}
