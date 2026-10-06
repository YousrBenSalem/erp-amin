import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Search, Bell, User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export function Layout() {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-stone-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-orange-100 flex items-center justify-between px-6 shadow-sm z-10 flex-shrink-0">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher produits, clients, factures..."
              className="h-9 w-72 rounded-lg border border-gray-200 bg-stone-50 pl-9 pr-4 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-gray-100">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                <User size={14} className="text-white" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-800">{user?.name || 'Admin'}</p>
                <p className="text-[10px] text-gray-400">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
