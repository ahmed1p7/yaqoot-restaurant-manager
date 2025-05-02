
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table as TableIcon, Clock, User, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const DrinksScreen = () => {
  const { tables, orders, menuItems, updateOrderStatus } = useApp();
  const navigate = useNavigate();
  
  // Get only tables with active orders
  const tablesWithOrders = tables.filter(table => table.isOccupied);
  
  // Filter menu items to get only drinks
  const drinksItems = menuItems.filter(item => item.category === 'drinks');
  
  // Get current order for a table
  const getCurrentOrder = (tableId: number) => {
    const table = tables.find(t => t.id === tableId);
    if (!table?.currentOrderId) return undefined;
    
    return orders.find(o => o.id === table.currentOrderId);
  };
  
  // Calculate drinks count for an order
  const getDrinksCount = (tableId: number) => {
    const order = getCurrentOrder(tableId);
    if (!order) return 0;
    
    // Sum quantities of all drink items
    return order.items.reduce((count, item) => {
      const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
      if (menuItem && menuItem.category === 'drinks') {
        return count + item.quantity;
      }
      return count;
    }, 0);
  };
  
  const handleViewTable = (tableId: number) => {
    // Navigate to the menu view with drinks filter
    navigate(`/menu-view?table=${tableId}`);
  };
  
  const handleDeliverDrinks = (tableId: number) => {
    const order = getCurrentOrder(tableId);
    if (!order) return;
    
    // Mark drinks as delivered (in a real app, we would only mark drinks as delivered)
    toast.success(`تم تسليم المشروبات للطاولة ${tableId}`);
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">شاشة المشروبات</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tablesWithOrders.length > 0 ? (
          tablesWithOrders.map(table => {
            const currentOrder = getCurrentOrder(table.id);
            const drinksCount = getDrinksCount(table.id);
            
            return (
              <Card 
                key={table.id}
                className={`
                  hover:border-blue-300 transition-all cursor-pointer
                  ${drinksCount > 0 ? 'border-blue-300' : 'border-gray-200'}
                `}
                onClick={() => handleViewTable(table.id)}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium flex items-center gap-1">
                      <TableIcon className="h-4 w-4" />
                      {table.name}
                      {drinksCount > 0 && (
                        <Badge className="bg-blue-500 text-xs px-2 py-0.5 rounded ml-2">
                          {drinksCount} مشروبات
                        </Badge>
                      )}
                    </h3>
                    
                    <span className="text-sm text-gray-500">
                      {table.peopleCount} شخص
                    </span>
                  </div>
                  
                  {currentOrder && (
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {new Date(currentOrder.createdAt).toLocaleTimeString('ar-SA', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <User className="h-3 w-3 mr-1" />
                      <span>{currentOrder.waiterName}</span>
                    </div>
                  )}
                  
                  {drinksCount > 0 ? (
                    <Button 
                      className="bg-green-600 hover:bg-green-700 w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeliverDrinks(table.id);
                      }}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      تسليم المشروبات
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleViewTable(table.id)}
                    >
                      إضافة مشروبات
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">لا توجد طاولات نشطة حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
};
