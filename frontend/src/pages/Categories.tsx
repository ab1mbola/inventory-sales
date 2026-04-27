import { useState } from 'react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../hooks/useCategories';
import type { Category } from '../types';
import { Pencil, Trash2, X, Check } from 'lucide-react';
import LoadingOverlay from '../components/LoadingOverlay';

export default function Categories() {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createCategory.mutateAsync({ name: name.trim(), description: description.trim() || undefined });
    setName('');
    setDescription('');
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditDescription(cat.description || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditDescription('');
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    await updateCategory.mutateAsync({
      id: editingId,
      data: { name: editName.trim(), description: editDescription.trim() || undefined },
    });
    cancelEdit();
  };

  const handleDelete = async (id: string, categoryName: string) => {
    if (window.confirm(`Delete category "${categoryName}"? Products using it will become uncategorized.`)) {
      try {
        await deleteCategory.mutateAsync(id);
      } catch {
        alert('Cannot delete: this category still has products assigned. Remove or reassign them first.');
      }
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-400">Loading categories...</div>;

  const isMutating = createCategory.isPending || updateCategory.isPending || deleteCategory.isPending;

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {isMutating && <LoadingOverlay message={deleteCategory.isPending ? 'Deleting...' : editingId ? 'Updating...' : 'Creating...'} />}
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Categories</h1>

      {/* Create Form */}
      <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Category name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>
        <button
          type="submit"
          disabled={createCategory.isPending}
          className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
        >
          + Add
        </button>
      </form>

      {/* List */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
            <tr>
              <th className="px-4 py-4">Name</th>
              <th className="px-4 py-4">Description</th>
              <th className="px-4 py-4 text-center w-28">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories && categories.length > 0 ? (
              categories.map((cat) => (
                <tr key={cat.id} className="bg-white hover:bg-slate-50 transition-colors">
                  {editingId === cat.id ? (
                    <>
                      <td className="px-4 py-2">
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button onClick={saveEdit} disabled={updateCategory.isPending}
                          className="text-green-400 hover:text-green-300 mr-2 cursor-pointer">
                          <Check size={16} />
                        </button>
                        <button onClick={cancelEdit}
                          className="text-gray-400 hover:text-gray-300 cursor-pointer">
                          <X size={16} />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-4 text-slate-900 font-semibold">{cat.name}</td>
                      <td className="px-4 py-4 text-slate-500">{cat.description || '—'}</td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button onClick={() => startEdit(cat)}
                            className="text-blue-600 hover:text-blue-700 cursor-pointer">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => handleDelete(cat.id, cat.name)}
                            className="text-red-500 hover:text-red-600 cursor-pointer">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-slate-400">
                  No categories yet. Create one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-slate-400 font-medium">
        {categories?.length ?? 0} categor{(categories?.length ?? 0) !== 1 ? 'ies' : 'y'}
      </div>
    </div>
  );
}
