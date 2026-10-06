import { useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api';
import { Loader2, BarChart3, Package, TrendingUp, Wallet, CalendarRange } from 'lucide-react';

const periods = {
  '7d': { label: '7 jours', from: () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) },
  '30d': { label: '30 jours', from: () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) },
  'month': { label: 'Ce mois', from: () => new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10) },
  'year': { label: 'Cette année', from: () => new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10) },
};

export function Reports() {
  const [dashboard, setDashboard] = useState<any>({});
  const [sales, setSales] = useState<any>({ sales: [], totalRevenue: 0 });
  const [stock, setStock] = useState<any>({ products: [], lowStock: [], outOfStock: [] });
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<keyof typeof periods>('month');

  const dateRange = useMemo(() => {
    const from = periods[period].from();
    const to = new Date().toISOString().slice(0, 10);
    return { from, to };
  }, [period]);

  useEffect(() => {
    loadReports();
  }, [dateRange.from, dateRange.to]);

  async function loadReports() {
    setLoading(true);
    try {
      const [dashboardData, salesData, stockData, topData] = await Promise.all([
        api.reports.getDashboard(dateRange.from, dateRange.to),
        api.reports.getSales(dateRange.from, dateRange.to),
        api.reports.getStock(),
        api.reports.getTopProducts(),
      ]);
      setDashboard(dashboardData);
      setSales(salesData);
      setStock(stockData);
      setTopProducts(topData);
    } catch {
      setDashboard({});
      setSales({ sales: [], totalRevenue: 0 });
      setStock({ products: [], lowStock: [], outOfStock: [] });
      setTopProducts([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-orange-500" size={32} /></div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rapports & Statistiques</h2>
          <p className="text-sm text-gray-500">Vue globale de la performance commerciale</p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
          <CalendarRange size={14} className="text-orange-500" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as keyof typeof periods)}
            className="bg-transparent text-sm font-medium text-gray-700 outline-none"
          >
            <option value="7d">7 jours</option>
            <option value="30d">30 jours</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm text-gray-500">CA période</p>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{Number(dashboard.revenue || sales.totalRevenue || 0).toFixed(2)} DT</div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm text-gray-500">Ventes</p>
            <BarChart3 className="h-4 w-4 text-sky-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{dashboard.salesCount || sales.totalSales || 0}</div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm text-gray-500">Produits</p>
            <Package className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{dashboard.productsCount || 0}</div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm text-gray-500">Crédits</p>
            <Wallet className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{Number(dashboard.totalCredits || 0).toFixed(2)} DT</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Ventes récentes</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-stone-50">
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Réf.</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Date</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600">Montant</th>
                </tr>
              </thead>
              <tbody>
                {(sales.sales || []).slice(0, 5).map((sale: any) => (
                  <tr key={sale.id} className="border-b border-gray-50">
                    <td className="px-3 py-2 text-gray-900">{sale.reference}</td>
                    <td className="px-3 py-2 text-gray-600">{new Date(sale.date).toLocaleDateString('fr-FR')}</td>
                    <td className="px-3 py-2 text-right font-semibold text-orange-600">{Number(sale.total).toFixed(2)} DT</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Produits phares</h3>
          <div className="space-y-3">
            {(topProducts || []).slice(0, 5).map((item: any, index: number) => (
              <div key={item.product?.id || index} className="flex items-center justify-between rounded-lg bg-stone-50 px-3 py-2">
                <div>
                  <p className="font-medium text-gray-900">{item.product?.name || 'Produit'}</p>
                  <p className="text-xs text-gray-500">Ventes: {item.totalSold}</p>
                </div>
                <div className="text-orange-600 font-semibold">#{index + 1}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-4">État du stock</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-stone-50">
                <th className="text-left px-3 py-2 font-medium text-gray-600">Produit</th>
                <th className="text-left px-3 py-2 font-medium text-gray-600">Stock</th>
                <th className="text-left px-3 py-2 font-medium text-gray-600">Min</th>
                <th className="text-right px-3 py-2 font-medium text-gray-600">Valeur</th>
              </tr>
            </thead>
            <tbody>
              {(stock.products || []).slice(0, 8).map((product: any) => (
                <tr key={product.id} className="border-b border-gray-50">
                  <td className="px-3 py-2 text-gray-900">{product.name}</td>
                  <td className="px-3 py-2 text-gray-600">{product.stockActuel}</td>
                  <td className="px-3 py-2 text-gray-600">{product.stockMinimum}</td>
                  <td className="px-3 py-2 text-right font-semibold text-orange-600">{Number(product.stockActuel * product.prixAchat).toFixed(2)} DT</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
