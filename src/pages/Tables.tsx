import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { TableActions } from "@/components/tables/TableActions";
import { PaymentDialog } from "@/components/tables/PaymentDialog";
import { PeopleCountDialog } from "@/components/tables/PeopleCountDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader, SearchInput } from "@/components/shared";
import { User, Table as TableIcon, DollarSign, Users, Utensils, LayoutGrid, Edit, Clock } from "lucide-react";
import { toast } from "sonner";
import { Order } from "@/types";
import { cn } from "@/lib/utils";

export const Tables = () => {
  const { tables, orders, user, menuItems, getMostOrderedItems, getOrdersByTable, resetTable, markTableAsPaid, updateTablePeopleCount } = useApp();
  const navigate = useNavigate();
  
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCloseDayDialog, setShowCloseDayDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedTableForPayment, setSelectedTableForPayment] = useState<number | null>(null);
  const [showPeopleCountDialog, setShowPeopleCountDialog] = useState(false);
  const [selectedTableForPeople, setSelectedTableForPeople] = useState<number | null>(null);
  
  const isAdmin = user?.role === 'admin';
  
  const calculateDailyStatistics = () => {
    const completedOrders = orders.filter(order => order.isPaid);
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalCustomers = completedOrders.reduce((sum, order) => sum + (order.peopleCount || 1), 0);
    const tablesServed = new Set(completedOrders.map(order => order.tableNumber)).size;
    const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
    
    return { totalRevenue, totalCustomers, tablesServed, ordersCount: completedOrders.length, avgOrderValue };
  };
  
  const filteredTables = tables
    .filter(table => table.name.includes(searchQuery))
    .sort((a, b) => {
      if (a.isReserved !== b.isReserved) return a.isReserved ? -1 : 1;
      if (a.isOccupied !== b.isOccupied) return a.isOccupied ? -1 : 1;
      return a.id - b.id;
    });
  
  const getCurrentOrder = (tableId: number): Order | undefined => {
    const table = tables.find(t => t.id === tableId);
    if (!table?.currentOrderId) return undefined;
    return orders.find(o => o.id === table.currentOrderId);
  };
  
  // Handle clicking on the table card itself - opens the table/menu
  const handleTableClick = (tableId: number) => {
    if (isAdmin) {
      setSelectedTable(tableId);
    } else {
      // Waiter clicks on table = open menu
      navigate(`/menu-view?table=${tableId}`);
    }
  };
  
  const handleCreateOrder = (tableId: number) => {
    const currentOrder = getCurrentOrder(tableId);
    if (currentOrder?.isPaid) {
      resetTable(tableId);
    }
    navigate(`/menu-view?table=${tableId}`);
  };
  
  const handleCloseDay = () => setShowCloseDayDialog(true);

  const handleConfirmCloseDay = () => {
    tables.forEach(table => {
      if (table.isOccupied) resetTable(table.id);
    });
    setShowCloseDayDialog(false);
  };
  
  const handlePaymentClick = (tableId: number) => {
    setSelectedTableForPayment(tableId);
    setShowPaymentDialog(true);
  };
  
  const handleConfirmPayment = (method: 'cash' | 'card', discount: number) => {
    if (selectedTableForPayment) {
      markTableAsPaid(selectedTableForPayment);
      resetTable(selectedTableForPayment);
    }
    setShowPaymentDialog(false);
    setSelectedTableForPayment(null);
  };

  // Handle clicking ONLY on the people count area - opens people dialog
  const handlePeopleCountClick = (tableId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent table click
    setSelectedTableForPeople(tableId);
    setShowPeopleCountDialog(true);
  };

  const handlePeopleCountConfirm = (count: number) => {
    if (selectedTableForPeople) {
      updateTablePeopleCount(selectedTableForPeople, count);
    }
    setShowPeopleCountDialog(false);
    setSelectedTableForPeople(null);
  };

  const selectedPaymentOrder = selectedTableForPayment ? getCurrentOrder(selectedTableForPayment) : undefined;

  const getTableStatus = (table: typeof tables[0], isPaid: boolean) => {
    if (isPaid) return 'paid';
    if (table.isReserved) return 'reserved';
    if (table.isOccupied) return 'occupied';
    return 'available';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="إدارة الطاولات"
        subtitle={`${tables.length} طاولة متاحة`}
        icon={LayoutGrid}
        actions={
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {isAdmin && (
              <Button onClick={handleCloseDay} className="sea-btn-gold" size="sm">
                <DollarSign className="h-4 w-4 ml-1 sm:ml-2" />
                <span className="hidden sm:inline">إغلاق اليوم</span>
                <span className="sm:hidden">إغلاق</span>
              </Button>
            )}
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="بحث..."
              className="w-[120px] sm:w-[200px]"
              size="sm"
            />
          </div>
        }
      />
      
      {/* Tables Grid - Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {filteredTables.map((table) => {
          const currentOrder = getCurrentOrder(table.id);
          const isPaid = currentOrder?.isPaid ?? false;
          const status = getTableStatus(table, isPaid);
          
          return (
            <Card 
              key={table.id} 
              className={cn(
                "table-card cursor-pointer transition-all duration-300 hover:scale-[1.02]",
                status === 'occupied' && "table-card-occupied",
                status === 'reserved' && "table-card-reserved",
                status === 'available' && "table-card-available",
                status === 'paid' && "table-card-paid"
              )}
              onClick={() => handleTableClick(table.id)}
            >
              <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center",
                      status === 'occupied' && "bg-info/10 text-info",
                      status === 'reserved' && "bg-secondary/10 text-secondary",
                      status === 'available' && "bg-success/10 text-success",
                      status === 'paid' && "bg-success/10 text-success"
                    )}>
                      <TableIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-sm sm:text-base">{table.name}</h3>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">سعة {table.capacity}</p>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="flex flex-col gap-1">
                    {status === 'reserved' && (
                      <Badge className="sea-badge-gold text-[10px] sm:text-xs px-1.5 sm:px-2">محجوزة</Badge>
                    )}
                    {status === 'occupied' && (
                      <Badge className="sea-badge-info text-[10px] sm:text-xs px-1.5 sm:px-2">مشغولة</Badge>
                    )}
                    {status === 'paid' && (
                      <Badge className="sea-badge-success text-[10px] sm:text-xs px-1.5 sm:px-2">مدفوعة</Badge>
                    )}
                  </div>
                </div>
                
                {/* People Count - Separate clickable area */}
                <button
                  onClick={(e) => handlePeopleCountClick(table.id, e)}
                  className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 p-1.5 sm:p-2 rounded-lg transition-colors w-full"
                >
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{table.peopleCount || 0} أشخاص</span>
                  <Edit className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-auto opacity-50" />
                </button>

                {/* Order Info for occupied tables */}
                {currentOrder && !currentOrder.isPaid && (
                  <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground bg-muted/30 rounded-lg p-1.5 sm:p-2">
                    <Clock className="w-3 h-3" />
                    <span>{currentOrder.items.length} أصناف</span>
                    <span className="mx-1">•</span>
                    <span className="font-bold text-primary">${currentOrder.totalAmount}</span>
                  </div>
                )}
                
                {/* Quick Actions - Only for Admin */}
                {isAdmin && (
                  <TableActions
                    table={table}
                    currentOrder={currentOrder}
                    onCreateOrder={handleCreateOrder}
                    isAdmin={true}
                  />
                )}
                
                {/* Admin Price Info */}
                {isAdmin && currentOrder && !currentOrder.isPaid && (
                  <div className="border-t border-border pt-2 sm:pt-3 mt-2 sm:mt-3">
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-muted-foreground">المبلغ:</span>
                      <span className="font-bold text-foreground">{currentOrder.totalAmount} ريال</span>
                    </div>
                    <Button 
                      className="w-full mt-2 sm:mt-3 sea-btn-primary text-xs sm:text-sm"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePaymentClick(table.id);
                      }}
                    >
                      <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                      تسجيل الحساب
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Close Day Dialog */}
      <Dialog open={showCloseDayDialog} onOpenChange={setShowCloseDayDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              ملخص اليوم
            </DialogTitle>
            <DialogDescription>تقرير مبيعات وإحصائيات اليوم</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {(() => {
              const stats = calculateDailyStatistics();
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="sea-card p-4 text-center">
                      <p className="text-sm text-muted-foreground">إجمالي المبيعات</p>
                      <p className="text-2xl font-bold text-primary">{stats.totalRevenue} ريال</p>
                    </div>
                    <div className="sea-card p-4 text-center">
                      <p className="text-sm text-muted-foreground">عدد الطلبات</p>
                      <p className="text-2xl font-bold text-success">{stats.ordersCount}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="sea-card p-3 text-center">
                      <p className="text-xs text-muted-foreground">الزبائن</p>
                      <p className="text-xl font-bold">{stats.totalCustomers}</p>
                    </div>
                    <div className="sea-card p-3 text-center">
                      <p className="text-xs text-muted-foreground">الطاولات</p>
                      <p className="text-xl font-bold">{stats.tablesServed}</p>
                    </div>
                    <div className="sea-card p-3 text-center">
                      <p className="text-xs text-muted-foreground">متوسط</p>
                      <p className="text-xl font-bold">{stats.avgOrderValue.toFixed(0)}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border">
                    <h4 className="font-semibold mb-3">الأصناف الأكثر طلباً:</h4>
                    <div className="space-y-2">
                      {getMostOrderedItems(5).map((item, index) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                              {index + 1}
                            </span>
                            {item.name}
                          </span>
                          <span className="font-semibold">{item.price} ريال</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button className="w-full sea-btn-primary" onClick={handleConfirmCloseDay}>
                    إغلاق اليوم وتصفير الطاولات
                  </Button>
                </div>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Payment Dialog */}
      <PaymentDialog
        isOpen={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        order={selectedPaymentOrder}
        onConfirmPayment={handleConfirmPayment}
      />
      
      {/* Table Details Dialog - Admin Only */}
      <Dialog open={selectedTable !== null} onOpenChange={(open) => !open && setSelectedTable(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <TableIcon className="w-5 h-5 text-primary-foreground" />
              </div>
              {tables.find(t => t.id === selectedTable)?.name || `الطاولة ${selectedTable}`}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {selectedTable && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="sea-card p-4 text-center">
                    <p className="text-sm text-muted-foreground">الحالة</p>
                    <Badge className={tables.find(t => t.id === selectedTable)?.isOccupied ? 'sea-badge-info' : 'sea-badge-success'}>
                      {tables.find(t => t.id === selectedTable)?.isOccupied ? 'مشغولة' : 'متاحة'}
                    </Badge>
                  </div>
                  <div className="sea-card p-4 text-center">
                    <p className="text-sm text-muted-foreground">عدد الأشخاص</p>
                    <p className="text-xl font-bold">{tables.find(t => t.id === selectedTable)?.peopleCount || 0}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    className="sea-btn-primary"
                    onClick={() => {
                      handleCreateOrder(selectedTable);
                      setSelectedTable(null);
                    }}
                  >
                    <Utensils className="w-4 h-4 ml-2" />
                    {tables.find(t => t.id === selectedTable)?.isOccupied ? 'تعديل الطلب' : 'طلب جديد'}
                  </Button>
                  
                  {getCurrentOrder(selectedTable) && !getCurrentOrder(selectedTable)?.isPaid && (
                    <Button
                      className="sea-btn-gold"
                      onClick={() => {
                        handlePaymentClick(selectedTable);
                        setSelectedTable(null);
                      }}
                    >
                      <DollarSign className="w-4 h-4 ml-2" />
                      تحصيل
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* People Count Dialog */}
      <PeopleCountDialog
        isOpen={showPeopleCountDialog}
        onClose={() => {
          setShowPeopleCountDialog(false);
          setSelectedTableForPeople(null);
        }}
        currentCount={selectedTableForPeople ? tables.find(t => t.id === selectedTableForPeople)?.peopleCount || 0 : 0}
        onConfirm={handlePeopleCountConfirm}
        isEditing={true}
      />
    </div>
  );
};
