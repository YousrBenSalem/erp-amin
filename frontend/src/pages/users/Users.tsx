import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Loader2, Plus, Search, Edit, Trash2, Shield, X } from 'lucide-react';

const emptyForm = { name: '', email: '', password: '', role: 'SELLER' };

export function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await api.users.getAll();
      setUsers(data);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingUser(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(user: any) {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.email.trim()) return;
    setSaving(true);
    try {
      if (editingUser) {
        await api.users.update(editingUser.id, form);
      } else {
        await api.users.create(form);
      }
      setShowModal(false);
      await loadUsers();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    try {
      await api.users.delete(id);
      await loadUsers();
    } catch {}
  }

  const filtered = users.filter(user =>
    user.name?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase()) ||
    user.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Utilisateurs</h2>
          <p className="text-sm text-gray-500">Gestion de l’accès et des rôles</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600">
          <Plus size={16} /> Nouvel utilisateur
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm">
        <div className="p-4 border-b flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-gray-200 bg-stone-50 pl-9 pr-4 text-sm focus:border-orange-400 outline-none"
              placeholder="Rechercher un utilisateur..."
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="animate-spin text-orange-500" size={32} /></div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-gray-400">Aucun utilisateur trouvé</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-stone-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Nom</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Rôle</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">{user.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(user)} className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded">
                          <Edit size={15} />
                        </button>
                        <button onClick={() => handleDelete(user.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded">
                          <Trash2 size={15} />
                        </button>
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 m-4">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">{editingUser ? 'Modifier l’utilisateur' : 'Nouvel utilisateur'}</h3>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Nom</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 outline-none" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 outline-none" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Mot de passe {editingUser ? '(laisser vide pour garder)' : ''}</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 outline-none" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Rôle</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 outline-none">
                  <option value="ADMIN">ADMIN</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="SELLER">SELLER</option>
                  <option value="CASHIER">CASHIER</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Annuler</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600 disabled:opacity-50">
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
