import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { ArrowDownCircle, ArrowUpCircle, Search, Loader2, Clock3 } from 'lucide-react';

export function StockMovements() {
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [productId, setProductId] = useState('');
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    loadProducts();
    loadMovements();
  }, []);

  async function loadProducts() {
    try {
      const data = await api.stock.getStatus();
      setProducts(data);
    } catch {
      setProducts([]);
    }
  }

  async function loadMovements(productFilter?: string) {
    setLoading(true);
    try {
      const data = await api.stock.getMovements(productFilter || productId || undefined);
      setMovements(data);
    } catch {
      setMovements([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = movements.filter(movement => {
    const label = `${movement.product?.name || ''} ${movement.reason || ''}`.toLowerCase();
    return label.includes(search.toLowerCase());
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Mouvements de stock</h2>
        <p className="text-sm text-gray-500">Historique des entrées, sorties et ajustements</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un mouvement..."
              className="h-9 w-full rounded-lg border border-gray-200 bg-stone-50 pl-9 pr-4 text-sm focus:border-orange-400 outline-none"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select
            className="h-9 rounded-lg border border-gray-200 bg-stone-50 px-3 text-sm focus:border-orange-400 outline-none"
            value={productId}
            onChange={e => {
              setProductId(e.target.value);
              loadMovements(e.target.value);
            }}
          >
            <option value="">Tous les produits</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>{product.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="animate-spin text-orange-500" size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <Clock3 size={48} className="mb-2 text-gray-300" />
            <p>Aucun mouvement trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-stone-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Référence</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Produit</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Qté</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Avant</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Après</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Motif</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(movement => (
                  <tr key={movement.id} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{movement.reference}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{movement.product?.name || 'Produit'}</td>
                    <td className="px-4 py-3">
                      {movement.type === 'IN' && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Entrée</span>}
                      {movement.type === 'OUT' && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Sortie</span>}
                      {movement.type === 'ADJUSTMENT' && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">Ajustement</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{movement.quantity}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{movement.stockBefore}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{movement.stockAfter}</td>
                    <td className="px-4 py-3 text-gray-600">{movement.reason || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(movement.date).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
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
