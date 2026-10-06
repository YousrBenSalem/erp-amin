import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Loader2, Save, Building2 } from 'lucide-react';

export function Settings() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      const data = await api.settings.get();
      setSettings(data || {});
    } catch {
      setSettings({});
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const { id, createdAt, updatedAt, ...payload } = settings;
      await api.settings.update(payload);
      await loadSettings();
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-orange-500" size={32} /></div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Paramètres</h2>
        <p className="text-sm text-gray-500">Informations de la société et règles de gestion</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
            <Building2 size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Profil de l’entreprise</h3>
            <p className="text-sm text-gray-500">Configurez les informations visibles dans le système</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-gray-700">Nom société</label>
            <input value={settings.companyName || ''} onChange={e => setSettings({ ...settings, companyName: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 outline-none" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Devise</label>
            <input value={settings.currency || 'DT'} onChange={e => setSettings({ ...settings, currency: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 outline-none" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Téléphone</label>
            <input value={settings.phone || ''} onChange={e => setSettings({ ...settings, phone: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 outline-none" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input type="email" value={settings.email || ''} onChange={e => setSettings({ ...settings, email: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 outline-none" />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Adresse</label>
            <input value={settings.address || ''} onChange={e => setSettings({ ...settings, address: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 outline-none" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Taux de taxe (%)</label>
            <input type="number" value={settings.taxRate || 0} onChange={e => setSettings({ ...settings, taxRate: Number(e.target.value) })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 outline-none" />
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input type="checkbox" checked={Boolean(settings.allowNegativeStock)} onChange={e => setSettings({ ...settings, allowNegativeStock: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
              Autoriser stock négatif
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600 disabled:opacity-50">
            {saving && <Loader2 className="animate-spin" size={14} />}
            <Save size={16} /> Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
