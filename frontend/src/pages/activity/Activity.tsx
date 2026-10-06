import { useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api';
import { Activity as ActivityIcon, Loader2, Clock3, CalendarRange, Filter } from 'lucide-react';

type RangeKey = 'today' | 'week' | 'month' | 'year' | 'all';

export function Activity() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<RangeKey>('month');
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    loadActivity();
  }, []);

  async function loadActivity() {
    setLoading(true);
    try {
      const data = await api.activity.getAll();
      setLogs(data);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredLogs = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    return logs.filter((log: any) => {
      const date = new Date(log.date);

      if (selectedDate) {
        const selected = new Date(selectedDate);
        return date.getFullYear() === selected.getFullYear() &&
          date.getMonth() === selected.getMonth() &&
          date.getDate() === selected.getDate();
      }

      if (range === 'today') return date >= startOfDay;
      if (range === 'week') return date >= startOfWeek;
      if (range === 'month') return date >= startOfMonth;
      if (range === 'year') return date >= startOfYear;
      return true;
    });
  }, [logs, range, selectedDate]);

  const stats = useMemo(() => ({
    total: filteredLogs.length,
    sales: filteredLogs.filter((log: any) => log.entity === 'Sale').length,
    payments: filteredLogs.filter((log: any) => log.entity === 'Payment').length,
    stock: filteredLogs.filter((log: any) => log.entity === 'StockMovement').length,
  }), [filteredLogs]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Historique des opérations</h2>
          <p className="text-sm text-gray-500">Suivi professionnel par période</p>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-1.5 shadow-sm">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-orange-500" />
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as RangeKey)}
              className="bg-transparent text-sm font-medium text-gray-700 outline-none"
            >
              <option value="today">Aujourd’hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="year">Cette année</option>
              <option value="all">Toute la période</option>
            </select>
          </div>

          <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
            <label className="text-xs text-gray-500">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-8 rounded-md border border-gray-200 bg-stone-50 px-2 text-sm outline-none focus:border-orange-400"
            />
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate('')}
                className="text-xs text-gray-500 hover:text-orange-600"
              >
                Effacer
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm text-gray-500">Total</p>
            <CalendarRange className="h-4 w-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm text-gray-500">Ventes</p>
            <ActivityIcon className="h-4 w-4 text-sky-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.sales}</div>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm text-gray-500">Paiements</p>
            <Clock3 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.payments}</div>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm text-gray-500">Stocks</p>
            <ActivityIcon className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.stock}</div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="animate-spin text-orange-500" size={32} />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-gray-400">Aucune activité pour cette période</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredLogs.map((log: any) => (
              <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-orange-50/30 transition-colors">
                <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <ActivityIcon size={16} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900">{log.action}</p>
                      <p className="text-xs text-gray-500">{log.entity} · {log.user?.name || 'Système'}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock3 size={12} /> {new Date(log.date).toLocaleString('fr-FR')}
                    </div>
                  </div>
                  {log.details && <p className="mt-2 text-sm text-gray-600">{log.details}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
