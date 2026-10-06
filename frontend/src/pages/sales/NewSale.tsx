import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Search, ShoppingCart, Trash2, Loader2, CheckCircle } from 'lucide-react';
import { openPrintableInvoice } from '../../lib/invoicePrinter';

interface CartItem { product: any; qty: number; price: number; discount: number; }

export function NewSale() {
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [saleType, setSaleType] = useState<'RETAIL' | 'WHOLESALE'>('RETAIL');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.products.getAll(), api.customers.getAll()]).then(([prods, custs]) => {
      setProducts(prods);
      setCustomers(custs);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Auto switch type when customer selected
  useEffect(() => {
    if (selectedCustomer) setSaleType(selectedCustomer.type === 'WHOLESALE' ? 'WHOLESALE' : 'RETAIL');
  }, [selectedCustomer]);

  const getPrice = (product: any) => saleType === 'WHOLESALE' ? product.prixVenteGros : product.prixVenteDetail;

  const addToCart = (product: any) => {
    const existing = cart.find(i => i.product.id === product.id);
    if (existing) {
      setCart(cart.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, { product, qty: 1, price: getPrice(product), discount: 0 }]);
    }
  };

  const updateCart = (id: string, field: string, value: number) => {
    setCart(cart.map(i => i.product.id === id ? { ...i, [field]: value } : i));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.qty * item.price * (1 - item.discount / 100), 0);
  const total = subtotal;

  const handleSubmit = async () => {
    if (cart.length === 0) { setError('Panier vide'); return; }
    setSaving(true); setError('');
    try {
      const currentPaidAmount = paymentMethod === 'CREDIT' ? paidAmount : Math.min(Number(paidAmount || total), total);

      const result = await api.sales.create({
        type: saleType,
        customerId: selectedCustomer?.id,
        subtotal,
        discount: 0, tax: 0, total,
        paidAmount: currentPaidAmount || total,
        paymentMethod,
        paymentDate,
        items: cart.map(i => ({ productId: i.product.id, quantity: i.qty, price: i.price, discount: i.discount })),
      });

      const invoiceToPrint = {
        ...result.invoice,
        customer: selectedCustomer,
        sale: {
          ...result.sale,
          items: cart.map(item => ({
            ...item,
            product: item.product,
            quantity: item.qty,
            price: item.price,
            subtotal: item.qty * item.price * (1 - item.discount / 100),
          })),
        },
      };

      setSuccess(`Vente créée ! Facture: ${result.invoice?.reference}`);
      openPrintableInvoice(invoiceToPrint);
      setCart([]);
      setPaidAmount(0);
      setTimeout(() => setSuccess(''), 4000);
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la vente');
    }
    setSaving(false);
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.reference?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-orange-500" size={32} /></div>;

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-100px)]">
      {/* Left: Product Search */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 bg-white text-sm focus:border-orange-400 outline-none"
              placeholder="Rechercher un produit (nom, code)..."
              value={search} onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <select
            className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm font-medium focus:border-orange-400 outline-none"
            value={saleType} onChange={e => setSaleType(e.target.value as any)}
          >
            <option value="RETAIL">Vente Détail</option>
            <option value="WHOLESALE">Vente Gros</option>
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto pb-2">
          {filtered.map(p => (
            <button key={p.id} onClick={() => addToCart(p)}
              disabled={p.stockActuel <= 0}
              className={`text-left p-3 bg-white rounded-xl border hover:border-orange-400 hover:shadow-md transition-all disabled:opacity-40 ${p.stockActuel <= 0 ? 'cursor-not-allowed' : ''}`}
            >
              <p className="text-[10px] text-gray-400 font-mono">{p.reference}</p>
              <p className="font-semibold text-gray-900 text-sm mt-0.5 truncate">{p.name}</p>
              <div className="flex justify-between items-end mt-3">
                <span className="text-orange-600 font-bold">{Number(getPrice(p)).toFixed(2)} DT</span>
                <span className={`text-xs ${p.stockActuel <= p.stockMinimum ? 'text-yellow-600' : 'text-gray-400'}`}>
                  {p.stockActuel} {p.unit}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-full lg:w-96 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
        <div className="p-4 border-b flex items-center gap-2">
          <ShoppingCart className="text-orange-500" size={20} />
          <h2 className="font-bold text-gray-900">Caisse</h2>
          <span className="ml-auto bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">{cart.length}</span>
        </div>

        {/* Customer */}
        <div className="px-4 pt-3 pb-2 border-b">
          <select
            className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:border-orange-400 outline-none"
            value={selectedCustomer?.id || ''}
            onChange={e => setSelectedCustomer(customers.find(c => c.id === e.target.value) || null)}
          >
            <option value="">Client anonyme</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name} {c.type === 'WHOLESALE' ? '(Gros)' : ''}</option>
            ))}
          </select>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm flex-col gap-2">
              <ShoppingCart size={40} className="text-gray-200" />
              <span>Cliquez sur un produit pour l'ajouter</span>
            </div>
          ) : cart.map(item => (
            <div key={item.product.id} className="bg-stone-50 rounded-lg p-3">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-800 flex-1">{item.product.name}</span>
                <button onClick={() => setCart(cart.filter(i => i.product.id !== item.product.id))} className="text-gray-300 hover:text-red-500 ml-2">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number" min="0.1" step="0.1" value={item.qty}
                  onChange={e => updateCart(item.product.id, 'qty', +e.target.value)}
                  className="w-16 h-7 text-center border border-gray-200 rounded text-sm"
                />
                <span className="text-xs text-gray-400">x {Number(item.price).toFixed(2)} DT</span>
                <span className="ml-auto text-sm font-bold text-orange-600">
                  {(item.qty * item.price * (1 - item.discount / 100)).toFixed(2)} DT
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="p-4 border-t bg-stone-50 rounded-b-xl space-y-2">
          {error && <div className="p-2 bg-red-50 border border-red-200 text-red-600 rounded text-xs">{error}</div>}
          {success && <div className="p-2 bg-green-50 border border-green-200 text-green-700 rounded text-xs flex items-center gap-1"><CheckCircle size={14}/>{success}</div>}

          <div className="flex justify-between text-sm text-gray-600"><span>Sous-total</span><span>{subtotal.toFixed(2)} DT</span></div>
          <div className="flex justify-between font-bold text-lg"><span>Total</span><span className="text-orange-600">{total.toFixed(2)} DT</span></div>

          <select
            className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:border-orange-400 outline-none mt-2"
            value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
          >
            <option value="CASH">Espèces</option>
            <option value="CARD">Carte bancaire</option>
            <option value="TRANSFER">Virement</option>
            <option value="CHECK">Chèque</option>
            <option value="CREDIT">Crédit</option>
          </select>

          {paymentMethod === 'CREDIT' && (
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-600">Montant payé maintenant (DT)</label>
                <input
                  type="number" step="0.01" value={paidAmount}
                  onChange={e => setPaidAmount(+e.target.value)}
                  className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm mt-1"
                  max={total}
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Date du règlement</label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={e => setPaymentDate(e.target.value)}
                  className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm mt-1"
                />
              </div>
              <p className="text-xs text-orange-600">Reste: {(total - paidAmount).toFixed(2)} DT en crédit</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={cart.length === 0 || saving}
            className="w-full h-11 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 mt-1"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : null}
            {saving ? 'Traitement...' : 'VALIDER LA VENTE'}
          </button>
        </div>
      </div>
    </div>
  );
}
