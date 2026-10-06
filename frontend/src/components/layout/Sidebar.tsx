import { useState } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Package, Archive, ShoppingCart, Users, Truck,
  Wallet, FileText, Settings, Shield, ChevronDown, ChevronRight,
  Menu, X, Activity, CreditCard, BarChart3, Leaf
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface NavItem {
  name: string;
  to?: string;
  icon: React.ReactNode;
  children?: { name: string; to: string }[];
}

const navItems: NavItem[] = [
  { name: "Dashboard", to: "/", icon: <LayoutDashboard size={18} /> },
  {
    name: "Produits", icon: <Package size={18} />,
    children: [
      { name: "Tous les produits", to: "/products" },
      { name: "Catégories", to: "/categories" },
    ]
  },
  {
    name: "Stock", icon: <Archive size={18} />,
    children: [
      { name: "État du stock", to: "/stock/all" },
      { name: "Mouvements", to: "/stock/movements" },
    ]
  },
  {
    name: "Ventes", icon: <ShoppingCart size={18} />,
    children: [
      { name: "Nouvelle vente", to: "/sales/new" },
      { name: "Toutes les ventes", to: "/sales/all" },
      { name: "Factures", to: "/invoices" },
    ]
  },
  {
    name: "Achats", icon: <Truck size={18} />,
    children: [
      { name: "Nouvel achat", to: "/purchases/new" },
      { name: "Commandes", to: "/purchases/all" },
      { name: "Fournisseurs", to: "/suppliers" },
    ]
  },
  {
    name: "Clients", icon: <Users size={18} />,
    children: [
      { name: "Tous les clients", to: "/customers/all" },
      { name: "Crédits clients", to: "/credits" },
    ]
  },
  { name: "Paiements", to: "/payments", icon: <Wallet size={18} /> },
  { name: "Rapports", to: "/reports", icon: <BarChart3 size={18} /> },
  { name: "Activité", to: "/activity", icon: <Activity size={18} /> },
  { name: "Utilisateurs", to: "/users", icon: <Shield size={18} /> },
  { name: "Paramètres", to: "/settings", icon: <Settings size={18} /> },
];

function NavItemComp({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-orange-50 hover:text-orange-700 transition-colors"
        >
          <span className="flex items-center gap-2">{item.icon} {item.name}</span>
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {open && (
          <div className="ml-6 mt-1 space-y-1 border-l-2 border-orange-100 pl-3">
            {item.children.map(child => (
              <NavLink
                key={child.to}
                to={child.to}
                className={({ isActive }) => cn(
                  "block text-sm py-1.5 px-2 rounded transition-colors",
                  isActive ? "text-orange-600 font-semibold bg-orange-50" : "text-stone-500 hover:text-orange-600"
                )}
              >
                {child.name}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.to!}
      end={item.to === '/'}
      className={({ isActive }) => cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
        isActive
          ? "bg-orange-500 text-white shadow-sm font-medium"
          : "text-stone-600 hover:bg-orange-50 hover:text-orange-700"
      )}
    >
      {item.icon} {item.name}
    </NavLink>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-orange-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-sm">
            <Leaf className="text-white" size={18} />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg leading-none">AMIN</h1>
            <p className="text-[10px] text-orange-500 font-medium">Dépôt d'épices</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(item => <NavItemComp key={item.name} item={item} />)}
      </nav>

      <div className="p-3 border-t border-orange-100">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
            <span className="text-orange-600 font-bold text-sm">{user?.name?.charAt(0) || 'A'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'Admin'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.role || 'ADMIN'}</p>
          </div>
          <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors text-xs">
            Quitter
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="w-64 bg-white border-r border-orange-100 hidden md:flex flex-col shadow-sm min-h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="w-64 bg-white shadow-xl flex flex-col">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  );
}
