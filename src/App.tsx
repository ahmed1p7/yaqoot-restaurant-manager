
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import { MainLayout } from "./components/layout/MainLayout";
import { Dashboard } from "./pages/Dashboard";
import { MenuManagement } from "./pages/MenuManagement";
import { MenuView } from "./pages/MenuView";
import { Orders } from "./pages/Orders";
import { Tables } from "./pages/Tables";
import { Users } from "./pages/Users";
import { Settings } from "./pages/Settings";
import { KitchenScreen } from "./pages/KitchenScreen";
import { DrinksScreen } from "./pages/DrinksScreen";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/menu" element={<MenuManagement />} />
              <Route path="/menu-view" element={<MenuView />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/tables" element={<Tables />} />
              <Route path="/users" element={<Users />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/kitchen" element={<KitchenScreen />} />
              <Route path="/drinks" element={<DrinksScreen />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MainLayout>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
