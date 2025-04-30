
import { ReactNode, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useApp } from "@/contexts/AppContext";
import { LoginPage } from "@/pages/LoginPage";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, loginAsScreen } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (user) {
      // Redirect waiters to tables page if they're on the homepage
      if (user.role === 'waiter' && (location.pathname === '/' || location.pathname === '/dashboard')) {
        navigate('/tables');
      }
      
      // Redirect screen users to kitchen page if they're on the homepage
      if (user.role === 'screen' && (location.pathname === '/' || location.pathname === '/dashboard')) {
        navigate('/kitchen');
      }
    }
  }, [user, location.pathname, navigate]);
  
  // Auto login for screen role if path is /kitchen
  useEffect(() => {
    if (!user && location.pathname === '/kitchen') {
      loginAsScreen();
    }
  }, [user, location.pathname, loginAsScreen]);
  
  if (!user) {
    return <LoginPage />;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-restaurant-secondary">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {!isMobile && <Sidebar />}
        <main className={`flex-1 ${isMobile ? 'p-2' : 'p-6'} overflow-auto`}>
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      {isMobile && (
        <div className="bg-white border-t border-gray-200 p-2">
          <Sidebar />
        </div>
      )}
    </div>
  );
};
