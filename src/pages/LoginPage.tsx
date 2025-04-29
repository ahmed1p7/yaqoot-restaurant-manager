
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat } from "lucide-react";

export const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useApp();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(username, password);
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-restaurant-secondary p-4">
      <Card className="max-w-md w-full shadow-xl border-t-4 border-t-restaurant-primary animate-fade-in">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="bg-restaurant-primary p-3 rounded-full inline-flex mb-4">
            <ChefHat className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-center">نظام إدارة المطعم</CardTitle>
          <p className="text-center text-muted-foreground">أدخل بيانات تسجيل الدخول</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                اسم المستخدم
              </label>
              <Input
                id="username"
                type="text"
                placeholder="أدخل اسم المستخدم"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                كلمة المرور
              </label>
              <Input
                id="password"
                type="password"
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
            </div>
            <Button type="submit" className="w-full bg-restaurant-primary hover:bg-restaurant-primary-dark">
              تسجيل الدخول
            </Button>
            
            <div className="text-sm text-center mt-4 text-gray-500">
              <p>للتجربة، استخدم:</p>
              <p className="font-medium">مدير: admin (بدون كلمة مرور)</p>
              <p className="font-medium">نادل: waiter1 (بدون كلمة مرور)</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
