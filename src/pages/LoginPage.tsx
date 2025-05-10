
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, User, Monitor, Coffee, KeyRound } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [waiterPin, setWaiterPin] = useState("");
  const [kitchenPin, setKitchenPin] = useState("");
  const [drinksPin, setDrinksPin] = useState("");
  const { login } = useApp();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("admin");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate('/dashboard');
    }
  };

  const handleWaiterPinLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(waiterPin, "0000")) {
      navigate('/tables');
    }
  };

  const handleKitchenLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login("kitchen", kitchenPin)) {
      navigate('/kitchen');
    }
  };
  
  const handleDrinksLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login("drinks", drinksPin)) {
      navigate('/drinks');
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
          <Tabs defaultValue="admin" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <KeyRound className="w-4 h-4" />
                مشرف
              </TabsTrigger>
              <TabsTrigger value="waiter" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                نادل
              </TabsTrigger>
              <TabsTrigger value="screens" className="flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                شاشات
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="admin" className="space-y-4">
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
              </form>
              
              <div className={`text-sm text-center mt-4 text-gray-500 ${isMobile ? 'text-xs' : ''}`}>
                <p>للتجربة، استخدم:</p>
                <p className="font-medium">مدير: admin (كلمة المرور: admin123)</p>
              </div>
            </TabsContent>
            
            <TabsContent value="waiter" className="space-y-4">
              <form onSubmit={handleWaiterPinLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="waiterPin" className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>
                    رقم النادل (مثال: 101)
                  </label>
                  <Input
                    id="waiterPin"
                    type="text"
                    placeholder="أدخل رقم النادل الخاص بك"
                    value={waiterPin}
                    onChange={(e) => setWaiterPin(e.target.value)}
                    className={`w-full ${isMobile ? 'text-sm h-9' : ''} text-center text-lg font-bold`}
                    maxLength={3}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className={`w-full bg-restaurant-primary hover:bg-restaurant-primary-dark ${isMobile ? 'text-sm py-1' : ''}`}
                >
                  <User className="mr-2 h-4 w-4" />
                  تسجيل الدخول كنادل
                </Button>
                
                <div className={`text-sm text-center mt-4 text-gray-500 ${isMobile ? 'text-xs' : ''}`}>
                  <p>للتجربة، استخدم:</p>
                  <p className="font-medium">نادل: 101</p>
                  <p className="font-medium">كلمة المرور تلقائية (0000)</p>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="screens" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h3 className="text-center text-blue-700 mb-3 flex items-center justify-center gap-2">
                    <Monitor className="h-5 w-5" />
                    شاشة المطبخ
                  </h3>
                  
                  <form onSubmit={handleKitchenLogin} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="kitchenPin" className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-center block`}>
                        رمز الدخول
                      </label>
                      <Input
                        id="kitchenPin"
                        type="password"
                        placeholder="أدخل رمز شاشة المطبخ"
                        value={kitchenPin}
                        onChange={(e) => setKitchenPin(e.target.value)}
                        className={`w-full ${isMobile ? 'text-sm h-9' : ''} text-center font-bold`}
                        maxLength={3}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className={`w-full bg-blue-600 hover:bg-blue-700 ${isMobile ? 'text-sm py-1' : ''}`}
                    >
                      دخول كشاشة مطبخ
                    </Button>
                    
                    <p className="text-xs text-center text-gray-500">الرمز للتجربة: 111</p>
                  </form>
                </div>
                
                <div className="border rounded-lg p-4 bg-green-50">
                  <h3 className="text-center text-green-700 mb-3 flex items-center justify-center gap-2">
                    <Coffee className="h-5 w-5" />
                    شاشة المشروبات
                  </h3>
                  
                  <form onSubmit={handleDrinksLogin} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="drinksPin" className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-center block`}>
                        رمز الدخول
                      </label>
                      <Input
                        id="drinksPin"
                        type="password"
                        placeholder="أدخل رمز شاشة المشروبات"
                        value={drinksPin}
                        onChange={(e) => setDrinksPin(e.target.value)}
                        className={`w-full ${isMobile ? 'text-sm h-9' : ''} text-center font-bold`}
                        maxLength={3}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className={`w-full bg-green-600 hover:bg-green-700 ${isMobile ? 'text-sm py-1' : ''}`}
                    >
                      دخول كشاشة مشروبات
                    </Button>
                    
                    <p className="text-xs text-center text-gray-500">الرمز للتجربة: 222</p>
                  </form>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
