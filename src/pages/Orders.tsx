
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@/types";
import { ChefHat, FileText, Table as TableIcon, Clock, User, Check } from "lucide-react";

const translateStatus = (status: OrderStatus): string => {
  switch (status) {
    case "pending": return "معلق";
    case "preparing": return "قيد التحضير";
    case "ready": return "جاهز";
    case "delivered": return "تم التسليم";
    case "canceled": return "ملغي";
    default: return status;
  }
};

const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case "pending": return "bg-yellow-500";
    case "preparing": return "bg-blue-500";
    case "ready": return "bg-green-500";
    case "delivered": return "bg-restaurant-primary";
    case "canceled": return "bg-red-500";
    default: return "bg-gray-500";
  }
};

export const Orders = () => {
  const { orders, updateOrderStatus, user, updateItemCompletionStatus } = useApp();
  const [activeTab, setActiveTab] = useState<OrderStatus | "all">("all");
  
  const filteredOrders = activeTab === "all"
    ? orders
    : orders.filter((order) => order.status === activeTab);
  
  // For waiters, only show their own orders
  const displayedOrders = user?.role === 'waiter'
    ? filteredOrders.filter(order => order.waiterId === user.id)
    : filteredOrders;
  
  // Sort orders: pending first, then preparing, ready, delivered, cancelled
  const sortedOrders = [...displayedOrders].sort((a, b) => {
    const statusPriority: Record<OrderStatus, number> = {
      pending: 0,
      preparing: 1,
      ready: 2,
      delivered: 3,
      canceled: 4,
    };
    
    // Sort by status first, then by creation time (newest first for same status)
    if (statusPriority[a.status] === statusPriority[b.status]) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return statusPriority[a.status] - statusPriority[b.status];
  });
  
  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
  };
  
  const handleItemCompletion = (orderId: string, menuItemId: string, completed: boolean) => {
    if (user?.role === 'screen') {
      updateItemCompletionStatus(orderId, menuItemId, !completed);
    }
  };
  
  const renderStatusButton = (order: any, newStatus: OrderStatus) => {
    // Screen users can only update to delivered status
    if (user?.role === 'screen') {
      if (newStatus === 'delivered' && order.status === 'ready') {
        return (
          <Button
            size="sm"
            className="bg-restaurant-primary hover:bg-restaurant-primary-dark"
            onClick={() => handleUpdateStatus(order.id, newStatus)}
          >
            تم التسليم
          </Button>
        );
      }
      return null;
    }
    
    // Waiters and admins can update any status
    if ((user?.role === 'admin' || order.waiterId === user?.id)) {
      // Don't show buttons for cancelled or delivered orders
      if (order.status === 'canceled' || order.status === 'delivered') {
        return null;
      }
      
      // Button text based on current and new status
      let buttonText = '';
      let buttonStyle = '';
      
      // Show appropriate next state button based on current state
      switch (order.status) {
        case 'pending':
          if (newStatus === 'preparing') {
            buttonText = 'بدء التحضير';
            buttonStyle = 'bg-blue-500 hover:bg-blue-600';
          } else if (newStatus === 'canceled') {
            buttonText = 'إلغاء الطلب';
            buttonStyle = 'bg-red-500 hover:bg-red-600';
          }
          break;
        case 'preparing':
          if (newStatus === 'ready') {
            buttonText = 'جاهز للتقديم';
            buttonStyle = 'bg-green-500 hover:bg-green-600';
          } else if (newStatus === 'canceled') {
            buttonText = 'إلغاء الطلب';
            buttonStyle = 'bg-red-500 hover:bg-red-600';
          }
          break;
        case 'ready':
          if (newStatus === 'delivered') {
            buttonText = 'تم التسليم';
            buttonStyle = 'bg-restaurant-primary hover:bg-restaurant-primary-dark';
          }
          break;
      }
      
      return buttonText ? (
        <Button
          size="sm"
          className={buttonStyle}
          onClick={() => handleUpdateStatus(order.id, newStatus)}
        >
          {buttonText}
        </Button>
      ) : null;
    }
    
    return null;
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">الطلبات</h1>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as OrderStatus | "all")}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">الكل</TabsTrigger>
          <TabsTrigger value="pending">معلق</TabsTrigger>
          <TabsTrigger value="preparing">قيد التحضير</TabsTrigger>
          <TabsTrigger value="ready">جاهز</TabsTrigger>
          <TabsTrigger value="delivered">تم التسليم</TabsTrigger>
          <TabsTrigger value="canceled">ملغي</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0 space-y-4">
          {sortedOrders.length > 0 ? (
            sortedOrders.map((order) => (
              <Card key={order.id} className={`overflow-hidden ${
                order.status === 'canceled' ? 'opacity-60' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <TableIcon className="w-5 h-5 text-restaurant-primary" />
                        <span className="font-medium">طاولة {order.tableNumber}</span>
                        {order.peopleCount > 0 && (
                          <span className="text-sm text-gray-500 flex items-center">
                            <User className="w-3 h-3 mr-1" />{order.peopleCount}
                          </span>
                        )}
                        <Badge className={getStatusColor(order.status)}>
                          {translateStatus(order.status)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{order.waiterName}</span>
                        <span>•</span>
                        <Clock className="w-4 h-4" />
                        <span>
                          {new Date(order.createdAt).toLocaleTimeString('ar-SA', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {renderStatusButton(order, 'preparing')}
                      {renderStatusButton(order, 'ready')}
                      {renderStatusButton(order, 'delivered')}
                      {renderStatusButton(order, 'canceled')}
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    {order.items.map((item: any, idx: number) => (
                      <div 
                        key={idx} 
                        className={`flex justify-between items-center p-2 rounded-md ${
                          item.completed ? 'bg-green-50' : 'bg-gray-50'
                        }`}
                        onClick={() => user?.role === 'screen' && handleItemCompletion(order.id, item.menuItemId, item.completed)}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${item.completed ? 'text-green-500' : 'text-restaurant-primary'}`}>
                            {item.quantity}×
                          </span>
                          <span className={item.completed ? 'text-gray-500' : ''}>
                            {item.name}
                          </span>
                          {item.notes && (
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {item.notes}
                            </span>
                          )}
                          
                          {item.completed && user?.role === 'screen' && (
                            <Badge className="bg-green-500 ml-2">
                              <Check className="w-3 h-3 mr-1" /> تم التحضير
                            </Badge>
                          )}
                        </div>
                        <span>{item.price * item.quantity} ريال</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex justify-between pt-2 border-t border-gray-100">
                    <span className="font-medium">الإجمالي:</span>
                    <span className="font-bold">{order.totalAmount} ريال</span>
                  </div>
                  
                  {order.notes && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                      <span className="font-medium">ملاحظات: </span>
                      {order.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700">لا توجد طلبات</h3>
              {user?.role === 'waiter' && (
                <p className="text-gray-500 mt-2">
                  يمكنك إنشاء طلب جديد من صفحة الطاولات
                </p>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
