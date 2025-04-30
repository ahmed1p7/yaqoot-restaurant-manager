
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { TableActions } from "@/components/tables/TableActions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, User, Search, Table as TableIcon } from "lucide-react";
import { toast } from "sonner";
import { Order } from "@/types";

export const Tables = () => {
  const { tables, orders, user, menuItems, getMostOrderedItems } = useApp();
  const navigate = useNavigate();
  
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [emergencyTable, setEmergencyTable] = useState<number | null>(null);
  
  // Get the most ordered items for quick orders
  const mostOrderedItems = getMostOrderedItems(5);
  
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
    setSelectedTable(tableId);
    // Further implementation in real app would navigate to order creation page
  };
  
  const handleTableEmergency = (tableId: number) => {
    setEmergencyTable(tableId);
    toast.error(`تم تسجيل حالة طوارئ للطاولة ${tableId}!`, {
      description: "تم إرسال تنبيه للإدارة"
    });
    
    // In a real system, this would trigger notifications to admin
  };
  
  const handleResetEmergency = () => {
    setEmergencyTable(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">الطاولات</h1>
        
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
      
      {/* Quick order bar - Show only for waiters */}
      {user?.role === 'waiter' && mostOrderedItems.length > 0 && (
        <div className="bg-gray-50 p-2 rounded-md flex items-center gap-2 overflow-x-auto">
          <span className="text-sm font-medium min-w-max">طلبات سريعة:</span>
          {mostOrderedItems.map(item => (
            <Button 
              key={item.id} 
              variant="outline" 
              size="sm"
              className="min-w-max"
              onClick={() => {
                // In a real app, this would add the item to current order
                toast.success(`تمت إضافة ${item.name} للطلب`, {
                  description: "يمكنك تعديل الكمية لاحقاً"
                });
              }}
            >
              {item.name}
            </Button>
          ))}
        </div>
      )}
      
      {/* Emergency Alert */}
      {emergencyTable && (
        <Alert variant="destructive" className="animate-pulse">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="mr-2">حالة طوارئ!</AlertTitle>
          <AlertDescription className="mr-2">
            تم تسجيل حالة طوارئ للطاولة {emergencyTable}
          </AlertDescription>
          <Button 
            variant="outline" 
            size="sm" 
            className="mr-auto"
            onClick={handleResetEmergency}
          >
            إغلاق
          </Button>
        </Alert>
      )}
      
      {/* Tables grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredTables.map((table) => {
          const currentOrder = getCurrentOrder(table.id);
          const isEmergency = emergencyTable === table.id;
          
          return (
            <Card 
              key={table.id} 
              className={`
                ${isEmergency ? 'border-red-500 border-2 animate-pulse' : 
                  table.isReserved ? 'border-purple-300' :
                  table.isOccupied ? 'border-blue-300' : 'border-gray-200'}
                hover:border-2 transition-all
              `}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium flex items-center gap-1">
                    <TableIcon className="h-4 w-4" />
                    {table.name}
                    {table.isOccupied && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded ml-2">
                        مشغولة
                      </span>
                    )}
                    {currentOrder?.isPaid && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded ml-2">
                        مدفوعة
                      </span>
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
                  triggerEmergency={handleTableEmergency}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Dialog for order creation */}
      {selectedTable && (
        <Dialog open={selectedTable !== null} onOpenChange={() => setSelectedTable(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                إنشاء طلب للطاولة {selectedTable}
              </DialogTitle>
            </DialogHeader>
            
            <div className="text-center py-6">
              <p className="text-gray-500">
                في التطبيق الكامل، سيتم توجيهك إلى صفحة إنشاء طلب جديد للطاولة.
              </p>
              <Button 
                className="mt-4"
                onClick={() => setSelectedTable(null)}
              >
                إغلاق
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
