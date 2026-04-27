import { useState } from 'react';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import type { Product, CreateProductPayload, Category } from '../types';
import LoadingOverlay from '../components/LoadingOverlay';

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

  if (isLoading) return <div className="p-8 text-center text-gray-400">Loading products...</div>;
  if (error) return <div className="p-8 text-center text-red-400">Failed to load products.</div>;

  const isMutating = createProduct.isPending || updateProduct.isPending || deleteProduct.isPending;

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {isMutating && <LoadingOverlay message={deleteProduct.isPending ? 'Deleting...' : editingId ? 'Updating...' : 'Creating...'} />}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Products</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
        >
          <span>+ Add Product</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {editingId ? 'Edit Product' : 'New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">SKU *</label>
                  <input name="sku" value={form.sku} onChange={handleChange} required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Selling Price *</label>
                  <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cost Price *</label>
                  <input name="cost" type="number" step="0.01" value={form.cost} onChange={handleChange} required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Stock Level</label>
                  <input name="stockLevel" type="number" value={form.stockLevel} onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Min Stock Alert</label>
                  <input name="minStock" type="number" value={form.minStock} onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label>
                <select name="categoryId" value={form.categoryId} onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                  <option value="">No Category</option>
                  {categories?.map((cat: Category) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={resetForm}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer font-medium">
                  Cancel
                </button>
                <button type="submit"
                  disabled={createProduct.isPending || updateProduct.isPending}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer font-medium shadow-sm">
                  {editingId ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
            <tr>
              <th className="px-4 py-4">SKU</th>
              <th className="px-4 py-4">Name</th>
              <th className="px-4 py-4">Category</th>
              <th className="px-4 py-4 text-right">Price</th>
              <th className="px-4 py-4 text-right">Cost</th>
              <th className="px-4 py-4 text-right">Stock</th>
              <th className="px-4 py-4 text-right">Min</th>
              <th className="px-4 py-4 text-center">Status</th>
              <th className="px-4 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filtered && filtered.length > 0 ? (
              filtered.map((product) => {
                const isLowStock = product.stockLevel <= product.minStock;
                return (
                  <tr key={product.id} className="bg-white hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0">
                    <td className="px-4 py-4 font-mono text-slate-500 text-xs">{product.sku}</td>
                    <td className="px-4 py-4 text-slate-900 font-semibold">{product.name}</td>
                    <td className="px-4 py-4 text-slate-500">{product.category?.name || '—'}</td>
                    <td className="px-4 py-4 text-right text-slate-900 font-medium">
                      ₦{Number(product.price).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-4 text-right text-slate-400">
                      ₦{Number(product.cost).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`px-4 py-4 text-right font-bold ${isLowStock ? 'text-red-600' : 'text-emerald-600'}`}>
                      {product.stockLevel}
                    </td>
                    <td className="px-4 py-4 text-right text-slate-400">{product.minStock}</td>
                    <td className="px-4 py-4 text-center">
                      {isLowStock ? (
                        <span className="px-2 py-1 text-[10px] font-bold uppercase rounded-full bg-red-100 text-red-600 border border-red-200">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-[10px] font-bold uppercase rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-700 font-bold text-xs uppercase tracking-wider cursor-pointer">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-700 font-bold text-xs uppercase tracking-wider cursor-pointer">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-4 text-sm text-gray-500">
        {filtered?.length ?? 0} product{(filtered?.length ?? 0) !== 1 ? 's' : ''} total
      </div>
    </div>
  );
}
