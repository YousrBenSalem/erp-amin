import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Users, Plus, Search, Edit, Trash2, Loader2, X, CreditCard } from 'lucide-react';

const emptyForm = {
  name: '',
  company: '',
  phone: '',
  email: '',
  address: '',
  type: 'RETAIL',
  creditLimit: 0,
  notes: '',
};

export function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadCustomers(); }, []);

  async function loadCustomers() {
    setLoading(true);
    try {
      const data = await api.customers.getAll();
      setCustomers(data);
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.company?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  function openCreate() {
    setEditingCustomer(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(customer: any) {
    setEditingCustomer(customer);
    setForm({
      name: customer.name || '',
      company: customer.company || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      type: customer.type || 'RETAIL',
      creditLimit: Number(customer.creditLimit || 0),
      notes: customer.notes || '',
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editingCustomer) {
        await api.customers.update(editingCustomer.id, form);
      } else {
        await api.customers.create(form);
      }
      setShowModal(false);
      await loadCustomers();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce client ?')) return;
    try {
      await api.customers.delete(id);
      await loadCustomers();
    } catch {
      // ignore for now
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clients</h2>
          <p className="text-sm text-gray-500">{customers.length} clients enregistrés</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 shadow-sm">
          <Plus size={16} /> Nouveau client
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm">
        <div className="p-4 border-b flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input className="h-9 w-full rounded-lg border border-gray-200 bg-stone-50 pl-9 pr-4 text-sm focus:border-orange-400 outline-none"
              placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? <div className="h-48 flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" size={32} /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-stone-50">
                  {['Nom', 'Société', 'Téléphone', 'Type', 'Solde', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                    <td className="px-4 py-3 text-gray-500">{c.company || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{c.phone || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.type === 'WHOLESALE' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                        {c.type === 'WHOLESALE' ? 'Gros' : 'Détail'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {Number(c.balance || 0) > 0 ? (
                        <span className="flex items-center gap-1 text-red-600 font-semibold text-xs">
                          <CreditCard size={12} /> {Number(c.balance).toFixed(2)} DT
                        </span>
                      ) : <span className="text-green-600 text-xs">Soldé</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded"><Edit size={15} /></button>
                        <button onClick={() => handleDelete(c.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <Users size={48} className="mb-2 text-gray-200" /> <p>Aucun client trouvé</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 m-4">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">{editingCustomer ? 'Modifier le client' : 'Nouveau client'}</h3>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700">Nom *</label>
                <input className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Société</label>
                <input className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 outline-none" value={form.company} onChange={e => setForm({...form, company: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Téléphone</label>
                <input className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 outline-none" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input type="email" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 outline-none" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Type</label>
                <select className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 outline-none" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option value="RETAIL">Détail</option>
                  <option value="WHOLESALE">Gros</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Limite crédit (DT)</label>
                <input type="number" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 outline-none" value={form.creditLimit} onChange={e => setForm({...form, creditLimit: +e.target.value})} />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700">Adresse</label>
                <input className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 outline-none" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2">
                {saving && <Loader2 className="animate-spin" size={14} />}
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
