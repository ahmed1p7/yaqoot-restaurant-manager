
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { ChefHat, Monitor } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import seaLogo from "@/assets/sea-logo.jpg";

export const Header = () => {
  const { user, logout } = useApp();
  const isMobile = useIsMobile();

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'مدير';
      case 'waiter': return 'نادل';
      case 'screen': return 'شاشة مطبخ';
      case 'drinks': return 'شاشة مشروبات';
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
      <header className="bg-primary border-b border-secondary/20 p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <img src={seaLogo} alt="SEA" className="h-10 w-10 rounded-full object-cover shadow-lg" />
          <div>
            <h1 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-primary-foreground`}>
              SEA Kitchen
            </h1>
            {!isMobile && <p className="text-xs text-secondary">نظام المطبخ</p>}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!isMobile && (
            <span className="font-medium text-secondary">مرحباً، {user.name}</span>
          )}
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"}
            onClick={logout}
            className={`bg-secondary text-primary hover:bg-secondary/90 border-secondary ${isMobile ? 'text-xs px-2' : ''}`}
          >
            {isMobile ? 'خروج' : 'تسجيل الخروج'}
          </Button>
        </div>
      </header>
    );
  }

  // الاحتفاظ بالشريط العلوي الأصلي للأدوار الأخرى
  return (
    <header className="bg-primary border-b border-secondary/20 p-4 flex justify-between items-center shadow-md">
      <div className="flex items-center gap-3">
        <img src={seaLogo} alt="SEA" className={`${isMobile ? 'h-10 w-10' : 'h-12 w-12'} rounded-full object-cover shadow-lg`} />
        <div>
          <h1 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-primary-foreground`}>
            {user?.role === 'drinks' ? 'SEA Drinks' : 'SEA Restaurant'}
          </h1>
          {!isMobile && <p className="text-sm text-secondary">نكهة البحر الأصيلة</p>}
        </div>
      </div>
      
      {user && (
        <div className="flex items-center gap-2">
          {!isMobile && (
            <>
              <span className="font-medium text-secondary">مرحباً، {user.name}</span>
              <span className="text-xs bg-secondary text-primary px-2 py-1 rounded-full font-medium">
                {getRoleLabel(user.role)}
              </span>
            </>
          )}
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"}
            onClick={logout}
            className={`bg-secondary text-primary hover:bg-secondary/90 border-secondary ${isMobile ? 'text-xs px-2' : ''}`}
          >
            {isMobile ? 'خروج' : 'تسجيل الخروج'}
          </Button>
        </div>
      )}
    </header>
  );
};
