import { useEffect, useMemo, useState } from "react";
import { TrendingUp, Users, PackageOpen, AlertTriangle, CreditCard, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { api } from '../../lib/api';

const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

function formatCurrency(value: number) {
  return `${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0))} DT`;
}

export function Dashboard() {
  const [dashboard, setDashboard] = useState<any>({});
  const [sales, setSales] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [stock, setStock] = useState<any>({ products: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [dashboardData, salesData, stockData, topData] = await Promise.all([
          api.reports.getDashboard(),
          api.reports.getSales(),
          api.reports.getStock(),
          api.reports.getTopProducts(5),
        ]);

        setDashboard(dashboardData || {});
        setSales(salesData?.sales || []);
        setStock(stockData || { products: [] });
        setTopProducts(topData || []);
      } catch {
        setDashboard({});
        setSales([]);
        setStock({ products: [] });
        setTopProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const salesChartData = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));

      const label = dayNames[date.getDay()];
      const total = sales
        .filter((sale: any) => {
          const saleDate = new Date(sale.date);
          return saleDate.toDateString() === date.toDateString();
        })
        .reduce((sum: number, sale: any) => sum + Number(sale.total || 0), 0);

      return { name: label, total };
    });
  }, [sales]);

  const alerts = useMemo(() => {
    return (stock.products || [])
      .filter((product: any) => product.stockActuel <= (product.stockMinimum || 0) || product.stockActuel <= 0)
      .slice(0, 3);
  }, [stock]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-orange-500" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <h2 className="text-3xl font-bold tracking-tight text-primary">Tableau de Bord</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Chiffre d'affaires</h3>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold">{formatCurrency(dashboard.revenue || 0)}</div>
          <p className="text-xs text-muted-foreground">Période active du dashboard</p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Ventes</h3>
            <PackageOpen className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold">{dashboard.salesCount || 0}</div>
          <p className="text-xs text-muted-foreground">Total selon la période</p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Total Clients</h3>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold">{dashboard.customersCount || 0}</div>
          <p className="text-xs text-muted-foreground">Clients enregistrés</p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50/80 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-red-600">Crédits Clients</h3>
            <CreditCard className="h-4 w-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-destructive">{formatCurrency(dashboard.totalCredits || 0)}</div>
          <p className="text-xs text-destructive/80">En cours</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="rounded-xl border bg-card p-6 shadow-sm col-span-4">
          <h3 className="text-lg font-semibold mb-4">Évolution des ventes sur 7 jours</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}DT`} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Ventes']}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                  itemStyle={{ color: 'hsl(var(--primary))' }}
                />
                <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm col-span-3">
          <h3 className="text-lg font-semibold mb-4">Produits les plus vendus</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts.map((item: any) => ({ name: item.product?.name || 'Produit', ventes: item.totalSold || 0 }))} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--muted))" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} formatter={(value: number) => [`${value}`, 'Ventes']} contentStyle={{ borderRadius: '8px' }} />
                <Bar dataKey="ventes" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-warning/50 bg-warning/10 p-4 flex gap-3 items-start shadow-sm mt-2">
        <AlertTriangle className="text-orange-500 mt-0.5" size={20} />
        <div>
          <h4 className="font-semibold text-orange-700">Alertes de Stock</h4>
          {alerts.length === 0 ? (
            <p className="text-sm text-orange-800 mt-1">Aucune alerte pour le moment.</p>
          ) : (
            <ul className="text-sm text-orange-800 mt-1 list-disc list-inside">
              {alerts.map((product: any) => (
                <li key={product.id}>
                  <strong>{product.name}</strong> : {product.stockActuel <= 0 ? 'Stock en rupture' : 'Stock faible'} ({product.stockActuel} {product.unit || ''}, seuil: {product.stockMinimum || 0})
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
