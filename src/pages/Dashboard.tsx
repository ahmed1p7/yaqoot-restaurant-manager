
import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderStatus } from "@/types";
import { ChefHat, FileText, Clock, User } from "lucide-react";

// Simple chart component for this demo
const SimpleBarChart = ({ data }: { data: { name: string; value: number }[] }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div className="flex flex-col gap-2 mt-4">
      {data.map((item) => (
        <div key={item.name} className="flex items-center gap-2">
          <div className="w-24 truncate">{item.name}</div>
          <div className="flex-1 bg-gray-100 h-6 rounded-md overflow-hidden">
            <div
              className="bg-restaurant-primary h-full rounded-md"
              style={{
                width: `${(item.value / maxValue) * 100}%`
              }}
            />
          </div>
          <div className="w-10 text-right">{item.value}</div>
        </div>
      ))}
    </div>
  );
};

export const Dashboard = () => {
  const { orders, menuItems } = useApp();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    preparingOrders: 0,
    topItems: [] as { name: string; value: number }[]
  });
  
  useEffect(() => {
    // Calculate dashboard stats
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const preparingOrders = orders.filter(order => order.status === 'preparing').length;
    
    // Calculate top selling items
    const itemCountMap = new Map<string, number>();
    orders.forEach(order => {
      order.items.forEach(item => {
        const currentCount = itemCountMap.get(item.menuItemId) || 0;
        itemCountMap.set(item.menuItemId, currentCount + item.quantity);
      });
    });
    
    const topItems = Array.from(itemCountMap.entries())
      .map(([menuItemId, count]) => {
        const menuItem = menuItems.find(item => item.id === menuItemId);
        return {
          name: menuItem?.name || 'غير معروف',
          value: count
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    
    setStats({
      totalOrders,
      totalRevenue,
      pendingOrders,
      preparingOrders,
      topItems
    });
  }, [orders, menuItems]);
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">لوحة التحكم</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="dashboard-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-restaurant-primary" />
              <span>إجمالي الطلبات</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalOrders}</p>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-restaurant-primary" />
              <span>طلبات معلقة</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.pendingOrders}</p>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-restaurant-primary" />
              <span>قيد التحضير</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.preparingOrders}</p>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-restaurant-primary" />
              <span>الإيرادات</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalRevenue} ريال</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>الأطباق الأكثر مبيعاً</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topItems.length > 0 ? (
              <SimpleBarChart data={stats.topItems} />
            ) : (
              <p className="text-gray-500 text-center py-4">لا توجد بيانات كافية</p>
            )}
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>حالة الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(['pending', 'preparing', 'ready', 'delivered', 'cancelled'] as OrderStatus[]).map((status) => {
                const count = orders.filter(order => order.status === status).length;
                const percentage = orders.length ? Math.round((count / orders.length) * 100) : 0;
                
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{
                        status === 'pending' ? 'معلق' : 
                        status === 'preparing' ? 'قيد التحضير' : 
                        status === 'ready' ? 'جاهز' : 
                        status === 'delivered' ? 'تم التسليم' : 'ملغي'
                      }</span>
                      <span>{count}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded">
                      <div
                        className={`h-full rounded ${
                          status === 'pending' ? 'bg-yellow-500' :
                          status === 'preparing' ? 'bg-blue-500' :
                          status === 'ready' ? 'bg-green-500' :
                          status === 'delivered' ? 'bg-restaurant-primary' : 'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
