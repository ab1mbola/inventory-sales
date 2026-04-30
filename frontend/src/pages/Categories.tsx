import { useState } from 'react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../hooks/useCategories';
import type { Category } from '../types';
import { Pencil, Trash2, X, Check } from 'lucide-react';
import LoadingOverlay from '../components/LoadingOverlay';
import FullPageLoader from '../components/FullPageLoader';


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

  if (isLoading) return <FullPageLoader message="Accessing Registry..." />;


  const isMutating = createCategory.isPending || updateCategory.isPending || deleteCategory.isPending;

  return (
    <div className="p-6 lg:p-12 max-w-[1200px] mx-auto space-y-12 bg-white">
      {isMutating && <LoadingOverlay message={deleteCategory.isPending ? 'Deleting...' : editingId ? 'Updating...' : 'Creating...'} />}
      
      {/* Header */}
      <div className="border-b border-black pb-8">
        <h1 className="text-4xl lg:text-6xl font-serif font-bold tracking-tighter uppercase leading-none italic">Categories</h1>
        <p className="text-[10px] text-muted mt-4 uppercase tracking-[0.3em] font-bold italic">Product Classification Registry</p>
      </div>

      {/* Create Form */}
      <div className="craft-card p-8 bg-surface/30">
        <h2 className="text-sm font-bold uppercase tracking-[0.2em] mb-6 italic">Append Classification</h2>
        <form onSubmit={handleCreate} className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-4">
             <input
                type="text"
                placeholder="CATEGORY NAME *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-white border border-border px-4 py-3 text-xs uppercase tracking-widest focus:border-accent focus:outline-none transition-colors"
              />
              <input
                type="text"
                placeholder="DESCRIPTION (OPTIONAL)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white border border-border px-4 py-3 text-xs uppercase tracking-widest focus:border-accent focus:outline-none transition-colors"
              />
          </div>
          <button
            type="submit"
            disabled={createCategory.isPending}
            className="craft-btn lg:w-48 h-[104px] flex items-center justify-center text-[10px]"
          >
            + COMMIT
          </button>
        </form>
      </div>

      {/* List */}
      <div className="craft-card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-primary text-white text-[9px] uppercase tracking-[0.2em] font-bold">
            <tr>
              <th className="px-8 py-4">Classification</th>
              <th className="px-8 py-4">Definition</th>
              <th className="px-8 py-4 text-center w-32">Registry Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories && categories.length > 0 ? (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-surface transition-colors">
                  {editingId === cat.id ? (
                    <>
                      <td className="px-8 py-4">
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-white border border-accent px-3 py-2 text-xs uppercase tracking-widest focus:outline-none"
                          autoFocus
                        />
                      </td>
                      <td className="px-8 py-4">
                        <input
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full bg-white border border-accent px-3 py-2 text-xs uppercase tracking-widest focus:outline-none"
                        />
                      </td>
                      <td className="px-8 py-4 text-center">
                        <div className="flex items-center justify-center gap-4">
                          <button onClick={saveEdit} disabled={updateCategory.isPending}
                            className="text-accent hover:scale-110 transition-transform cursor-pointer">
                            <Check size={18} />
                          </button>
                          <button onClick={cancelEdit}
                            className="text-muted hover:text-primary transition-colors cursor-pointer">
                            <X size={18} />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-8 py-6">
                        <span className="text-sm font-bold uppercase tracking-tight">{cat.name}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[11px] text-muted uppercase tracking-tight">{cat.description || 'NOT DEFINED'}</span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex items-center justify-center gap-6">
                          <button onClick={() => startEdit(cat)}
                            className="text-primary hover:text-accent transition-colors cursor-pointer p-2">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDelete(cat.id, cat.name)}
                            className="text-muted hover:text-accent transition-colors cursor-pointer p-2">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-8 py-20 text-center text-[10px] uppercase tracking-[0.3em] text-muted font-bold">
                  No classifications found in registry.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pt-8 border-t border-border flex justify-between items-center">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted">
          Total: {categories?.length ?? 0} Classifications
        </p>
        <div className="h-px bg-border flex-1 mx-8" />
      </div>
    </div>
  );
}
