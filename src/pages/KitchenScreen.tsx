
import { useState, useEffect, useRef } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@/types";
import { 
  Clock, Check, Bell, User, ChefHat, 
  AlertTriangle, X, AlarmClock, 
  MessageCircle, Printer
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const KitchenScreen = () => {
  const { 
    orders, 
    tables, 
    updateOrderStatus, 
    updateItemCompletionStatus,
    user, 
    hasNewOrders, 
    clearNewOrdersNotification,
    delayOrder,
    cancelOrderItem
  } = useApp();
  const [activeTab, setActiveTab] = useState<"tables" | "items">("tables");
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [preparingOrders, setPreparingOrders] = useState<any[]>([]);
  const [readyOrders, setReadyOrders] = useState<any[]>([]);
  const [delayedOrders, setDelayedOrders] = useState<any[]>([]);
  const [isDelayDialogOpen, setIsDelayDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [delayReason, setDelayReason] = useState("");
  const [notificationSound] = useState<HTMLAudioElement | null>(
    typeof Audio !== "undefined" ? new Audio("/notification.mp3") : null
  );
  const blinkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  
  // Clear notification when screen is opened
  useEffect(() => {
    clearNewOrdersNotification();
  }, [clearNewOrdersNotification]);
  
  // Filter orders by status and check for delays
  useEffect(() => {
    const currentTime = new Date();
    const DELAY_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes
    
    const filtered = {
      pending: [] as any[],
      preparing: [] as any[],
      ready: [] as any[],
      delayed: [] as any[]
    };
    
    orders.forEach(order => {
      // Check if order is delayed (created more than 30 minutes ago)
      const orderTime = new Date(order.createdAt);
      const timeDiff = currentTime.getTime() - orderTime.getTime();
      const isDelayed = timeDiff > DELAY_THRESHOLD_MS;
      
      if (isDelayed && (order.status === "pending" || order.status === "preparing")) {
        filtered.delayed.push({...order, timeSinceCreation: timeDiff});
      }
      
      if (order.status === "pending") {
        filtered.pending.push(order);
      } else if (order.status === "preparing") {
        filtered.preparing.push(order);
      } else if (order.status === "ready") {
        filtered.ready.push(order);
      }
    });
    
    setPendingOrders(filtered.pending);
    setPreparingOrders(filtered.preparing);
    setReadyOrders(filtered.ready);
    setDelayedOrders(filtered.delayed);
    
    // Play notification sound when new orders arrive
    if (hasNewOrders && notificationSound) {
      notificationSound.play().catch(e => console.log("Audio playback failed:", e));
    }
    
    // Clean up interval
    return () => {
      if (blinkIntervalRef.current) {
        clearInterval(blinkIntervalRef.current);
      }
    };
  }, [orders, hasNewOrders, notificationSound]);
  
  // If not screen user, redirect to login
  useEffect(() => {
    if (user && user.role !== 'screen') {
      navigate('/');
    }
  }, [user, navigate]);
  
  // If not screen user, show access denied
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

  // Handle item cancellation
  const handleCancelItem = (orderId: string, menuItemId: string) => {
    cancelOrderItem(orderId, menuItemId);
  };
  
  // Handle delay order
  const handleDelayOrder = () => {
    if (selectedOrderId) {
      delayOrder(selectedOrderId, delayReason || "تأخير من المطبخ");
      setIsDelayDialogOpen(false);
      setDelayReason("");
      setSelectedOrderId(null);
      toast.success("تم تأجيل الطلب وإرسال إشعار للنادل");
    }
  };
  
  const openDelayDialog = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsDelayDialogOpen(true);
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
      createdAt: order.createdAt,
      isDelayed: new Date().getTime() - new Date(order.createdAt).getTime() > 30 * 60 * 1000
    })))
    .sort((a, b) => {
      // Sort by delay status first
      if (a.isDelayed !== b.isDelayed) {
        return a.isDelayed ? -1 : 1;
      }
      // Then by completion status
      if ((a.completed || false) === (b.completed || false)) {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return (a.completed || false) ? 1 : -1;
    });

  // Format time difference
  const formatTimeDiff = (dateStr: Date | string) => {
    const orderTime = new Date(dateStr);
    const currentTime = new Date();
    const diffMs = currentTime.getTime() - orderTime.getTime();
    
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours} س ${minutes % 60} د`;
    }
    return `${minutes} د`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ChefHat className="w-6 h-6" />
          شاشة المطبخ
        </h1>
        <div className="flex gap-4 items-center">
          {hasNewOrders && (
            <div className="animate-bounce bg-yellow-500 text-white p-2 rounded-full flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <span>طلبات جديدة!</span>
            </div>
          )}
          <div className="flex gap-2">
            {delayedOrders.length > 0 && (
              <Badge className="bg-red-500 text-lg flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {delayedOrders.length} متأخر
              </Badge>
            )}
            <Badge className="bg-yellow-500 text-lg">{pendingOrders.length}</Badge>
            <span className="font-medium">معلقة:</span>
            
            <Badge className="bg-blue-500 text-lg">{preparingOrders.length}</Badge>
            <span className="font-medium">قيد التحضير:</span>
            
            <Badge className="bg-green-500 text-lg">{readyOrders.length}</Badge>
            <span className="font-medium">جاهزة:</span>
          </div>
        </div>
      </div>
      
      {delayedOrders.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
          <h2 className="text-red-600 font-bold flex items-center gap-2 mb-2">
            <AlarmClock className="w-5 h-5" />
            طلبات متأخرة ({delayedOrders.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {delayedOrders.map(order => (
              <div key={order.id} className="flex justify-between items-center p-2 bg-white rounded border-r-4 border-red-500">
                <div>
                  <div className="font-medium">طاولة {order.tableNumber}</div>
                  <div className="text-sm text-gray-500">
                    منذ {formatTimeDiff(order.createdAt)} • {order.items.length} عناصر
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="text-red-500 border-red-200"
                    onClick={() => openDelayDialog(order.id)}
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    تأجيل
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <Tabs defaultValue="tables" value={activeTab} onValueChange={(v) => setActiveTab(v as "tables" | "items")}>
        <TabsList className="mb-4">
          <TabsTrigger value="tables" className="flex items-center gap-1">
            <AlarmClock className="w-4 h-4" />
            الطاولات
          </TabsTrigger>
          <TabsTrigger value="items" className="flex items-center gap-1">
            <ChefHat className="w-4 h-4" />
            قائمة الأطباق
            {hasNewOrders && (
              <Bell className="w-4 h-4 text-yellow-500 animate-bounce" />
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
                const isDelayed = new Date().getTime() - new Date(tableOrder.createdAt).getTime() > 30 * 60 * 1000;
                
                return (
                  <Card 
                    key={table.id} 
                    className={`border-2 ${
                      isDelayed ? 'border-red-400 animate-pulse' :
                      tableOrder.status === 'ready' ? 'border-green-400' :
                      tableOrder.status === 'preparing' ? 'border-blue-400' : 'border-yellow-400'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h3 className="text-lg font-bold flex items-center gap-2">
                            طاولة {table.name}
                            {tableOrder.peopleCount && tableOrder.peopleCount > 0 && (
                              <span className="text-sm text-gray-500 flex items-center">
                                <User className="w-3 h-3 mr-1" />{tableOrder.peopleCount}
                              </span>
                            )}
                            {tableOrder.delayed && (
                              <Badge variant="destructive" className="animate-pulse">متأخر</Badge>
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
                            <span>{formatTimeDiff(tableOrder.createdAt)}</span>
                            <span>•</span>
                            <span>{tableOrder.waiterName}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={`${
                            isDelayed ? 'bg-red-500' :
                            tableOrder.status === 'ready' ? 'bg-green-500' :
                            tableOrder.status === 'preparing' ? 'bg-blue-500' : 'bg-yellow-500'
                          }`}>
                            {tableOrder.status === 'pending' ? 'معلق' : 
                            tableOrder.status === 'preparing' ? 'قيد التحضير' : 'جاهز'}
                          </Badge>
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
                                  {item.notes && (
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                      {item.notes}
                                    </span>
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="border-green-500 text-green-500 hover:bg-green-50"
                                    onClick={() => handleItemCompletion(tableOrder.id, item.menuItemId, item.completed)}
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="border-red-500 text-red-500 hover:bg-red-50"
                                    onClick={() => handleCancelItem(tableOrder.id, item.menuItemId)}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
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
                      
                      {tableOrder.delayed && tableOrder.delayReason && (
                        <div className="mt-3 p-2 bg-red-50 rounded text-sm border-r-2 border-red-500">
                          <span className="font-medium text-red-600">سبب التأخير: </span>
                          {tableOrder.delayReason}
                        </div>
                      )}
                    </CardContent>
                    
                    <CardFooter className="flex justify-between bg-gray-50 p-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-500 border-red-200"
                        onClick={() => openDelayDialog(tableOrder.id)}
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        تأجيل
                      </Button>
                      
                      <div>
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
                    </CardFooter>
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
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <ChefHat className="w-5 h-5" />
                  قائمة جميع الأطباق المطلوب تحضيرها
                </h3>
                
                {allInProgressItems.length > 0 ? (
                  <div className="space-y-2 divide-y">
                    {allInProgressItems.map((item, idx) => (
                      <div 
                        key={`${item.menuItemId}-${idx}`} 
                        className={cn(
                          "flex justify-between items-center py-3",
                          item.completed ? "opacity-60" : "",
                          item.isDelayed ? "bg-red-50 p-2 rounded-md border-r-2 border-red-500" : ""
                        )}
                      >
                        <div className="flex-grow">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "font-bold",
                              item.completed ? "text-green-500" : item.isDelayed ? "text-red-500" : "text-blue-500"
                            )}>
                              {item.quantity}×
                            </span>
                            <span className={item.completed ? "line-through text-gray-500" : ""}>
                              {item.name}
                            </span>
                            {item.isDelayed && (
                              <Badge variant="destructive" className="animate-pulse">
                                متأخر {formatTimeDiff(item.createdAt)}
                              </Badge>
                            )}
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
                        
                        <div className="flex gap-1">
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
                          
                          {!item.completed && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-red-500 text-red-500 hover:bg-red-50"
                              onClick={() => handleCancelItem(item.orderId, item.menuItemId)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
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
      
      {/* Delay Order Dialog */}
      <Dialog open={isDelayDialogOpen} onOpenChange={setIsDelayDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تأجيل الطلب</DialogTitle>
            <DialogDescription>
              أدخل سبب تأجيل الطلب ليتم إبلاغ النادل
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Textarea 
              placeholder="سبب التأجيل... (مثال: نفاذ بعض المكونات)"
              value={delayReason}
              onChange={(e) => setDelayReason(e.target.value)}
              className="min-h-[100px]"
            />
            
            <p className="text-sm text-gray-500">
              سيظهر هذا السبب للنادل المسؤول عن الطلب
            </p>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDelayDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleDelayOrder}
              className="bg-restaurant-primary"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              إرسال
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
