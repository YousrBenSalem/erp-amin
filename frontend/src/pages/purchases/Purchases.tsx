import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Search, Loader2, CheckCircle2, PackageCheck, Truck, ShoppingCart, DollarSign } from 'lucide-react';

export function Purchases() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadPurchases();
  }, []);

  async function loadPurchases() {
    setLoading(true);
    try {
      const data = await api.purchases.getAll();
      setPurchases(data);
    } catch {
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = purchases.filter(purchase =>
    purchase.reference?.toLowerCase().includes(search.toLowerCase()) ||
    purchase.supplier?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const receiveOrder = async (id: string) => {
    try {
      await api.purchases.receive(id);
      await loadPurchases();
    } catch {
      // no-op: could replace by toast later
    }
  };

  const totalPurchases = purchases.reduce((sum, purchase) => sum + Number(purchase.finalTotal ?? purchase.total ?? 0), 0);
  const openPurchases = purchases.filter(item => item.status !== 'RECEIVED').length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Commandes d’achat</h2>
          <p className="text-sm text-gray-500">Suivi des achats et réception des livraisons</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm text-gray-500">Total achats</p>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalPurchases.toFixed(2)} DT</div>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm text-gray-500">Commandes ouvertes</p>
            <ShoppingCart className="h-4 w-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{openPurchases}</div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une commande..."
              className="h-9 w-full rounded-lg border border-gray-200 bg-stone-50 pl-9 pr-4 text-sm focus:border-orange-400 outline-none"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="animate-spin text-orange-500" size={32} /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <Truck size={42} className="mb-2 text-gray-300" />
            <p>Aucune commande enregistrée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-stone-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Référence</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Fournisseur</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Statut</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(purchase => (
                  <tr key={purchase.id} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{purchase.reference}</td>
                    <td className="px-4 py-3 text-gray-900">{purchase.supplier?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{new Date(purchase.date).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold ${
                        purchase.status === 'RECEIVED' ? 'bg-green-100 text-green-700' :
                        purchase.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {purchase.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-orange-600">{Number(purchase.finalTotal ?? purchase.total ?? 0).toFixed(2)} DT</td>
                    <td className="px-4 py-3 text-center">
                      {purchase.status !== 'RECEIVED' ? (
                        <button
                          onClick={() => receiveOrder(purchase.id)}
                          className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-green-700 text-xs font-semibold hover:bg-green-100"
                        >
                          <CheckCircle2 size={14} /> Recevoir
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-2 text-green-700 text-xs font-semibold">
                          <PackageCheck size={14} /> Reçu
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
