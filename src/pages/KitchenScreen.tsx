
import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@/types";
import { Clock, Check } from "lucide-react";

export const KitchenScreen = () => {
  const { orders, updateOrderStatus, user } = useApp();
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [preparingOrders, setPreparingOrders] = useState<any[]>([]);
  
  // Only screen showing pending and preparing orders
  useEffect(() => {
    const filteredPendingOrders = orders.filter(order => order.status === "pending");
    const filteredPreparingOrders = orders.filter(order => order.status === "preparing");
    
    setPendingOrders(filteredPendingOrders);
    setPreparingOrders(filteredPreparingOrders);
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
  
  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">شاشة المطبخ</h1>
        <div className="text-lg">
          <span className="font-medium">الطلبات المعلقة: </span>
          <Badge className="bg-yellow-500 text-lg">{pendingOrders.length}</Badge>
          <span className="font-medium mr-4">قيد التحضير: </span>
          <Badge className="bg-blue-500 text-lg">{preparingOrders.length}</Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <h2 className="text-xl font-medium bg-yellow-100 p-2 rounded-md">الطلبات المعلقة</h2>
          {pendingOrders.length > 0 ? (
            pendingOrders.map((order) => (
              <Card key={order.id} className="border-2 border-yellow-400 overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h3 className="text-lg font-bold">طاولة {order.tableNumber}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>
                          {new Date(order.createdAt).toLocaleTimeString('ar-SA', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span>•</span>
                        <span>{order.waiterName}</span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleUpdateStatus(order.id, 'preparing')}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      بدء التحضير
                    </Button>
                  </div>
                  
                  <div className="mt-4 space-y-2 divide-y divide-gray-100">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="pt-2 pb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-500 font-bold">
                            {item.quantity}×
                          </span>
                          <span className="font-medium">{item.name}</span>
                        </div>
                        {item.notes && (
                          <div className="mt-1 text-sm bg-gray-50 p-1 rounded">
                            {item.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {order.notes && (
                    <div className="mt-3 p-2 bg-yellow-50 rounded text-sm">
                      <span className="font-medium">ملاحظات: </span>
                      {order.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-md">
              <p className="text-gray-500">لا توجد طلبات معلقة</p>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-medium bg-blue-100 p-2 rounded-md">قيد التحضير</h2>
          {preparingOrders.length > 0 ? (
            preparingOrders.map((order) => (
              <Card key={order.id} className="border-2 border-blue-400 overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h3 className="text-lg font-bold">طاولة {order.tableNumber}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>
                          {new Date(order.createdAt).toLocaleTimeString('ar-SA', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span>•</span>
                        <span>{order.waiterName}</span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleUpdateStatus(order.id, 'ready')}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <Check className="mr-1 w-4 h-4" />
                      تم الانتهاء
                    </Button>
                  </div>
                  
                  <div className="mt-4 space-y-2 divide-y divide-gray-100">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="pt-2 pb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-500 font-bold">
                            {item.quantity}×
                          </span>
                          <span className="font-medium">{item.name}</span>
                        </div>
                        {item.notes && (
                          <div className="mt-1 text-sm bg-gray-50 p-1 rounded">
                            {item.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {order.notes && (
                    <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                      <span className="font-medium">ملاحظات: </span>
                      {order.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-md">
              <p className="text-gray-500">لا توجد طلبات قيد التحضير</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
