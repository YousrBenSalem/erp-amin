import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Plus, Search, Edit, Trash2, FolderTree, Loader2, X } from 'lucide-react';

export function Categories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState<any>(null);
  const [form, setForm] = useState({ name: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    try {
      const data = await api.categories.getAll();
      setCategories(data);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = categories.filter(cat =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  function openAdd() {
    setEditCategory(null);
    setForm({ name: '' });
    setShowModal(true);
    setError('');
  }

  function openEdit(category: any) {
    setEditCategory(category);
    setForm({ name: category.name });
    setShowModal(true);
    setError('');
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      if (editCategory) {
        await api.categories.update(editCategory.id, { name: form.name.trim() });
      } else {
        await api.categories.create({ name: form.name.trim() });
      }
      setShowModal(false);
      await loadCategories();
    } catch (e: any) {
      setError(e.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette catégorie ?')) return;
    try {
      await api.categories.delete(id);
      await loadCategories();
    } catch {
      setError('Impossible de supprimer cette catégorie');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Catégories</h2>
          <p className="text-sm text-gray-500">{categories.length} catégories enregistrées</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 shadow-sm transition-all"
        >
          <Plus size={16} /> Nouvelle catégorie
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une catégorie..."
              className="h-9 w-full rounded-lg border border-gray-200 bg-stone-50 pl-9 pr-4 text-sm focus:border-orange-400 outline-none"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="animate-spin text-orange-500" size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <FolderTree size={48} className="mb-2 text-gray-300" />
            <p>Aucune catégorie trouvée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-stone-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Nom</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Produits</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(category => (
                  <tr key={category.id} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{category.name}</td>
                    <td className="px-4 py-3 text-gray-600">{category.products?.length ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEdit(category)} className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded transition-colors"><Edit size={15} /></button>
                        <button onClick={() => handleDelete(category.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 m-4">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">{editCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            {error && <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-600 rounded text-sm">{error}</div>}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Nom de la catégorie *</label>
                <input
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 outline-none"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Poivre noir"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
              <button onClick={handleSave} disabled={saving || !form.name.trim()} className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2">
                {saving && <Loader2 className="animate-spin" size={14} />}
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
