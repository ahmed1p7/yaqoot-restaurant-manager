
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { 
  ChefHat, 
  List, 
  User, 
  Settings, 
  FileText, 
  Table 
} from "lucide-react";

export const Sidebar = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  
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
  
  const links = user?.role === 'admin' ? adminLinks : waiterLinks;
  
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
