import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { NewSale } from "./pages/sales/NewSale";
import { Products } from "./pages/products/Products";
import { Dashboard } from "./pages/dashboard/Dashboard";
import { Customers } from "./pages/customers/Customers";
import { CustomerCredits } from "./pages/customers/CustomerCredits";
import { LoginPage } from "./pages/auth/LoginPage";
import { Categories } from "./pages/categories/Categories";
import { Stock } from "./pages/stock/Stock";
import { StockMovements } from "./pages/stock/StockMovements";
import { SalesHistory } from "./pages/sales/SalesHistory";
import { InvoicesHistory } from "./pages/invoices/InvoicesHistory";
import { Purchases } from "./pages/purchases/Purchases";
import { NewPurchase } from "./pages/purchases/NewPurchase";
import { Suppliers } from "./pages/suppliers/Suppliers";
import { Payments } from "./pages/payments/Payments";
import { Reports } from "./pages/reports/Reports";
import { Activity } from "./pages/activity/Activity";
import { Users } from "./pages/users/Users";
import { Settings } from "./pages/settings/Settings";
import { useAuth } from "./contexts/AuthContext";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="animate-spin text-orange-500" size={40} />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="animate-spin text-orange-500" size={40} />
      </div>
    );
  }
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <div className="bg-white border border-gray-100 rounded-xl p-12 text-center text-gray-400 shadow-sm">
        <p className="text-lg">Interface en cours de développement...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="stock" element={<Stock />} />
          <Route path="stock/all" element={<Stock />} />
          <Route path="stock/movements" element={<StockMovements />} />
          <Route path="sales" element={<SalesHistory />} />
          <Route path="sales/all" element={<SalesHistory />} />
          <Route path="sales/new" element={<NewSale />} />
          <Route path="invoices" element={<InvoicesHistory />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="purchases/all" element={<Purchases />} />
          <Route path="purchases/new" element={<NewPurchase />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/all" element={<Customers />} />
          <Route path="credits" element={<CustomerCredits />} />
          <Route path="payments" element={<Payments />} />
          <Route path="reports" element={<Reports />} />
          <Route path="activity" element={<Activity />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
