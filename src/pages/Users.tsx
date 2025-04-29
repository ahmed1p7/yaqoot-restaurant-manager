
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User as UserIcon } from "lucide-react";

export const Users = () => {
  const { user } = useApp();
  
  // In a real app, users would be fetched from an API
  // For this demo, we're using our mock data
  const users = [
    {
      id: '1',
      username: 'admin',
      name: 'محمد المدير',
      role: 'admin',
      email: 'admin@example.com',
      department: 'الإدارة',
      access: ['الطلبات', 'المستخدمين', 'القائمة', 'الإعدادات']
    },
    {
      id: '2',
      username: 'waiter1',
      name: 'أحمد النادل',
      role: 'waiter',
      email: 'waiter1@example.com',
      department: 'خدمة الطاولات',
      access: ['الطلبات', 'القائمة']
    },
    {
      id: '3',
      username: 'waiter2',
      name: 'خالد النادل',
      role: 'waiter',
      email: 'waiter2@example.com',
      department: 'خدمة الطاولات',
      access: ['الطلبات', 'القائمة']
    }
  ];
  
  // Only admins can see this page
  if (user?.role !== 'admin') {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-gray-500">
          ليس لديك صلاحية للوصول إلى هذه الصفحة
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
        <Button className="bg-restaurant-primary hover:bg-restaurant-primary-dark">
          <span className="mr-2">+</span> إضافة مستخدم
        </Button>
      </div>
      
      <div className="space-y-4">
        {users.map((user) => (
          <Card key={user.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-100 p-3 rounded-full">
                    <UserIcon className="w-6 h-6 text-gray-500" />
                  </div>
                  
                  <div>
                    <h3 className="font-medium">{user.name}</h3>
                    <div className="text-sm text-gray-500">
                      <span>{user.email}</span>
                      <span className="mx-2">•</span>
                      <span>{user.username}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 ml-auto">
                  <Badge className={user.role === 'admin' ? 'bg-restaurant-primary' : 'bg-blue-500'}>
                    {user.role === 'admin' ? 'مدير' : 'نادل'}
                  </Badge>
                  <span className="text-sm text-gray-500">{user.department}</span>
                  
                  <div className="ml-4 flex gap-2">
                    <Button variant="outline" size="sm">
                      تعديل
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50">
                      حذف
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-100">
                <h4 className="text-sm font-medium mb-2">الصلاحيات:</h4>
                <div className="flex flex-wrap gap-2">
                  {user.access.map((item, idx) => (
                    <Badge key={idx} variant="outline" className="bg-gray-50">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
