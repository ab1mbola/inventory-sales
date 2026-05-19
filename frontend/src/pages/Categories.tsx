import { useState } from 'react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../hooks/useCategories';
import type { Category } from '../types';
import { Pencil, Trash2, X, Check, Layers, Plus } from 'lucide-react';
import LoadingOverlay from '../components/LoadingOverlay';
import FullPageLoader from '../components/FullPageLoader';
import AnimatedPage from '../components/AnimatedPage';
import { motion } from 'framer-motion';


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

  if (isLoading) return <FullPageLoader message="Loading Categories..." />;

  const isMutating = createCategory.isPending || updateCategory.isPending || deleteCategory.isPending;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { ease: [0.23, 1, 0.32, 1] as const, duration: 0.6 } }
  };

  return (
    <AnimatedPage className="p-6 lg:p-20 max-w-[1400px] mx-auto space-y-16 bg-white">
      {isMutating && <LoadingOverlay message={deleteCategory.isPending ? 'Deleting...' : editingId ? 'Updating...' : 'Creating...'} />}
      
      {/* Header */}
      <div className="border-b border-black pb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl lg:text-7xl font-serif font-bold tracking-tighter uppercase leading-none italic">Categories</h1>
          <p className="text-[10px] text-muted mt-6 uppercase tracking-[0.5em] font-bold opacity-60 italic">Manage Product Categories</p>
        </div>
        <div className="flex items-center gap-10">
           <div className="text-right">
              <p className="text-[9px] text-muted uppercase tracking-[0.3em] font-bold opacity-60">Total Categories</p>
              <p className="font-serif text-3xl font-bold italic leading-none mt-2">{categories?.length ?? 0}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-16">
        {/* Create Form */}
        <div className="xl:col-span-4 space-y-10">
           <div className="space-y-4">
              <h2 className="text-xl font-serif font-bold italic uppercase tracking-tighter">Add New Category</h2>
              <p className="text-[9px] text-muted uppercase tracking-[0.3em] font-bold opacity-40">Create a new category for classification</p>
           </div>

           <form onSubmit={handleCreate} className="space-y-8 p-10 border border-black bg-surface/30">
              <div className="space-y-3">
                 <label className="text-[9px] font-bold text-muted uppercase tracking-[0.3em]">Category Name *</label>
                 <input
                    type="text"
                    placeholder="E.G. FOOTWEAR"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="input-premium"
                  />
              </div>
              <div className="space-y-3">
                 <label className="text-[9px] font-bold text-muted uppercase tracking-[0.3em]">Description</label>
                 <textarea
                    placeholder="OPTIONAL DESCRIPTION"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full bg-white border border-border px-6 py-5 text-xs uppercase tracking-[0.1em] focus:border-black focus:outline-none transition-all placeholder:opacity-20"
                  />
              </div>
              <button
                type="submit"
                disabled={createCategory.isPending}
                className="craft-btn w-full flex items-center justify-center gap-4"
              >
                <Plus size={16} />
                Save Category
              </button>
           </form>
        </div>

        {/* List */}
        <div className="xl:col-span-8 space-y-10">
           <div className="space-y-4">
              <h2 className="text-xl font-serif font-bold italic uppercase tracking-tighter">All Categories</h2>
              <p className="text-[9px] text-muted uppercase tracking-[0.3em] font-bold opacity-40">List of all product categories</p>
           </div>

           <div className="craft-card overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-black text-white text-[9px] uppercase tracking-[0.4em] font-bold">
                <tr>
                  <th className="px-10 py-6">Category Name</th>
                  <th className="px-10 py-6">Description</th>
                  <th className="px-10 py-6 text-center w-40">Actions</th>
                </tr>
              </thead>
              <motion.tbody 
                variants={container}
                initial="hidden"
                animate="show"
                className="divide-y divide-border"
              >
                {categories && categories.length > 0 ? (
                  categories.map((cat) => (
                    <motion.tr key={cat.id} variants={item} className="hover:bg-surface transition-all duration-500 group">
                      {editingId === cat.id ? (
                        <>
                          <td className="px-10 py-6">
                            <input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full bg-white border border-accent px-4 py-3 text-xs uppercase tracking-widest focus:outline-none font-bold"
                              autoFocus
                            />
                          </td>
                          <td className="px-10 py-6">
                            <input
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              className="w-full bg-white border border-accent px-4 py-3 text-xs uppercase tracking-widest focus:outline-none"
                            />
                          </td>
                          <td className="px-10 py-6 text-center">
                            <div className="flex items-center justify-center gap-6">
                              <button onClick={saveEdit} disabled={updateCategory.isPending}
                                className="text-accent hover:scale-125 transition-all cursor-pointer">
                                <Check size={20} strokeWidth={2.5} />
                              </button>
                              <button onClick={cancelEdit}
                                className="text-muted hover:text-primary transition-colors cursor-pointer">
                                <X size={20} strokeWidth={1} />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-10 py-8">
                             <div className="flex items-center gap-6">
                                <div className="w-10 h-10 bg-surface border border-border flex items-center justify-center text-muted group-hover:bg-white group-hover:border-primary transition-all duration-500">
                                   <Layers size={16} strokeWidth={1} />
                                </div>
                                <span className="text-sm font-bold uppercase tracking-widest group-hover:text-primary transition-colors">{cat.name}</span>
                             </div>
                          </td>
                          <td className="px-10 py-8">
                            <span className="text-[10px] text-muted uppercase tracking-wider font-medium opacity-60 leading-relaxed italic line-clamp-2">{cat.description || 'No description'}</span>
                          </td>
                          <td className="px-10 py-8 text-center">
                            <div className="flex items-center justify-center gap-8 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                              <button onClick={() => startEdit(cat)}
                                className="text-primary hover:text-accent transition-all duration-300 transform hover:scale-110 cursor-pointer p-2">
                                <Pencil size={16} strokeWidth={1} />
                              </button>
                              <button onClick={() => handleDelete(cat.id, cat.name)}
                                className="text-muted hover:text-red-500 transition-all duration-300 transform hover:scale-110 cursor-pointer p-2">
                                <Trash2 size={16} strokeWidth={1} />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </motion.tr>
                  ))
                ) : (
                  <motion.tr variants={item}>
                    <td colSpan={3} className="px-10 py-24 text-center">
                       <div className="opacity-20 flex flex-col items-center gap-6">
                          <Layers size={40} strokeWidth={0.5} />
                          <p className="text-[10px] uppercase tracking-[0.6em] font-bold italic">No categories found</p>
                       </div>
                    </td>
                  </motion.tr>
                )}
              </motion.tbody>
            </table>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}


