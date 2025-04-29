
import { ReactNode } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useApp } from "@/contexts/AppContext";
import { LoginPage } from "@/pages/LoginPage";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { user } = useApp();
  
  if (!user) {
    return <LoginPage />;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-restaurant-secondary">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
