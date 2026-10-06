import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { ArrowDownCircle, ArrowUpCircle, Package, Plus, Search, Loader2, X } from 'lucide-react';

function getStatusBadge(stock: number, min: number) {
  if (stock <= 0) return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Rupture</span>;
  if (stock <= min) return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">Stock faible</span>;
  return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Satisfait</span>;
}

export function Stock() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    type: 'IN',
    quantity: 0,
    reason: '',
  });

  useEffect(() => {
    loadStock();
  }, []);

  async function loadStock() {
    setLoading(true);
    try {
      const data = await api.stock.getStatus();
      setProducts(data);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.reference?.toLowerCase().includes(search.toLowerCase())
  );

  function openMovement(product: any) {
    setSelectedProduct(product);
    setForm({ type: 'IN', quantity: 0, reason: '' });
    setError('');
    setShowModal(true);
  }

  async function handleSaveMovement() {
    if (!selectedProduct) return;
    setSaving(true);
    setError('');
    try {
      await api.stock.addMovement({
        productId: selectedProduct.id,
        type: form.type,
        quantity: Number(form.quantity),
        reason: form.reason || 'Mouvement manuel',
      });
      setShowModal(false);
      await loadStock();
    } catch (e: any) {
      setError(e.message || 'Erreur de mouvement de stock');
    } finally {
      setSaving(false);
    }
  }

  const totalStock = products.reduce((sum, product) => sum + Number(product.stockActuel || 0), 0);
  const lowStock = products.filter(product => product.stockActuel <= product.stockMinimum).length;
  const outOfStock = products.filter(product => product.stockActuel <= 0).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">État du stock</h2>
          <p className="text-sm text-gray-500">Suivi des produits et de la disponibilité</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Stock total</p>
            <Package className="text-orange-500" size={18} />
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">{totalStock}</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Stock faible</p>
            <ArrowDownCircle className="text-yellow-500" size={18} />
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">{lowStock}</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Rupture</p>
            <ArrowUpCircle className="text-red-500" size={18} />
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">{outOfStock}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
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
            <p>Aucun produit en stock</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-stone-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Produit</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Catégorie</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Stock</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Min</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Statut</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(product => (
                  <tr key={product.id} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.reference}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{product.category?.name || 'Sans catégorie'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{product.stockActuel}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{product.stockMinimum}</td>
                    <td className="px-4 py-3 text-center">{getStatusBadge(product.stockActuel, product.stockMinimum)}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => openMovement(product)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 transition-colors"
                      >
                        <Plus size={14} /> Mouvement
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 m-4">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">Mouvement de stock</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg bg-orange-50 border border-orange-100 p-3 text-sm text-orange-700">
                Produit : <span className="font-semibold">{selectedProduct.name}</span>
              </div>

              {error && <div className="p-2 bg-red-50 border border-red-200 text-red-600 rounded text-sm">{error}</div>}

              <div>
                <label className="text-sm font-medium text-gray-700">Type</label>
                <select
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 outline-none"
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                >
                  <option value="IN">Entrée</option>
                  <option value="OUT">Sortie</option>
                  <option value="ADJUSTMENT">Ajustement</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Quantité</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 outline-none"
                  value={form.quantity}
                  onChange={e => setForm({ ...form, quantity: Number(e.target.value) })}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Motif</label>
                <input
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 outline-none"
                  value={form.reason}
                  onChange={e => setForm({ ...form, reason: e.target.value })}
                  placeholder="Ex: Réception fournisseur"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
              <button
                onClick={handleSaveMovement}
                disabled={saving || Number(form.quantity) <= 0}
                className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="animate-spin" size={14} />}
                {saving ? 'Enregistrement...' : 'Valider'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
