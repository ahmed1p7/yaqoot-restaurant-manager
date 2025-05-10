
import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderStatus } from "@/types";
import { ChefHat, FileText, Clock, DollarSign, PieChart, TrendingUp, Users, Coffee } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeviceType } from "@/hooks/use-mobile";

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
  const { isMobile, isTablet } = useDeviceType();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    preparingOrders: 0,
    activeCustomers: 0,
    avgOrderValue: 0,
    topItems: [] as { name: string; value: number }[]
  });
  
  useEffect(() => {
    // Calculate dashboard stats
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const preparingOrders = orders.filter(order => order.status === 'preparing').length;
    
    // Calculate active customers (sum of people count from active orders)
    const activeCustomers = orders
      .filter(order => ['pending', 'preparing', 'ready'].includes(order.status))
      .reduce((sum, order) => sum + (order.peopleCount || 0), 0);
    
    // Average order value
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    
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
      activeCustomers,
      avgOrderValue,
      topItems
    });
  }, [orders, menuItems]);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <span className="text-sm text-gray-500">{new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="dashboard-card shadow-md hover:shadow-lg transition-shadow border-t-4 border-t-restaurant-primary">
          <CardContent className="p-4 flex flex-col items-center">
            <div className="mb-2 rounded-full bg-restaurant-primary/10 p-3">
              <FileText className="w-6 h-6 text-restaurant-primary" />
            </div>
            <h3 className="text-lg font-medium">إجمالي الطلبات</h3>
            <p className="text-3xl font-bold mt-1">{stats.totalOrders}</p>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card shadow-md hover:shadow-lg transition-shadow border-t-4 border-t-yellow-500">
          <CardContent className="p-4 flex flex-col items-center">
            <div className="mb-2 rounded-full bg-yellow-500/10 p-3">
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
            <h3 className="text-lg font-medium">طلبات معلقة</h3>
            <p className="text-3xl font-bold mt-1">{stats.pendingOrders}</p>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card shadow-md hover:shadow-lg transition-shadow border-t-4 border-t-blue-500">
          <CardContent className="p-4 flex flex-col items-center">
            <div className="mb-2 rounded-full bg-blue-500/10 p-3">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium">العملاء النشطين</h3>
            <p className="text-3xl font-bold mt-1">{stats.activeCustomers}</p>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card shadow-md hover:shadow-lg transition-shadow border-t-4 border-t-green-500">
          <CardContent className="p-4 flex flex-col items-center">
            <div className="mb-2 rounded-full bg-green-500/10 p-3">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-lg font-medium">الإيرادات</h3>
            <p className="text-3xl font-bold mt-1">{stats.totalRevenue} ريال</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="dashboard-card shadow-md col-span-1 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-restaurant-primary" />
              <span>نظرة عامة</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
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
                      <span className="text-gray-500">{percentage}% ({count})</span>
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
            
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">أحدث الطلبات</h3>
              </div>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>رقم الطلب</TableHead>
                      <TableHead>الطاولة</TableHead>
                      <TableHead>المبلغ</TableHead>
                      <TableHead>الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.slice(0, 5).map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id.slice(-4)}</TableCell>
                        <TableCell>{order.tableNumber}</TableCell>
                        <TableCell>{order.totalAmount} ريال</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'ready' ? 'bg-green-100 text-green-800' :
                            order.status === 'delivered' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {
                              order.status === 'pending' ? 'معلق' : 
                              order.status === 'preparing' ? 'قيد التحضير' : 
                              order.status === 'ready' ? 'جاهز' : 
                              order.status === 'delivered' ? 'تم التسليم' : 'ملغي'
                            }
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Coffee className="h-5 w-5 text-restaurant-primary" />
              <span>الأطباق الأكثر مبيعاً</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {stats.topItems.length > 0 ? (
              <SimpleBarChart data={stats.topItems} />
            ) : (
              <p className="text-gray-500 text-center py-4">لا توجد بيانات كافية</p>
            )}
            
            <div className="mt-6 flex flex-col gap-3">
              <div className="rounded-lg border p-4 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">متوسط قيمة الطلب</h4>
                    <p className="text-xl font-bold">{stats.avgOrderValue} ريال</p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg border p-4 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <ChefHat className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">طلبات قيد التحضير</h4>
                    <p className="text-xl font-bold">{stats.preparingOrders}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
