import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Plus, Search, Edit, Trash2, Package, AlertTriangle, Loader2, X } from 'lucide-react';

function getStatusBadge(stock: number, min: number) {
  if (stock <= 0) return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Rupture</span>;
  if (stock <= min) return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">Stock faible</span>;
  return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">En stock</span>;
}

export function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    reference: '',
    unit: 'kg',
    categoryId: '',
    prixAchat: 0,
    prixVenteDetail: 0,
    prixVenteGros: 0,
    stockActuel: 0,
    stockMinimum: 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const data = await api.products.getAll();
      setProducts(data);
    } catch { /* api not connected yet, show empty */ }
    setLoading(false);
  }

  async function loadCategories() {
    try {
      const data = await api.categories.getAll();
      setCategories(data);
    } catch {
      setCategories([]);
    }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.reference?.toLowerCase().includes(search.toLowerCase())
  );

  function openAdd() {
    setEditProduct(null);
    setForm({
      name: '',
      reference: '',
      unit: 'kg',
      categoryId: categories[0]?.id || '',
      prixAchat: 0,
      prixVenteDetail: 0,
      prixVenteGros: 0,
      stockActuel: 0,
      stockMinimum: 0,
    });
    setShowModal(true);
    setError('');
  }

  function openEdit(p: any) {
    setEditProduct(p);
    setForm({
      name: p.name,
      reference: p.reference,
      unit: p.unit,
      categoryId: p.categoryId || p.category?.id || '',
      prixAchat: p.prixAchat,
      prixVenteDetail: p.prixVenteDetail,
      prixVenteGros: p.prixVenteGros,
      stockActuel: p.stockActuel,
      stockMinimum: p.stockMinimum,
    });
    setShowModal(true);
    setError('');
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        reference: form.reference || `EP-${Date.now()}`,
        categoryId: form.categoryId || undefined,
      };

      if (editProduct) {
        await api.products.update(editProduct.id, payload);
      } else {
        await api.products.create(payload);
      }
      setShowModal(false);
      await loadProducts();
    } catch (e: any) {
      setError(e.message || 'Erreur');
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce produit ?')) return;
    try {
      await api.products.delete(id);
      loadProducts();
    } catch { }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Produits</h2>
          <p className="text-sm text-gray-500">{products.length} produits enregistrés</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 shadow-sm transition-all"
        >
          <Plus size={16} /> Nouveau produit
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
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
            <Package size={48} className="mb-2 text-gray-300" />
            <p>Aucun produit trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-stone-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Référence</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Nom</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Catégorie</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Unité</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Stock</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Prix Détail</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Prix Gros</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Statut</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.reference}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                    <td className="px-4 py-3 text-gray-600">{p.category?.name || 'Sans catégorie'}</td>
                    <td className="px-4 py-3 text-gray-600">{p.unit}</td>
                    <td className="px-4 py-3 text-right font-medium">{p.stockActuel}</td>
                    <td className="px-4 py-3 text-right text-orange-600 font-semibold">{Number(p.prixVenteDetail).toFixed(2)} DT</td>
                    <td className="px-4 py-3 text-right text-amber-600 font-semibold">{Number(p.prixVenteGros).toFixed(2)} DT</td>
                    <td className="px-4 py-3 text-center">{getStatusBadge(p.stockActuel, p.stockMinimum)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded transition-colors"><Edit size={15} /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 m-4">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">{editProduct ? 'Modifier le produit' : 'Nouveau produit'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            {error && <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-600 rounded text-sm">{error}</div>}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700">Nom du produit *</label>
                <input className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700">Catégorie</label>
                <select className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 outline-none" value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}>
                  <option value="">Sans catégorie</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Unité</label>
                <select className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 outline-none" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}>
                  {['kg','g','sac','carton','boîte','paquet','unité'].map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Stock actuel</label>
                <input type="number" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 outline-none" value={form.stockActuel} onChange={e => setForm({...form, stockActuel: +e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Prix d'achat (DT)</label>
                <input type="number" step="0.01" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 outline-none" value={form.prixAchat} onChange={e => setForm({...form, prixAchat: +e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Prix vente détail (DT)</label>
                <input type="number" step="0.01" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 outline-none" value={form.prixVenteDetail} onChange={e => setForm({...form, prixVenteDetail: +e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Prix vente gros (DT)</label>
                <input type="number" step="0.01" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 outline-none" value={form.prixVenteGros} onChange={e => setForm({...form, prixVenteGros: +e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Stock minimum</label>
                <input type="number" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 outline-none" value={form.stockMinimum} onChange={e => setForm({...form, stockMinimum: +e.target.value})} />
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2">
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
