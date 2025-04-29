
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { ChefHat } from "lucide-react";

export const Header = () => {
  const { user, logout } = useApp();

  return (
    <header className="bg-restaurant-primary text-white p-4 flex justify-between items-center shadow-md">
      <div className="flex items-center">
        <ChefHat className="h-8 w-8 mr-2" />
        <h1 className="text-xl font-bold">نظام إدارة المطعم</h1>
      </div>
      
      {user && (
        <div className="flex items-center gap-4">
          <span className="font-medium">مرحباً، {user.name}</span>
          <span className="text-xs bg-restaurant-accent text-restaurant-dark px-2 py-1 rounded-full">
            {user.role === 'admin' ? 'مدير' : 'نادل'}
          </span>
          <Button 
            variant="outline" 
            onClick={logout}
            className="text-white border-white hover:bg-restaurant-primary-dark"
          >
            تسجيل الخروج
          </Button>
        </div>
      )}
    </header>
  );
};
