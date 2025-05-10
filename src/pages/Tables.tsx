import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { TableActions } from "@/components/tables/TableActions";
import { PaymentDialog } from "@/components/tables/PaymentDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; 
import { User, Search, Table as TableIcon, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { Order } from "@/types";

export const Tables = () => {
  const { tables, orders, user, menuItems, getMostOrderedItems, getOrdersByTable, resetTable, markTableAsPaid } = useApp();
  const navigate = useNavigate();
  
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCloseDayDialog, setShowCloseDayDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedTableForPayment, setSelectedTableForPayment] = useState<number | null>(null);
  
  // Calculate daily statistics for admin
  const calculateDailyStatistics = () => {
    // Get all completed orders for the day (in a real app, this would filter by date)
    const completedOrders = orders.filter(order => order.isPaid);
    
    // Total revenue
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    // Total customers
    const totalCustomers = completedOrders.reduce((sum, order) => sum + (order.peopleCount || 1), 0);
    
    // Total tables served
    const tablesServed = new Set(completedOrders.map(order => order.tableNumber)).size;
    
    // Average order value
    const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
    
    return {
      totalRevenue,
      totalCustomers,
      tablesServed,
      ordersCount: completedOrders.length,
      avgOrderValue
    };
  };
  
  // Filter tables based on search query
  const filteredTables = tables
    .filter(table => table.name.includes(searchQuery))
    .sort((a, b) => {
      // Sort by reservation status first, then by occupation, then by table number
      if (a.isReserved !== b.isReserved) {
        return a.isReserved ? -1 : 1;
      }
      if (a.isOccupied !== b.isOccupied) {
        return a.isOccupied ? -1 : 1;
      }
      return a.id - b.id;
    });
  
  // Get current order for a table
  const getCurrentOrder = (tableId: number): Order | undefined => {
    const table = tables.find(t => t.id === tableId);
    if (!table?.currentOrderId) return undefined;
    
    return orders.find(o => o.id === table.currentOrderId);
  };
  
  const handleCreateOrder = (tableId: number) => {
    // Check if the table has a completed order (isPaid) and reset it first
    const currentOrder = getCurrentOrder(tableId);
    if (currentOrder?.isPaid) {
      resetTable(tableId);
      toast.success(`تم إعادة تهيئة الطاولة ${tableId} للاستخدام`);
    }
    
    // Navigate to the menu view page with table ID as a parameter
    navigate(`/menu-view?table=${tableId}`);
  };
  
  const handleViewTable = (tableId: number) => {
    // Navigate to menu view page to see and edit orders
    navigate(`/menu-view?table=${tableId}`);
  };
  
  const handleCloseDay = () => {
    // In a real app, this would mark all tables as available, close all open orders, etc.
    setShowCloseDayDialog(true);
  };

  const handleConfirmCloseDay = () => {
    // Reset all tables
    tables.forEach(table => {
      if (table.isOccupied) {
        resetTable(table.id);
      }
    });
    
    toast.success("تم إغلاق اليوم بنجاح", {
      description: "تم تصفير جميع الطاولات وإرسال التقرير"
    });
    setShowCloseDayDialog(false);
  };
  
  const handlePaymentClick = (tableId: number) => {
    setSelectedTableForPayment(tableId);
    setShowPaymentDialog(true);
  };
  
  const handleConfirmPayment = (method: 'cash' | 'card', discount: number) => {
    // In a real app, we would track the payment method and discount
    if (selectedTableForPayment) {
      markTableAsPaid(selectedTableForPayment);
      
      // After payment is processed, clear the table for reuse
      resetTable(selectedTableForPayment);
      toast.success(`تم إعادة تهيئة الطاولة ${selectedTableForPayment} للاستخدام`);
    }
    setShowPaymentDialog(false);
    setSelectedTableForPayment(null);
  };

  // Get the order for the selected payment table
  const selectedPaymentOrder = selectedTableForPayment ? getCurrentOrder(selectedTableForPayment) : undefined;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">الطاولات</h1>
        
        <div className="flex items-center gap-2">
          {/* Admin-only buttons */}
          {user?.role === 'admin' && (
            <Button 
              onClick={handleCloseDay} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              <DollarSign className="h-4 w-4 mr-1" />
              إغلاق اليوم
            </Button>
          )}
          
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              className="pl-2 pr-8 w-[200px]"
              placeholder="بحث عن طاولة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Tables grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredTables.map((table) => {
          const currentOrder = getCurrentOrder(table.id);
          const isPaid = currentOrder?.isPaid;
          
          return (
            <Card 
              key={table.id} 
              className={`
                ${table.isReserved ? 'border-purple-300' :
                  table.isOccupied && !isPaid ? 'border-blue-300' : 'border-gray-200'}
                hover:border-2 transition-all cursor-pointer
              `}
              onClick={() => user?.role === 'admin' ? setSelectedTable(table.id) : handleViewTable(table.id)}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium flex items-center gap-1">
                    <TableIcon className="h-4 w-4" />
                    {table.name}
                    {table.isReserved && (
                      <Badge className="bg-purple-500 text-xs px-2 py-0.5 rounded ml-2">
                        محجوزة
                      </Badge>
                    )}
                    {table.isOccupied && !isPaid && (
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded ml-2">
                        مشغولة
                      </Badge>
                    )}
                    {isPaid && (
                      <Badge variant="outline" className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded ml-2">
                        مدفوعة
                      </Badge>
                    )}
                  </h3>
                  
                  <span className="text-sm text-gray-500">
                    سعة {table.capacity}
                  </span>
                </div>
                
                <TableActions
                  table={table}
                  currentOrder={currentOrder}
                  onCreateOrder={handleCreateOrder}
                  isAdmin={user?.role === 'admin'}
                />
                
                {/* Show price info only for admin */}
                {user?.role === 'admin' && currentOrder && (
                  <div className="border-t pt-2 mt-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span>المبلغ:</span>
                      <span className="font-medium">{currentOrder.totalAmount} ريال</span>
                    </div>
                    {currentOrder.peopleCount && currentOrder.peopleCount > 1 && (
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>المتوسط للشخص:</span>
                        <span>{(currentOrder.totalAmount / currentOrder.peopleCount).toFixed(2)} ريال</span>
                      </div>
                    )}
                    
                    {/* Admin-only payment button */}
                    {!currentOrder.isPaid && (
                      <Button 
                        className="w-full mt-2 bg-green-600 hover:bg-green-700"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePaymentClick(table.id);
                        }}
                      >
                        تسجيل حساب وتحصيل
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Close Day Dialog with Statistics */}
      <Dialog open={showCloseDayDialog} onOpenChange={setShowCloseDayDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              ملخص اليوم
            </DialogTitle>
            <DialogDescription>
              تقرير مبيعات وإحصائيات اليوم
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {/* Daily statistics */}
            {(() => {
              const stats = calculateDailyStatistics();
              return (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-500">إجمالي المبيعات</div>
                      <div className="text-xl font-bold text-blue-700">{stats.totalRevenue} ريال</div>
                    </div>
                    
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-500">عدد الطلبات</div>
                      <div className="text-xl font-bold text-green-700">{stats.ordersCount}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-500">الزبائن</div>
                      <div className="text-lg font-bold text-purple-700">{stats.totalCustomers}</div>
                    </div>
                    
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-500">الطاولات</div>
                      <div className="text-lg font-bold text-orange-700">{stats.tablesServed}</div>
                    </div>
                    
                    <div className="bg-teal-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-500">متوسط الطلب</div>
                      <div className="text-lg font-bold text-teal-700">{stats.avgOrderValue.toFixed(1)}</div>
                    </div>
                  </div>
                  
                  <div className="pt-3 mt-3 border-t border-gray-100">
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">الأصناف الأكثر طلبًا:</h4>
                      <div className="space-y-1">
                        {getMostOrderedItems(5).map((item, index) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{index + 1}. {item.name}</span>
                            <span className="text-gray-600">{item.price} ريال</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-3 mt-3 border-t border-gray-100">
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={handleConfirmCloseDay}
                    >
                      إغلاق اليوم وتصفير الطاولات
                    </Button>
                  </div>
                </div>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Payment Dialog - Enhanced for admin */}
      <PaymentDialog
        isOpen={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        order={selectedPaymentOrder}
        onConfirmPayment={handleConfirmPayment}
      />
      
      {/* Table Details Dialog */}
      <Dialog open={selectedTable !== null} onOpenChange={(open) => !open && setSelectedTable(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {tables.find(t => t.id === selectedTable)?.name || `الطاولة ${selectedTable}`}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {selectedTable && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">الحالة:</span>
                  <Badge className={tables.find(t => t.id === selectedTable)?.isOccupied ? 'bg-blue-500' : 'bg-green-500'}>
                    {tables.find(t => t.id === selectedTable)?.isOccupied ? 'مشغولة' : 'متاحة'}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">عدد الأشخاص:</span>
                  <span className="font-medium">
                    {tables.find(t => t.id === selectedTable)?.peopleCount || 0}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <Button 
                    onClick={() => {
                      handleCreateOrder(selectedTable);
                      setSelectedTable(null);
                    }}
                  >
                    {tables.find(t => t.id === selectedTable)?.isOccupied ? 'تعديل الطلب' : 'طلب جديد'}
                  </Button>
                  
                  {getCurrentOrder(selectedTable) && !getCurrentOrder(selectedTable)?.isPaid && (
                    <Button
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                      onClick={() => {
                        handlePaymentClick(selectedTable);
                        setSelectedTable(null);
                      }}
                    >
                      تسجيل حساب وتحصيل
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
