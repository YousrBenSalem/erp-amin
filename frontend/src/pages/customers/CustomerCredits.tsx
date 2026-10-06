import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Search, Loader2, CreditCard, AlertTriangle, UserRound, Plus, X } from 'lucide-react';

export function CustomerCredits() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [amount, setAmount] = useState(0);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCredits();
  }, []);

  async function loadCredits() {
    setLoading(true);
    try {
      const data = await api.customers.getCredits();
      setCustomers(data);
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }

  async function handlePayment() {
    if (!selectedCustomerId || amount <= 0) return;
    setSaving(true);
    try {
      await api.payments.create({
        customerId: selectedCustomerId,
        amount,
        method: 'CASH',
        date: paymentDate,
        notes: notes || 'Règlement de crédit client',
      });
      setShowModal(false);
      setAmount(0);
      setNotes('');
      setSelectedCustomerId('');
      await loadCredits();
    } finally {
      setSaving(false);
    }
  }

  const filtered = customers.filter(customer =>
    customer.name.toLowerCase().includes(search.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(search.toLowerCase()) ||
    customer.company?.toLowerCase().includes(search.toLowerCase())
  );

  const totalCredits = customers.reduce((sum, customer) => sum + Number(customer.balance || 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Crédits clients</h2>
          <p className="text-sm text-gray-500">Suivi des soldes clients en attente</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
        >
          <Plus size={16} /> Nouveau règlement
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm text-gray-500">Total encours</p>
            <CreditCard className="h-4 w-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalCredits.toFixed(2)} DT</div>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm text-gray-500">Clients concernés</p>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{customers.length}</div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un client..."
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
            <UserRound size={42} className="mb-2 text-gray-300" />
            <p>Aucun crédit client en cours</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-stone-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Client</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Société</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date crédit</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Facture</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Vente</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Solde</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(customer => (
                  <tr key={customer.id} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{customer.name}</td>
                    <td className="px-4 py-3 text-gray-600">{customer.company || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{customer.creditDate ? new Date(customer.creditDate).toLocaleDateString('fr-FR') : '-'}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{customer.invoiceReference || '-'}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{customer.saleReference || '-'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-orange-600">{Number(customer.balance).toFixed(2)} DT</td>
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
              <h3 className="text-lg font-bold">Nouveau règlement</h3>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Client</label>
                <select
                  value={selectedCustomerId}
                  onChange={e => setSelectedCustomerId(e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 outline-none"
                >
                  <option value="">Choisir un client</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Montant reçu</label>
                <input type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(Number(e.target.value))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 outline-none" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Date</label>
                <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 outline-none" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Note</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 outline-none" rows={3} />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Annuler</button>
              <button onClick={handlePayment} disabled={saving || !selectedCustomerId || amount <= 0} className="rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600 disabled:opacity-50">
                {saving ? 'Enregistrement...' : 'Valider'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
