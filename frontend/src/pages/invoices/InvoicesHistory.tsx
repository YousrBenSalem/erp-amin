import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { FileText, Loader2, Search, ReceiptText, WalletCards } from 'lucide-react';
import { openPrintableInvoice } from '../../lib/invoicePrinter';

export function InvoicesHistory() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadInvoices();
  }, []);

  async function loadInvoices() {
    setLoading(true);
    try {
      const data = await api.invoices.getAll();
      setInvoices(data);
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = invoices.filter(invoice =>
    invoice.reference.toLowerCase().includes(search.toLowerCase()) ||
    invoice.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
    invoice.sale?.reference?.toLowerCase().includes(search.toLowerCase())
  );

  const totalInvoice = invoices.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);
  const paidInvoice = invoices.filter(invoice => invoice.status === 'PAID').length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Historique des factures</h2>
          <p className="text-sm text-gray-500">Toutes les factures générées et leur statut</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm text-gray-500">Montant total</p>
            <ReceiptText className="h-4 w-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalInvoice.toFixed(2)} DT</div>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm text-gray-500">Factures soldées</p>
            <WalletCards className="h-4 w-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{paidInvoice}</div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une facture..."
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
          <div className="flex items-center justify-center h-48 text-gray-400">Aucune facture trouvée</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-stone-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Référence</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Client</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Statut</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(invoice => (
                  <tr key={invoice.id} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{invoice.reference}</td>
                    <td className="px-4 py-3 text-gray-900">{invoice.customer?.name || 'Client anonyme'}</td>
                    <td className="px-4 py-3 text-gray-600">{new Date(invoice.date).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold ${
                        invoice.status === 'PAID' ? 'bg-green-100 text-green-700' :
                        invoice.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-700' :
                        invoice.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-orange-600">{Number(invoice.total).toFixed(2)} DT</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => openPrintableInvoice(invoice)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-orange-200 bg-orange-50 text-orange-700 text-xs font-semibold hover:bg-orange-100"
                      >
                        <FileText size={14} />
                        Imprimer
                      </button>
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
