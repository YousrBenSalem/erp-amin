import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Loader2, Wallet, CheckCircle, TrendingUp, Search } from 'lucide-react';

export function Payments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadPayments();
  }, []);

  async function loadPayments() {
    setLoading(true);
    try {
      const data = await api.payments.getAll();
      setPayments(data);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = payments.filter(payment =>
    payment.reference?.toLowerCase().includes(search.toLowerCase()) ||
    payment.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
    payment.method?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPayments = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const receiptCount = payments.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Paiements</h2>
          <p className="text-sm text-gray-500">Historique des encaissements et règlements</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm text-gray-500">Montant total</p>
            <Wallet className="h-4 w-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalPayments.toFixed(2)} DT</div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm text-gray-500">Paiements</p>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{receiptCount}</div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm text-gray-500">Moyen le plus utilisé</p>
            <TrendingUp className="h-4 w-4 text-sky-500" />
          </div>
          <div className="text-lg font-bold text-gray-900">{payments[0]?.method || '—'}</div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un paiement..."
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
          <div className="flex items-center justify-center h-48 text-gray-400">Aucun paiement enregistré</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-stone-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Référence</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Client</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Méthode</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Montant</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(payment => (
                  <tr key={payment.id} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{payment.reference}</td>
                    <td className="px-4 py-3 text-gray-600">{payment.customer?.name || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{payment.method || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{new Date(payment.date).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-3 text-right font-semibold text-orange-600">{Number(payment.amount).toFixed(2)} DT</td>
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
