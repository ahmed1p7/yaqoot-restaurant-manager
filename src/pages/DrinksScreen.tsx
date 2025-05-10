
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table as TableIcon, Clock, User, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useDeviceType } from "@/hooks/use-mobile";
import { OrderItem } from "@/types";

export const DrinksScreen = () => {
  const { tables, orders, menuItems, updateItemCompletionStatus } = useApp();
  const navigate = useNavigate();
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
        return menuItem && menuItem.category === 'drinks';
      })
      .map(item => {
        const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
        return {
          ...item,
          name: menuItem?.name || 'غير معروف',
          price: menuItem?.price || 0,
          // We'll derive the completion status here instead of adding a status property
          isDelivered: item.completed
        };
      });
  };
  
  // Get only tables with active orders that have drinks
  const tablesWithDrinkOrders = tables.filter(table => {
    if (!table.isOccupied) return false;
    
    // Check if the table's current order has drinks
    const order = getCurrentOrder(table.id);
    return order && getDrinksCount(table.id) > 0;
  });
  
  // Filter menu items to get only drinks
  const drinksItems = menuItems.filter(item => item.category === 'drinks');
  
  const handleViewTable = (tableId: number) => {
    // Navigate to the menu view with drinks filter
    navigate(`/menu-view?table=${tableId}&category=drinks`);
  };
  
  const handleDeliverDrinks = (tableId: number) => {
    const order = getCurrentOrder(tableId);
    if (!order) return;
    
    // Mark drinks as delivered by setting completed = true for each drink item
    order.items.forEach(item => {
      const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
      if (menuItem && menuItem.category === 'drinks') {
        updateItemCompletionStatus(order.id, item.menuItemId, true);
      }
    });
    
    toast.success(`تم تسليم المشروبات للطاولة ${tableId}`);
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">شاشة المشروبات</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tablesWithDrinkOrders.length > 0 ? (
          tablesWithDrinkOrders.map(table => {
            const currentOrder = getCurrentOrder(table.id);
            const drinksCount = getDrinksCount(table.id);
            const drinkItems = getDrinkItems(table.id);
            
            return (
              <Card 
                key={table.id}
                className="hover:border-blue-300 transition-all cursor-pointer shadow-md"
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium flex items-center gap-1">
                      <TableIcon className="h-4 w-4" />
                      طاولة {table.name}
                      <Badge className="bg-blue-500 text-xs ml-2">
                        {drinksCount} مشروبات
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
                      <div key={idx} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.quantity}x</span>
                          <span>{item.name}</span>
                        </div>
                        <Badge variant={item.isDelivered ? "outline" : "default"} className={item.isDelivered ? "text-green-600" : ""}>
                          {item.isDelivered ? 'تم التسليم' : 'قيد التحضير'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      className="bg-green-600 hover:bg-green-700 flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeliverDrinks(table.id);
                      }}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      تسليم المشروبات
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleViewTable(table.id)}
                    >
                      إضافة مشروبات
                    </Button>
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
