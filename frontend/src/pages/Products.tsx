import { useState } from 'react';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import type { Product, CreateProductPayload, Category } from '../types';
import LoadingOverlay from '../components/LoadingOverlay';
import { Search, Plus, X, Trash2, Edit3, Package } from 'lucide-react';
import FullPageLoader from '../components/FullPageLoader';
import AnimatedPage from '../components/AnimatedPage';
import { motion, AnimatePresence } from 'framer-motion';
import { useDialogStore } from '../store/dialogStore';


const emptyForm: CreateProductPayload = {
  sku: '',
  name: '',
  description: '',
  price: 0,
  cost: 0,
  stockLevel: 0,
  minStock: 10,
  categoryId: '',
};

export default function Products() {
  const { showConfirm } = useDialogStore();
  const { data: products, isLoading, error } = useProducts();
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateProductPayload>(emptyForm);
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: ['price', 'cost', 'stockLevel', 'minStock'].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      categoryId: form.categoryId || undefined,
    };

    if (editingId) {
      await updateProduct.mutateAsync({ id: editingId, data: payload });
    } else {
      await createProduct.mutateAsync(payload);
    }
    resetForm();
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      price: Number(product.price),
      cost: Number(product.cost),
      stockLevel: product.stockLevel,
      minStock: product.minStock,
      categoryId: product.categoryId || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm('Are you sure you want to delete this product?');
    if (confirmed) {
      await deleteProduct.mutateAsync(id);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const filtered = (products as Product[])?.filter(
    (p: Product) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <FullPageLoader message="Loading Products..." />;

  
  if (error) return (
    <div className="p-20 text-center text-accent font-bold uppercase tracking-[0.5em] text-[10px] italic">
      Error: Failed to load products.
    </div>
  );

  const isMutating = createProduct.isPending || updateProduct.isPending || deleteProduct.isPending;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { ease: [0.23, 1, 0.32, 1] as const, duration: 0.5 } }
  };

  return (
    <AnimatedPage className="p-4 lg:p-12 space-y-12 max-w-[1600px] mx-auto bg-background">
      {isMutating && <LoadingOverlay message={deleteProduct.isPending ? 'Deleting...' : editingId ? 'Updating...' : 'Creating...'} />}
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 border-b border-border pb-10">
        <div>
          <h1 className="text-3xl lg:text-4xl font-sans font-black tracking-tighter uppercase leading-none">Products</h1>
          <p className="text-[10px] text-muted mt-4 uppercase tracking-[0.4em] font-bold opacity-60">Manage your inventory products</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="tag-btn flex items-center gap-3 px-8"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {/* Search & Stats */}
      <div className="w-full flex flex-col md:flex-row justify-between items-center gap-12 border border-border p-6 bg-surface/30 rounded-2xl">
        <div className="relative w-full max-w-xl group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors" size={18} strokeWidth={1} />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-white border border-border rounded-xl outline-none text-[10px] uppercase font-bold tracking-[0.2em] focus:border-accent focus:ring-4 focus:ring-accent-soft transition-all placeholder:text-muted/30"
          />
        </div>
        <div className="flex gap-16">
          <div className="text-right">
             <p className="text-[9px] text-muted uppercase tracking-[0.3em] font-bold opacity-60">Total Products</p>
             <p className="font-sans text-2xl font-black leading-none mt-2">{filtered?.length ?? 0}</p>
          </div>
          <div className="text-right">
             <p className="text-[9px] text-muted uppercase tracking-[0.3em] font-bold opacity-60">Status</p>
             <div className="flex items-center gap-3 mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span className="text-[9px] uppercase font-bold tracking-widest italic">Online</span>
             </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="tag-card overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-surface/50">
                <th className="px-8 py-5 text-[9px] font-bold text-muted uppercase tracking-[0.3em]">SKU</th>
                <th className="px-8 py-5 text-[9px] font-bold text-muted uppercase tracking-[0.3em]">Name</th>
                <th className="px-8 py-5 text-[9px] font-bold text-muted uppercase tracking-[0.3em]">Category</th>
                <th className="px-8 py-5 text-right text-[9px] font-bold text-muted uppercase tracking-[0.3em]">Price</th>
                <th className="px-8 py-5 text-right text-[9px] font-bold text-muted uppercase tracking-[0.3em]">Stock</th>
                <th className="px-8 py-5 text-center text-[9px] font-bold text-muted uppercase tracking-[0.3em]">Actions</th>
              </tr>
            </thead>
            <motion.tbody 
              variants={container}
              initial="hidden"
              animate="show"
              className="divide-y divide-border"
            >
              {filtered && filtered.length > 0 ? (
                filtered.map((product) => {
                  const isLowStock = product.stockLevel <= product.minStock;
                  return (
                    <motion.tr key={product.id} variants={item} className="hover:bg-surface/50 transition-colors group">
                      <td className="px-8 py-6 whitespace-nowrap text-[10px] font-mono text-muted/60 uppercase">{product.sku}</td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-[11px] font-bold uppercase tracking-widest group-hover:text-accent transition-colors duration-500">{product.name}</div>
                        <div className="text-[9px] text-muted mt-2 uppercase tracking-tight opacity-40 truncate max-w-xs">{product.description || 'No description'}</div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] bg-white border border-border px-4 py-1.5 rounded-full shadow-sm">{product.category?.name || 'General'}</span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-right">
                        <div className="text-sm font-sans font-black tracking-tight">₦{Number(product.price).toLocaleString()}</div>
                        <div className="text-[9px] text-muted mt-2 uppercase tracking-tighter opacity-30">C: ₦{Number(product.cost).toLocaleString()}</div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-right">
                        <div className={`text-base font-black font-sans ${isLowStock ? 'text-accent' : 'text-primary'}`}>
                          {product.stockLevel}
                        </div>
                        {isLowStock && (
                          <motion.div 
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-[8px] text-accent uppercase font-black tracking-widest mt-2"
                          >
                            Low Stock
                          </motion.div>
                        )}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-8">
                          <button onClick={() => handleEdit(product)}
                            className="text-primary hover:text-accent transition-all duration-300 transform hover:scale-110 cursor-pointer">
                            <Edit3 size={16} strokeWidth={1} />
                          </button>
                          <button onClick={() => handleDelete(product.id)}
                            className="text-primary hover:text-red-500 transition-all duration-300 transform hover:scale-110 cursor-pointer">
                            <Trash2 size={16} strokeWidth={1} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <motion.tr variants={item}>
                  <td colSpan={6} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-6 opacity-20">
                      <Package size={40} strokeWidth={0.5} />
                      <p className="text-[10px] uppercase tracking-[0.5em] font-bold italic">No products found</p>
                    </div>
                  </td>
                </motion.tr>
              )}
            </motion.tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-start justify-center z-[100] p-4 lg:p-12 overflow-y-auto no-scrollbar"
            onClick={resetForm}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white border border-border rounded-3xl w-full max-w-3xl my-auto shadow-3xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-10 border-b border-border flex justify-between items-end bg-surface/50">
                <div>
                  <h2 className="text-3xl font-sans font-black tracking-tighter uppercase">
                    {editingId ? 'Edit Product' : 'Add Product'}
                  </h2>
                  <p className="text-[10px] text-muted mt-4 uppercase tracking-[0.4em] font-bold opacity-60">Update product details</p>
                </div>
                <button onClick={resetForm} className="text-muted hover:text-accent transition-colors mb-2 cursor-pointer">
                  <X size={24} strokeWidth={1} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-10 space-y-10">
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="text-[9px] font-bold text-muted uppercase tracking-[0.3em]">SKU *</label>
                    <input name="sku" value={form.sku} onChange={handleChange} required
                      className="input-premium" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-bold text-muted uppercase tracking-[0.3em]">Product Name *</label>
                    <input name="name" value={form.name} onChange={handleChange} required
                      className="input-premium" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] font-bold text-muted uppercase tracking-[0.3em]">Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                    className="w-full px-6 py-6 bg-surface border border-border rounded-xl focus:border-accent outline-none transition-all text-xs tracking-wider" />
                </div>

                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="text-[9px] font-bold text-muted uppercase tracking-[0.3em]">Price (₦) *</label>
                    <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} required
                      className="input-premium font-sans font-bold text-base" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-bold text-muted uppercase tracking-[0.3em]">Cost (₦) *</label>
                    <input name="cost" type="number" step="0.01" value={form.cost} onChange={handleChange} required
                      className="input-premium font-sans font-bold text-base" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="text-[9px] font-bold text-muted uppercase tracking-[0.3em]">Current Stock</label>
                    <input name="stockLevel" type="number" value={form.stockLevel} onChange={handleChange}
                      className="input-premium font-sans font-bold text-base" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-bold text-muted uppercase tracking-[0.3em]">Minimum Stock</label>
                    <input name="minStock" type="number" value={form.minStock} onChange={handleChange}
                      className="input-premium font-sans font-bold text-base" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] font-bold text-muted uppercase tracking-[0.3em]">Category</label>
                  <select name="categoryId" value={form.categoryId} onChange={handleChange}
                    className="w-full h-14 px-6 bg-surface border border-border rounded-xl focus:border-accent outline-none transition-all text-[10px] uppercase font-bold tracking-[0.2em] cursor-pointer appearance-none">
                    <option value="">UNCATEGORIZED</option>
                    {categories?.map((cat: Category) => (
                      <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-10 pt-10 border-t border-border">
                  <button type="button" onClick={resetForm}
                    className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted hover:text-black transition-colors cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit"
                    disabled={createProduct.isPending || updateProduct.isPending}
                    className="tag-btn flex items-center gap-4 px-12 disabled:opacity-30 cursor-pointer"
                  >
                    {editingId ? <Edit3 size={16} /> : <Plus size={16} />}
                    Save Product
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedPage>
  );
}


