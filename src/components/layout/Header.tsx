
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { ChefHat, Monitor } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export const Header = () => {
  const { user, logout } = useApp();
  const isMobile = useIsMobile();

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'مدير';
      case 'waiter': return 'نادل';
      case 'screen': return 'شاشة مطبخ';
      default: return role;
    }
  };

  const getHeaderIcon = () => {
    if (user?.role === 'screen') {
      return <Monitor className={`${isMobile ? 'h-6 w-6 mr-1' : 'h-8 w-8 mr-2'} text-white`} />;
    }
    return <ChefHat className={`${isMobile ? 'h-6 w-6 mr-1' : 'h-8 w-8 mr-2'} text-white`} />;
  };

  // تعديل تصميم الشريط العلوي لشاشة المطبخ
  if (user?.role === 'screen') {
    return (
      <header className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center">
          <ChefHat className={`${isMobile ? 'h-6 w-6 mr-1' : 'h-8 w-8 mr-2'} text-white`} />
          <h1 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold`}>
            نظام المطبخ
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          {!isMobile && (
            <span className="font-medium">مرحباً، {user.name}</span>
          )}
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"}
            onClick={logout}
            className={`text-white border-white hover:bg-opacity-20 hover:bg-white ${isMobile ? 'text-xs px-2' : ''}`}
          >
            {isMobile ? 'خروج' : 'تسجيل الخروج'}
          </Button>
        </div>
      </header>
    );
  }

  // الاحتفاظ بالشريط العلوي الأصلي للأدوار الأخرى
  return (
    <header className={`${user?.role === 'screen' ? 'bg-blue-600' : 'bg-restaurant-primary'} text-white p-4 flex justify-between items-center shadow-md`}>
      <div className="flex items-center">
        {getHeaderIcon()}
        <h1 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold`}>
          {user?.role === 'screen' ? 'شاشة المطبخ' : 'نظام إدارة المطعم'}
        </h1>
      </div>
      
      {user && (
        <div className="flex items-center gap-2">
          {!isMobile && (
            <>
              <span className="font-medium">مرحباً، {user.name}</span>
              <span className={`text-xs ${user.role === 'screen' ? 'bg-blue-400' : 'bg-restaurant-accent'} text-white px-2 py-1 rounded-full`}>
                {getRoleLabel(user.role)}
              </span>
            </>
          )}
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"}
            onClick={logout}
            className={`text-white border-white hover:bg-opacity-20 hover:bg-white ${isMobile ? 'text-xs px-2' : ''}`}
          >
            {isMobile ? 'خروج' : 'تسجيل الخروج'}
          </Button>
        </div>
      )}
    </header>
  );
};
