
import { ReactNode, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useApp } from "@/contexts/AppContext";
import { LoginPage } from "@/pages/LoginPage";
import { useDeviceType, useScreenSize, getDeviceTypeString } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { user } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile, isTablet, isDesktop } = useDeviceType();
  const screenSize = useScreenSize();
  
  useEffect(() => {
    if (user) {
      if (user.role === 'waiter' && (location.pathname === '/' || location.pathname === '/dashboard')) {
        navigate('/tables');
      }
      if (user.role === 'screen' && (location.pathname === '/' || location.pathname === '/dashboard')) {
        navigate('/kitchen');
      }
      if (user.role === 'drinks' && (location.pathname === '/' || location.pathname === '/dashboard')) {
        navigate('/drinks');
      }
    }
  }, [user, location.pathname, navigate]);
  
  if (!user) {
    return <LoginPage />;
  }
  
  const screenSizeIndicator = () => {
    if (process.env.NODE_ENV !== 'production') {
      return (
        <div className="fixed bottom-2 left-2 bg-foreground/80 text-background px-2 py-1 text-xs z-50 rounded-lg font-mono">
          {getDeviceTypeString()} ({screenSize.width}×{screenSize.height})
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {!isMobile && <Sidebar />}
        <main className={cn(
          "flex-1 overflow-auto",
          isMobile ? 'p-4' : isTablet ? 'p-6' : 'p-8'
        )}>
          <div className={cn(
            "mx-auto",
            isDesktop ? 'max-w-7xl' : 'max-w-full'
          )}>
            {children}
          </div>
        </main>
      </div>
      {isMobile && (
        <div className="bg-card border-t border-border p-2 shadow-lg">
          <Sidebar />
        </div>
      )}
      {screenSizeIndicator()}
    </div>
  );
};
