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

  if (isLoading) return <div className="p-8 text-center text-gray-400">Loading categories...</div>;

  const isMutating = createCategory.isPending || updateCategory.isPending || deleteCategory.isPending;

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      {isMutating && <LoadingOverlay message={deleteCategory.isPending ? 'Deleting...' : editingId ? 'Updating...' : 'Creating...'} />}
      <h1 className="text-2xl font-bold text-gray-100 mb-6">Categories</h1>

      {/* Create Form */}
      <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Category name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      <div className="rounded-xl border border-gray-700 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-center w-28">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {categories && categories.length > 0 ? (
              categories.map((cat) => (
                <tr key={cat.id} className="bg-gray-900 hover:bg-gray-800/50 transition-colors">
                  {editingId === cat.id ? (
                    <>
                      <td className="px-4 py-2">
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      <td className="px-4 py-3 text-gray-100 font-medium">{cat.name}</td>
                      <td className="px-4 py-3 text-gray-400">{cat.description || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => startEdit(cat)}
                          className="text-blue-400 hover:text-blue-300 mr-3 cursor-pointer">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(cat.id, cat.name)}
                          className="text-red-400 hover:text-red-300 cursor-pointer">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                  No categories yet. Create one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        {categories?.length ?? 0} categor{(categories?.length ?? 0) !== 1 ? 'ies' : 'y'}
      </div>
    </div>
  );
}
