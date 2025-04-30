
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, User, Monitor } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";

export const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, loginAsWaiter, loginAsScreen } = useApp();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate('/dashboard');
    }
  };

  const handleWaiterLogin = () => {
    if (loginAsWaiter()) {
      navigate('/tables');
    }
  };
  
  const handleScreenLogin = () => {
    if (loginAsScreen()) {
      navigate('/kitchen');
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-restaurant-secondary p-4">
      <Card className={`max-w-md w-full shadow-xl border-t-4 border-t-restaurant-primary animate-fade-in ${isMobile ? 'p-2' : ''}`}>
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="bg-restaurant-primary p-3 rounded-full inline-flex mb-4">
            <ChefHat className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-white`} />
          </div>
          <CardTitle className={`${isMobile ? 'text-xl' : 'text-2xl'} text-center`}>نظام إدارة المطعم</CardTitle>
          <p className={`text-center text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>أدخل بيانات تسجيل الدخول</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>
                اسم المستخدم
              </label>
              <Input
                id="username"
                type="text"
                placeholder="أدخل اسم المستخدم"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full ${isMobile ? 'text-sm h-9' : ''}`}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>
                كلمة المرور
              </label>
              <Input
                id="password"
                type="password"
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full ${isMobile ? 'text-sm h-9' : ''}`}
              />
            </div>
            <Button 
              type="submit" 
              className={`w-full bg-restaurant-primary hover:bg-restaurant-primary-dark ${isMobile ? 'text-sm py-1' : ''}`}
            >
              تسجيل الدخول كمشرف
            </Button>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">أو</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button 
                type="button" 
                onClick={handleWaiterLogin}
                variant="outline"
                className={`w-full border-restaurant-primary text-restaurant-primary hover:bg-restaurant-primary hover:text-white ${isMobile ? 'text-sm py-1' : ''}`}
              >
                <User className="mr-2 h-4 w-4" />
                دخول كنادل
              </Button>
              
              <Button 
                type="button" 
                onClick={handleScreenLogin}
                variant="outline"
                className={`w-full border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white ${isMobile ? 'text-sm py-1' : ''}`}
              >
                <Monitor className="mr-2 h-4 w-4" />
                دخول كشاشة مطبخ
              </Button>
            </div>
            
            <div className={`text-sm text-center mt-4 text-gray-500 ${isMobile ? 'text-xs' : ''}`}>
              <p>للتجربة، استخدم:</p>
              <p className="font-medium">مدير: admin (كلمة المرور: admin123)</p>
              <p className="font-medium">نادل/شاشة: يمكن الدخول مباشرة بالضغط على الأزرار</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
