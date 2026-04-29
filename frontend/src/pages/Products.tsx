import { useState } from 'react';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import type { Product, CreateProductPayload, Category } from '../types';
import LoadingOverlay from '../components/LoadingOverlay';
import { Search, Plus, X, Trash2, Edit3 } from 'lucide-react';
import FullPageLoader from '../components/FullPageLoader';


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
    if (window.confirm('Are you sure you want to delete this product?')) {
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

  if (isLoading) return <FullPageLoader message="Indexing Inventory..." />;

  
  if (error) return (
    <div className="p-12 text-center text-red-500 font-bold uppercase tracking-widest text-xs">
      Error loading products.
    </div>
  );

  const isMutating = createProduct.isPending || updateProduct.isPending || deleteProduct.isPending;

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-[1600px] mx-auto bg-white">
      {isMutating && <LoadingOverlay message={deleteProduct.isPending ? 'Deleting...' : editingId ? 'Updating...' : 'Creating...'} />}
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-black pb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold tracking-tighter uppercase leading-none">Products</h1>
          <p className="text-[10px] text-muted mt-3 uppercase tracking-[0.3em] font-bold">Manage your inventory items</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="craft-btn flex items-center gap-2 text-[10px] h-10 px-6"
        >
          <Plus size={16} />
          Append Product
        </button>
      </div>

      {/* Search & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 border border-black p-6">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors" size={16} />
          <input
            type="text"
            placeholder="SEARCH BY NAME OR SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-4 py-2 bg-transparent outline-none text-[10px] uppercase font-bold tracking-widest placeholder:text-muted/30"
          />
        </div>
        <div className="flex gap-12">
          <div className="text-right">
             <p className="text-[8px] text-muted uppercase tracking-[0.2em] font-bold">Total Items</p>
             <p className="font-serif text-xl font-bold italic leading-none mt-1">{filtered?.length ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="craft-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black">
                <th className="px-6 py-3 text-[9px] font-bold text-muted uppercase tracking-[0.2em]">SKU</th>
                <th className="px-6 py-3 text-[9px] font-bold text-muted uppercase tracking-[0.2em]">Name</th>
                <th className="px-6 py-3 text-[9px] font-bold text-muted uppercase tracking-[0.2em]">Category</th>
                <th className="px-6 py-3 text-right text-[9px] font-bold text-muted uppercase tracking-[0.2em]">Price</th>
                <th className="px-6 py-3 text-right text-[9px] font-bold text-muted uppercase tracking-[0.2em]">Quantity</th>
                <th className="px-6 py-3 text-center text-[9px] font-bold text-muted uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered && filtered.length > 0 ? (
                filtered.map((product) => {
                  const isLowStock = product.stockLevel <= product.minStock;
                  return (
                    <tr key={product.id} className="hover:bg-surface transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap text-[10px] font-mono text-muted uppercase">{product.sku}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-[11px] font-bold uppercase tracking-tight group-hover:text-accent transition-colors">{product.name}</div>
                        <div className="text-[9px] text-muted mt-1 uppercase tracking-tighter truncate max-w-xs">{product.description || 'No Description'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-surface px-3 py-1 border border-border">{product.category?.name || 'Unclassified'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-xs font-serif font-bold italic">₦{Number(product.price).toLocaleString()}</div>
                        <div className="text-[9px] text-muted mt-1 uppercase tracking-tighter italic opacity-50">Cost: ₦{Number(product.cost).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className={`text-sm font-bold font-serif ${isLowStock ? 'text-accent' : 'text-primary'}`}>
                          {product.stockLevel}
                        </div>
                        {isLowStock && <div className="text-[8px] text-accent uppercase font-black tracking-widest mt-1">Critical</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-6">
                          <button onClick={() => handleEdit(product)}
                            className="text-primary hover:text-accent transition-colors cursor-pointer">
                            <Edit3 size={16} />
                          </button>
                          <button onClick={() => handleDelete(product.id)}
                            className="text-primary hover:text-red-600 transition-colors cursor-pointer">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-30 italic text-muted">No products found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-start justify-center z-[100] p-4 lg:p-12 overflow-y-auto no-scrollbar"
          onClick={resetForm}
        >
          <div 
            className="bg-white border border-black w-full max-w-2xl my-auto animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-black flex justify-between items-end bg-surface">
              <div>
                <h2 className="text-2xl font-serif font-bold italic leading-none">
                  {editingId ? 'Edit Product' : 'Add New Product'}
                </h2>
                <p className="text-[9px] text-muted mt-2 uppercase tracking-[0.3em] font-bold">Enter product details below</p>
              </div>
              <button onClick={resetForm} className="text-muted hover:text-accent transition-colors mb-2">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-muted uppercase tracking-[0.2em]">SKU *</label>
                  <input name="sku" value={form.sku} onChange={handleChange} required
                    className="w-full px-4 py-3 bg-white border border-border focus:border-black outline-none transition-all text-xs tracking-wider uppercase font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-muted uppercase tracking-[0.2em]">Product Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} required
                    className="w-full px-4 py-3 bg-white border border-border focus:border-black outline-none transition-all text-xs tracking-wider uppercase font-bold" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-bold text-muted uppercase tracking-[0.2em]">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={2}
                  className="w-full px-4 py-4 bg-white border border-border focus:border-black outline-none transition-all text-xs tracking-wider" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-muted uppercase tracking-[0.2em]">Selling Price *</label>
                  <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} required
                    className="w-full px-4 py-3 bg-white border border-border focus:border-black outline-none transition-all text-xs tracking-wider font-serif italic" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-muted uppercase tracking-[0.2em]">Cost Price *</label>
                  <input name="cost" type="number" step="0.01" value={form.cost} onChange={handleChange} required
                    className="w-full px-4 py-3 bg-white border border-border focus:border-black outline-none transition-all text-xs tracking-wider font-serif italic" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-muted uppercase tracking-[0.2em]">Current Stock</label>
                  <input name="stockLevel" type="number" value={form.stockLevel} onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-border focus:border-black outline-none transition-all text-xs tracking-wider font-serif" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-muted uppercase tracking-[0.2em]">Min Stock Alert</label>
                  <input name="minStock" type="number" value={form.minStock} onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-border focus:border-black outline-none transition-all text-xs tracking-wider font-serif" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-bold text-muted uppercase tracking-[0.2em]">Category</label>
                <select name="categoryId" value={form.categoryId} onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-border focus:border-black outline-none transition-all text-[10px] uppercase font-bold tracking-widest cursor-pointer">
                  <option value="">NO CATEGORY</option>
                  {categories?.map((cat: Category) => (
                    <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-6 pt-6 border-t border-border">
                <button type="button" onClick={resetForm}
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted hover:text-black transition-colors">
                  Abort
                </button>
                <button type="submit"
                  disabled={createProduct.isPending || updateProduct.isPending}
                  className="craft-btn flex items-center gap-3 text-[10px] h-10 px-6 disabled:opacity-30"
                >
                  {editingId ? <Edit3 size={16} /> : <Plus size={16} />}
                  Execute Commit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
