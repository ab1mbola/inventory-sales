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
        <h1 className="text-2xl font-bold text-gray-100">Products</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
          className="w-full max-w-md px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">
              {editingId ? 'Edit Product' : 'New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">SKU *</label>
                  <input name="sku" value={form.sku} onChange={handleChange} required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={2}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Selling Price *</label>
                  <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Cost Price *</label>
                  <input name="cost" type="number" step="0.01" value={form.cost} onChange={handleChange} required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Stock Level</label>
                  <input name="stockLevel" type="number" value={form.stockLevel} onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Min Stock Alert</label>
                  <input name="minStock" type="number" value={form.minStock} onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Category</label>
                <select name="categoryId" value={form.categoryId} onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">No Category</option>
                  {categories?.map((cat: Category) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={resetForm}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit"
                  disabled={createProduct.isPending || updateProduct.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer">
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-right">Cost</th>
              <th className="px-4 py-3 text-right">Stock</th>
              <th className="px-4 py-3 text-right">Min</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filtered && filtered.length > 0 ? (
              filtered.map((product) => {
                const isLowStock = product.stockLevel <= product.minStock;
                return (
                  <tr key={product.id} className="bg-gray-900 hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-gray-300">{product.sku}</td>
                    <td className="px-4 py-3 text-gray-100 font-medium">{product.name}</td>
                    <td className="px-4 py-3 text-gray-400">{product.category?.name || '—'}</td>
                    <td className="px-4 py-3 text-right text-gray-100">
                      ₦{Number(product.price).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-400">
                      ₦{Number(product.cost).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold ${isLowStock ? 'text-red-400' : 'text-green-400'}`}>
                      {product.stockLevel}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">{product.minStock}</td>
                    <td className="px-4 py-3 text-center">
                      {isLowStock ? (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleEdit(product)}
                        className="text-blue-400 hover:text-blue-300 mr-3 cursor-pointer">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(product.id)}
                        className="text-red-400 hover:text-red-300 cursor-pointer">
                        Delete
                      </button>
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
