
import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@/types";
import { Clock, Check, Bell, User, ChefHat } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export const KitchenScreen = () => {
  const { 
    orders, 
    tables, 
    updateOrderStatus, 
    updateItemCompletionStatus,
    user, 
    hasNewOrders, 
    clearNewOrdersNotification 
  } = useApp();
  const [activeTab, setActiveTab] = useState<"tables" | "items">("tables");
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [preparingOrders, setPreparingOrders] = useState<any[]>([]);
  const [readyOrders, setReadyOrders] = useState<any[]>([]);
  
  // Clear notification when screen is opened
  useEffect(() => {
    clearNewOrdersNotification();
  }, [clearNewOrdersNotification]);
  
  // Filter orders by status
  useEffect(() => {
    const filteredPendingOrders = orders.filter(order => order.status === "pending");
    const filteredPreparingOrders = orders.filter(order => order.status === "preparing");
    const filteredReadyOrders = orders.filter(order => order.status === "ready");
    
    setPendingOrders(filteredPendingOrders);
    setPreparingOrders(filteredPreparingOrders);
    setReadyOrders(filteredReadyOrders);
  }, [orders]);
  
  // If not screen user, redirect or show access denied
  if (user?.role !== 'screen') {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-gray-500">
          هذه الصفحة مخصصة لشاشة المطبخ فقط
        </p>
      </div>
    );
  }
  
  // Handle marking order as delivered
  const handleDelivered = (orderId: string) => {
    updateOrderStatus(orderId, 'delivered');
  };
  
  // Handle update status
  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
  };
  
  // Handle item completion toggling
  const handleItemCompletion = (orderId: string, menuItemId: string, completed: boolean) => {
    updateItemCompletionStatus(orderId, menuItemId, !completed);
  };
  
  // Get all tables with active orders
  const tablesWithOrders = tables.filter(table => 
    table.isOccupied && 
    table.currentOrderId && 
    orders.some(o => 
      o.id === table.currentOrderId && 
      ['pending', 'preparing', 'ready'].includes(o.status)
    )
  );
  
  // Get all in-progress items across all orders
  const allInProgressItems = orders
    .filter(o => ['pending', 'preparing'].includes(o.status))
    .flatMap(order => order.items.map(item => ({
      ...item,
      orderId: order.id,
      tableNumber: order.tableNumber,
      orderStatus: order.status,
      createdAt: order.createdAt
    })))
    .sort((a, b) => {
      // Sort by completion status first, then by creation time
      if ((a.completed || false) === (b.completed || false)) {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return (a.completed || false) ? 1 : -1;
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">شاشة المطبخ</h1>
        <div className="text-lg space-x-4 space-x-reverse">
          <Badge className="bg-yellow-500 text-lg">{pendingOrders.length}</Badge>
          <span className="font-medium">الطلبات المعلقة: </span>
          
          <Badge className="bg-blue-500 text-lg">{preparingOrders.length}</Badge>
          <span className="font-medium">قيد التحضير: </span>
          
          <Badge className="bg-green-500 text-lg">{readyOrders.length}</Badge>
          <span className="font-medium">جاهز للتسليم: </span>
        </div>
      </div>
      
      <Tabs defaultValue="tables" value={activeTab} onValueChange={(v) => setActiveTab(v as "tables" | "items")}>
        <TabsList className="mb-4">
          <TabsTrigger value="tables">الطاولات</TabsTrigger>
          <TabsTrigger value="items">
            قائمة الأطباق
            {hasNewOrders && (
              <Bell className="w-4 h-4 mr-2 text-yellow-500 animate-bounce" />
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tables" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tablesWithOrders.length > 0 ? (
              tablesWithOrders.map((table) => {
                const tableOrder = orders.find(o => o.id === table.currentOrderId);
                if (!tableOrder) return null;
                
                const pendingItems = tableOrder.items.filter(item => !item.completed);
                const completedItems = tableOrder.items.filter(item => item.completed);
                
                return (
                  <Card key={table.id} className={`border-2 ${
                    tableOrder.status === 'ready' ? 'border-green-400' :
                    tableOrder.status === 'preparing' ? 'border-blue-400' : 'border-yellow-400'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h3 className="text-lg font-bold flex items-center gap-2">
                            طاولة {table.name}
                            {table.peopleCount && (
                              <span className="text-sm text-gray-500 flex items-center">
                                <User className="w-3 h-3 mr-1" />{table.peopleCount}
                              </span>
                            )}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>
                              {new Date(tableOrder.createdAt).toLocaleTimeString('ar-SA', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <span>•</span>
                            <span>{tableOrder.waiterName}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={`${
                            tableOrder.status === 'ready' ? 'bg-green-500' :
                            tableOrder.status === 'preparing' ? 'bg-blue-500' : 'bg-yellow-500'
                          }`}>
                            {tableOrder.status === 'pending' ? 'معلق' : 
                            tableOrder.status === 'preparing' ? 'قيد التحضير' : 'جاهز'}
                          </Badge>
                          
                          {tableOrder.status !== 'pending' && tableOrder.items.every(i => i.completed) && (
                            <Button
                              size="sm"
                              onClick={() => handleDelivered(tableOrder.id)}
                              className="bg-restaurant-primary hover:bg-restaurant-primary-dark"
                            >
                              تم التسليم
                            </Button>
                          )}
                          
                          {tableOrder.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(tableOrder.id, 'preparing')}
                              className="bg-blue-500 hover:bg-blue-600"
                            >
                              بدء التحضير
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {pendingItems.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium text-red-500 mb-2">لم يتم الانتهاء:</h4>
                          <div className="space-y-2">
                            {pendingItems.map((item, idx) => (
                              <div key={`${item.menuItemId}-${idx}`} className="flex justify-between items-center p-2 bg-red-50 rounded-md">
                                <div className="flex items-center gap-2">
                                  <span className="text-red-500 font-bold">{item.quantity}×</span>
                                  <span>{item.name}</span>
                                </div>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="border-green-500 text-green-500 hover:bg-green-50"
                                  onClick={() => handleItemCompletion(tableOrder.id, item.menuItemId, item.completed)}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {completedItems.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium text-green-500 mb-2">تم الانتهاء:</h4>
                          <div className="space-y-2">
                            {completedItems.map((item, idx) => (
                              <div key={`${item.menuItemId}-${idx}`} className="flex justify-between items-center p-2 bg-green-50 rounded-md">
                                <div className="flex items-center gap-2">
                                  <span className="text-green-500 font-bold">{item.quantity}×</span>
                                  <span className="line-through text-gray-500">{item.name}</span>
                                </div>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="border-red-500 text-red-500 hover:bg-red-50"
                                  onClick={() => handleItemCompletion(tableOrder.id, item.menuItemId, item.completed)}
                                >
                                  إلغاء
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {tableOrder.notes && (
                        <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                          <span className="font-medium">ملاحظات: </span>
                          {tableOrder.notes}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-3 text-center py-12">
                <ChefHat className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-xl font-medium text-gray-500">لا توجد طاولات نشطة</p>
                <p className="text-gray-400">سيتم عرض الطلبات هنا عندما يقوم النادل بإضافة طلبات جديدة</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="items" className="mt-0">
          <div className="space-y-4">
            <Card className="border-2 border-blue-400">
              <CardContent className="p-4">
                <h3 className="text-lg font-bold mb-4">قائمة جميع الأطباق المطلوب تحضيرها</h3>
                
                {allInProgressItems.length > 0 ? (
                  <div className="space-y-2 divide-y">
                    {allInProgressItems.map((item, idx) => (
                      <div 
                        key={`${item.menuItemId}-${idx}`} 
                        className={cn(
                          "flex justify-between items-center py-3",
                          item.completed ? "opacity-60" : ""
                        )}
                      >
                        <div className="flex-grow">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "font-bold",
                              item.completed ? "text-green-500" : "text-blue-500"
                            )}>
                              {item.quantity}×
                            </span>
                            <span className={item.completed ? "line-through text-gray-500" : ""}>
                              {item.name}
                            </span>
                            {item.notes && (
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {item.notes}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            طاولة {item.tableNumber} • {
                              new Date(item.createdAt).toLocaleTimeString('ar-SA', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            }
                          </div>
                        </div>
                        
                        <Button 
                          size="sm" 
                          variant={item.completed ? "outline" : "default"}
                          className={cn(
                            item.completed 
                              ? "border-red-500 text-red-500 hover:bg-red-50" 
                              : "bg-green-500 hover:bg-green-600"
                          )}
                          onClick={() => handleItemCompletion(item.orderId, item.menuItemId, item.completed)}
                        >
                          {item.completed ? "إلغاء الاكتمال" : "تم الانتهاء"}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ChefHat className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">لا توجد أطباق للتحضير حالياً</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
