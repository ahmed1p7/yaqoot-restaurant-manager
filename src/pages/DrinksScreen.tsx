
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableIcon, Clock, User, Check } from "lucide-react";
import { toast } from "sonner";
import { useDeviceType } from "@/hooks/use-mobile";

export const DrinksScreen = () => {
  const { tables, orders, menuItems, updateItemCompletionStatus } = useApp();
  const { isMobile, isTablet } = useDeviceType();
  
  // Define utility functions first, before they are used
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
  
  // Get drink items for a specific table
  const getDrinkItems = (tableId: number) => {
    const order = getCurrentOrder(tableId);
    if (!order) return [];
    
    return order.items
      .filter(item => {
        const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
        return menuItem && menuItem.category === 'drinks' && !item.completed; // Only return non-completed drinks
      })
      .map(item => {
        const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
        return {
          ...item,
          name: menuItem?.name || 'غير معروف',
          price: menuItem?.price || 0,
          isDelivered: item.completed
        };
      });
  };
  
  // Get only tables with active orders that have drinks
  const tablesWithDrinkOrders = tables.filter(table => {
    if (!table.isOccupied) return false;
    
    // Check if the table's current order has drinks
    const drinkItems = getDrinkItems(table.id);
    return drinkItems.length > 0; // Only tables with non-delivered drinks
  });
  
  // Filter menu items to get only drinks
  const drinksItems = menuItems.filter(item => item.category === 'drinks');
  
  const handleDeliverDrinks = (tableId: number, menuItemId: string) => {
    const order = getCurrentOrder(tableId);
    if (!order) return;
    
    // Mark specific drink as delivered
    updateItemCompletionStatus(order.id, menuItemId, true);
    
    toast.success(`تم تسليم المشروب للطاولة ${tableId}`);
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">شاشة المشروبات</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tablesWithDrinkOrders.length > 0 ? (
          tablesWithDrinkOrders.map(table => {
            const currentOrder = getCurrentOrder(table.id);
            const drinkItems = getDrinkItems(table.id);
            
            return (
              <Card 
                key={table.id}
                className="hover:border-blue-300 transition-all shadow-md"
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium flex items-center gap-1">
                      <TableIcon className="h-4 w-4" />
                      طاولة {table.name}
                      <Badge className="bg-blue-500 text-xs ml-2">
                        {drinkItems.length} مشروبات
                      </Badge>
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
                  
                  <div className="bg-gray-50 rounded-md p-2 max-h-40 overflow-y-auto">
                    {drinkItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.quantity}x</span>
                          <span>{item.name}</span>
                        </div>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeliverDrinks(table.id, item.menuItemId);
                          }}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          تم التسليم
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">لا توجد طلبات مشروبات حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
};
