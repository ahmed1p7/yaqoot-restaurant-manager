
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  ChefHat, 
  List, 
  User, 
  Settings, 
  FileText, 
  Table,
  Monitor,
  GlassWater
} from "lucide-react";

export const Sidebar = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const isActive = (path: string) => location.pathname === path;
  
  const adminLinks = [
    { name: 'لوحة التحكم', path: '/dashboard', icon: <List className="w-5 h-5" /> },
    { name: 'قائمة الطعام', path: '/menu', icon: <ChefHat className="w-5 h-5" /> },
    { name: 'الطلبات', path: '/orders', icon: <FileText className="w-5 h-5" /> },
    { name: 'الطاولات', path: '/tables', icon: <Table className="w-5 h-5" /> },
    { name: 'المستخدمون', path: '/users', icon: <User className="w-5 h-5" /> },
    { name: 'الإعدادات', path: '/settings', icon: <Settings className="w-5 h-5" /> },
  ];
  
  const waiterLinks = [
    { name: 'الطلبات', path: '/orders', icon: <FileText className="w-5 h-5" /> },
    { name: 'قائمة الطعام', path: '/menu-view', icon: <ChefHat className="w-5 h-5" /> },
    { name: 'الطاولات', path: '/tables', icon: <Table className="w-5 h-5" /> },
  ];
  
  const screenLinks = [
    { name: 'شاشة المطبخ', path: '/kitchen', icon: <Monitor className="w-5 h-5" /> },
    { name: 'الطلبات', path: '/orders', icon: <FileText className="w-5 h-5" /> },
  ];
  
  // Add new drinks user role links
  const drinksLinks = [
    { name: 'شاشة المشروبات', path: '/drinks', icon: <GlassWater className="w-5 h-5" /> },
    { name: 'الطلبات', path: '/orders', icon: <FileText className="w-5 h-5" /> },
  ];
  
  let links = adminLinks;
  
  if (user?.role === 'waiter') {
    links = waiterLinks;
  } else if (user?.role === 'screen') {
    links = screenLinks;
  } else if (user?.role === 'drinks') {
    links = drinksLinks;
  }

  if (isMobile) {
    return (
      <div className="flex justify-around w-full">
        {links.map((link) => (
          <Button
            key={link.path}
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center px-1 py-2 ${
              isActive(link.path) 
                ? 'text-restaurant-primary border-t-2 border-restaurant-primary' 
                : 'text-gray-500'
            }`}
            onClick={() => navigate(link.path)}
          >
            {link.icon}
            <span className="text-xs mt-1">{link.name}</span>
          </Button>
        ))}
      </div>
    );
  }
  
  return (
    <aside className="w-64 bg-white border-r border-gray-200 shadow-sm p-4">
      <nav className="flex flex-col gap-2 mt-4">
        {links.map((link) => (
          <Button
            key={link.path}
            variant={isActive(link.path) ? "default" : "ghost"}
            className={`justify-start ${isActive(link.path) ? 'bg-restaurant-primary text-white' : 'text-gray-700'}`}
            onClick={() => navigate(link.path)}
          >
            <span className="mr-2">{link.icon}</span>
            <span>{link.name}</span>
          </Button>
        ))}
      </nav>
    </aside>
  );
};
