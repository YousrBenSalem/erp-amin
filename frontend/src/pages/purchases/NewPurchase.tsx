import { useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api';
import { Loader2, Plus, Trash2, CheckCircle, Package2 } from 'lucide-react';

export function NewPurchase() {
  const [products, setProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [draft, setDraft] = useState<{ productId: string; quantity: number; price: number }[]>([]);
  const [form, setForm] = useState({ productId: '', quantity: 1, price: 0 });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.products.getAll(), api.suppliers.getAll()])
      .then(([prods, supps]) => {
        setProducts(prods);
        setSuppliers(supps);
      })
      .catch(() => {
        setProducts([]);
        setSuppliers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const subtotal = useMemo(
    () => draft.reduce((sum, item) => sum + Number(item.quantity) * Number(item.price), 0),
    [draft]
  );

  const addItem = () => {
    if (!form.productId) {
      setError('Sélectionnez un produit');
      return;
    }
    if (form.quantity <= 0 || form.price < 0) {
      setError('Quantité et prix invalides');
      return;
    }

    setDraft(prev => {
      const existing = prev.find(item => item.productId === form.productId);

      if (existing) {
        return prev.map(item =>
          item.productId === form.productId
            ? { ...item, quantity: Number(item.quantity) + Number(form.quantity), price: Number(form.price) }
            : item
        );
      }

      return [
        ...prev,
        {
          productId: form.productId,
          quantity: Number(form.quantity),
          price: Number(form.price),
        },
      ];
    });

    setForm({ productId: '', quantity: 1, price: 0 });
    setError('');
  };

  const removeItem = (productId: string) => {
    setDraft(prev => prev.filter(item => item.productId !== productId));
  };

  const submit = async () => {
    if (!selectedSupplier) {
      setError('Sélectionnez un fournisseur');
      return;
    }
    if (draft.length === 0) {
      setError('Ajoutez au moins un produit');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await api.purchases.create({
        supplierId: selectedSupplier,
        date: new Date().toISOString(),
        status: 'ORDERED',
        discount: 0,
        fees: 0,
        items: draft.map(item => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          price: Number(item.price),
        })),
      });
      setSuccess('Commande d’achat enregistrée');
      setDraft([]);
      setSelectedSupplier('');
    } catch (e: any) {
      setError(e.message || 'Erreur lors de l’achat');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-orange-500" size={32} /></div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Nouvel achat</h2>
        <p className="text-sm text-gray-500">Créer une commande fournisseur</p>
      </div>

      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 text-green-700 px-3 py-2 text-sm">
          <CheckCircle size={16} /> {success}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-600 px-3 py-2 text-sm">{error}</div>
      )}

      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700">Fournisseur</label>
            <select
              value={selectedSupplier}
              onChange={e => setSelectedSupplier(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-stone-50 px-3 py-2 text-sm focus:border-orange-400 outline-none"
            >
              <option value="">Choisir un fournisseur</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="text-sm font-medium text-gray-700">Produit</label>
              <select
                value={form.productId}
                onChange={e => setForm({ ...form, productId: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-stone-50 px-3 py-2 text-sm focus:border-orange-400 outline-none"
              >
                <option value="">Produit</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Qté</label>
              <input
                type="number"
                min={1}
                value={form.quantity}
                onChange={e => setForm({ ...form, quantity: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-stone-50 px-3 py-2 text-sm focus:border-orange-400 outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Prix unitaire</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.price}
                onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-stone-50 px-3 py-2 text-sm focus:border-orange-400 outline-none"
              />
            </div>
          </div>

          <button
            onClick={addItem}
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
          >
            <Plus size={16} /> Ajouter un produit
          </button>

          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <div className="bg-stone-50 px-4 py-3 font-medium text-gray-700 flex items-center gap-2">
              <Package2 size={16} /> Détail de la commande
            </div>
            {draft.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">Aucun produit ajouté</div>
            ) : (
              <div className="divide-y">
                {draft.map(item => {
                  const product = products.find(p => p.id === item.productId);
                  return (
                    <div key={item.productId} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-800">{product?.name || 'Produit'}</p>
                        <p className="text-xs text-gray-500">{item.quantity} × {Number(item.price).toFixed(2)} DT</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-orange-600">{(item.quantity * item.price).toFixed(2)} DT</span>
                        <button onClick={() => removeItem(item.productId)} className="text-gray-400 hover:text-red-500">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm h-fit">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Résumé</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600"><span>Sous-total</span><span>{Number(subtotal).toFixed(2)} DT</span></div>
            <div className="flex justify-between text-gray-600"><span>Remise</span><span>0.00 DT</span></div>
            <div className="flex justify-between text-gray-600"><span>Frais</span><span>0.00 DT</span></div>
            <div className="flex justify-between border-t pt-3 text-lg font-bold text-gray-900"><span>Total</span><span className="text-orange-600">{Number(subtotal).toFixed(2)} DT</span></div>
          </div>

          <button
            onClick={submit}
            disabled={saving || draft.length === 0 || !selectedSupplier}
            className="mt-6 w-full h-11 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            {saving ? 'Enregistrement...' : 'Valider l’achat'}
          </button>
        </div>
      </div>
    </div>
  );
}
