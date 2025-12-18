
import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, StatCard } from "@/components/shared";
import { OrderStatus } from "@/types";
import { 
  ChefHat, FileText, Clock, DollarSign, TrendingUp, 
  Users, Coffee, LayoutDashboard, ArrowUpRight, Sparkles
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useDeviceType } from "@/hooks/use-mobile";

const SimpleBarChart = ({ data }: { data: { name: string; value: number }[] }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div className="flex flex-col gap-3 mt-4">
      {data.map((item, index) => (
        <div key={item.name} className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
            {index + 1}
          </span>
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium truncate">{item.name}</span>
              <span className="text-sm font-bold text-primary">{item.value}</span>
            </div>
            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full gradient-primary transition-all duration-500"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
    pending: { label: 'معلق', className: 'bg-warning/10 text-warning border-warning/30' },
    preparing: { label: 'قيد التحضير', className: 'bg-info/10 text-info border-info/30' },
    ready: { label: 'جاهز', className: 'bg-success/10 text-success border-success/30' },
    delivered: { label: 'تم التسليم', className: 'bg-muted text-muted-foreground border-border' },
    canceled: { label: 'ملغي', className: 'bg-destructive/10 text-destructive border-destructive/30' },
    completed: { label: 'مكتمل', className: 'bg-success/10 text-success border-success/30' }
  };
  
  const config = statusConfig[status];
  
  return (
    <Badge variant="outline" className={`${config.className} font-medium`}>
      {config.label}
    </Badge>
  );
};

export const Dashboard = () => {
  const { orders, menuItems } = useApp();
  const { isMobile } = useDeviceType();
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
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const preparingOrders = orders.filter(order => order.status === 'preparing').length;
    
    const activeCustomers = orders
      .filter(order => ['pending', 'preparing', 'ready'].includes(order.status))
      .reduce((sum, order) => sum + (order.peopleCount || 0), 0);
    
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    
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
        return { name: menuItem?.name || 'غير معروف', value: count };
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
  
  const statusData = (['pending', 'preparing', 'ready', 'delivered', 'canceled'] as OrderStatus[]).map(status => {
    const count = orders.filter(order => order.status === status).length;
    const percentage = orders.length ? Math.round((count / orders.length) * 100) : 0;
    return { status, count, percentage };
  });
  
  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="لوحة التحكم"
        subtitle={new Date().toLocaleDateString('ar-SA', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
        icon={LayoutDashboard}
      />
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title="إجمالي الطلبات"
          value={stats.totalOrders}
          icon={FileText}
          variant="primary"
        />
        <StatCard
          title="طلبات معلقة"
          value={stats.pendingOrders}
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="العملاء النشطين"
          value={stats.activeCustomers}
          icon={Users}
          variant="info"
        />
        <StatCard
          title="الإيرادات"
          value={`${stats.totalRevenue} ريال`}
          icon={DollarSign}
          variant="success"
        />
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders Overview */}
        <Card className="sea-card lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary-foreground" />
              </div>
              <span>نظرة عامة على الطلبات</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Progress Bars */}
            <div className="space-y-4">
              {statusData.map(({ status, count, percentage }) => {
                const statusLabels: Record<OrderStatus, string> = {
                  pending: 'معلق',
                  preparing: 'قيد التحضير',
                  ready: 'جاهز',
                  delivered: 'تم التسليم',
                  canceled: 'ملغي',
                  completed: 'مكتمل'
                };
                
                const statusColors: Record<OrderStatus, string> = {
                  pending: 'bg-warning',
                  preparing: 'bg-info',
                  ready: 'bg-success',
                  delivered: 'bg-primary',
                  canceled: 'bg-destructive',
                  completed: 'bg-success'
                };
                
                return (
                  <div key={status} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{statusLabels[status]}</span>
                      <span className="text-muted-foreground">{percentage}% ({count})</span>
                    </div>
                    <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${statusColors[status]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Recent Orders */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-secondary" />
                  أحدث الطلبات
                </h3>
              </div>
              <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">رقم الطلب</TableHead>
                      <TableHead className="font-semibold">الطاولة</TableHead>
                      <TableHead className="font-semibold">المبلغ</TableHead>
                      <TableHead className="font-semibold">الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.slice(0, 5).map((order) => (
                      <TableRow key={order.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">
                          <span className="text-primary">#{order.id.slice(-4)}</span>
                        </TableCell>
                        <TableCell>طاولة {order.tableNumber}</TableCell>
                        <TableCell className="font-semibold">{order.totalAmount} ريال</TableCell>
                        <TableCell>
                          <StatusBadge status={order.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Side Panel */}
        <div className="space-y-6">
          {/* Top Items */}
          <Card className="sea-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
                  <Coffee className="h-5 w-5 text-foreground" />
                </div>
                <span>الأطباق الأكثر مبيعاً</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.topItems.length > 0 ? (
                <SimpleBarChart data={stats.topItems} />
              ) : (
                <p className="text-muted-foreground text-center py-8">لا توجد بيانات كافية</p>
              )}
            </CardContent>
          </Card>
          
          {/* Quick Stats */}
          <Card className="sea-card">
            <CardContent className="p-6 space-y-4">
              <div className="sea-card p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">متوسط قيمة الطلب</p>
                  <p className="text-2xl font-bold">{stats.avgOrderValue} ريال</p>
                </div>
              </div>
              
              <div className="sea-card p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">طلبات قيد التحضير</p>
                  <p className="text-2xl font-bold">{stats.preparingOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
