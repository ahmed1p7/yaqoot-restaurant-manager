
import { ReactNode, useEffect, useState } from "react";
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
  const { user } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);
  
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
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
      
      // Redirect drinks users to drinks page if they're on the homepage
      if (user.role === 'drinks' && (location.pathname === '/' || location.pathname === '/dashboard')) {
        navigate('/drinks');
      }
    }
  }, [user, location.pathname, navigate]);
  
  if (!user) {
    return <LoginPage />;
  }
  
  // Screen size indicator for development purposes
  const screenSizeIndicator = () => {
    if (process.env.NODE_ENV !== 'production') {
      return (
        <div className="fixed bottom-0 right-0 bg-black/70 text-white px-2 py-1 text-xs z-50 rounded-tl-md">
          {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'} ({window.innerWidth}x{window.innerHeight})
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-restaurant-secondary">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {!isMobile && <Sidebar />}
        <main className={`flex-1 ${isMobile ? 'p-2' : isTablet ? 'p-4' : 'p-6'} overflow-auto`}>
          <div className={`mx-auto ${isDesktop ? 'max-w-6xl' : 'max-w-full'}`}>
            {children}
          </div>
        </main>
      </div>
      {isMobile && (
        <div className="bg-white border-t border-gray-200 p-2">
          <Sidebar />
        </div>
      )}
      {screenSizeIndicator()}
    </div>
  );
};
