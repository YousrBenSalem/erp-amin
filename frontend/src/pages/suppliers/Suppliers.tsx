import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Plus, Search, Edit, Trash2, Truck, Loader2, X, Building2 } from 'lucide-react';

export function Suppliers() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editSupplier, setEditSupplier] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    contact: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    country: 'Tunisie',
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  async function loadSuppliers() {
    setLoading(true);
    try {
      const data = await api.suppliers.getAll();
      setSuppliers(data);
    } catch {
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(search.toLowerCase()) ||
    supplier.contact?.toLowerCase().includes(search.toLowerCase()) ||
    supplier.phone?.includes(search)
  );

  function openAdd() {
    setEditSupplier(null);
    setForm({ name: '', contact: '', phone: '', email: '', address: '', city: '', country: 'Tunisie' });
    setError('');
    setShowModal(true);
  }

  function openEdit(supplier: any) {
    setEditSupplier(supplier);
    setForm({
      name: supplier.name || '',
      contact: supplier.contact || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      city: supplier.city || '',
      country: supplier.country || 'Tunisie',
    });
    setError('');
    setShowModal(true);
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      if (editSupplier) {
        await api.suppliers.update(editSupplier.id, form);
      } else {
        await api.suppliers.create(form);
      }
      setShowModal(false);
      await loadSuppliers();
    } catch (e: any) {
      setError(e.message || 'Erreur lors de l’enregistrement');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce fournisseur ?')) return;
    try {
      await api.suppliers.delete(id);
      await loadSuppliers();
    } catch {
      setError('Impossible de supprimer le fournisseur');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Fournisseurs</h2>
          <p className="text-sm text-gray-500">Gestion des fournisseurs et contacts</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 shadow-sm"
        >
          <Plus size={16} /> Nouveau fournisseur
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm text-gray-500">Total fournisseurs</p>
            <Building2 className="h-4 w-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{suppliers.length}</div>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm text-gray-500">À contacter</p>
            <Truck className="h-4 w-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{suppliers.filter(s => s.phone || s.email).length}</div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un fournisseur..."
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
            <p>Aucun fournisseur trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-stone-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Nom</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Contact</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Téléphone</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(supplier => (
                  <tr key={supplier.id} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{supplier.name}</td>
                    <td className="px-4 py-3 text-gray-700">{supplier.contact || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{supplier.phone || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{supplier.email || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEdit(supplier)} className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded transition-colors"><Edit size={15} /></button>
                        <button onClick={() => handleDelete(supplier.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 m-4">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">{editSupplier ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            {error && <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-600 rounded text-sm">{error}</div>}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700">Nom *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Contact</label>
                <input value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Téléphone</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Ville</label>
                <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 outline-none" />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700">Adresse</label>
                <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 outline-none" />
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
              <button onClick={handleSave} disabled={saving || !form.name.trim()} className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2">
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
