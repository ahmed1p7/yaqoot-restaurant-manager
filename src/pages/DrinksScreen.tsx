
import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableIcon, Clock, User, Check, CupSoda, Coffee } from "lucide-react";
import { useDeviceType } from "@/hooks/use-mobile";

export const DrinksScreen = () => {
  const { tables, orders, menuItems, updateItemCompletionStatus } = useApp();
  const { isMobile, isTablet } = useDeviceType();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
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
      if (menuItem && menuItem.category === 'drinks' && !item.completed) {
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
    setRefreshTrigger(prev => prev + 1);
  };
  
  // Force re-render when drinks are delivered
  useEffect(() => {
    // This is just to trigger a re-render when refreshTrigger changes
  }, [refreshTrigger]);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-4 rounded-lg shadow-lg mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CupSoda className="h-7 w-7" />
          شاشة المشروبات
        </h1>
        <Badge className="bg-white text-blue-700 text-lg px-3 py-1 font-medium">
          {tablesWithDrinkOrders.reduce((total, table) => total + getDrinksCount(table.id), 0)} مشروبات بانتظار التسليم
        </Badge>
      </div>
      
      {tablesWithDrinkOrders.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tablesWithDrinkOrders.map(table => {
            const currentOrder = getCurrentOrder(table.id);
            const drinkItems = getDrinkItems(table.id);
            
            return (
              <Card 
                key={table.id}
                className="overflow-hidden border-2 border-blue-200 hover:border-blue-400 transition-all shadow-lg rounded-xl"
              >
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-3 border-b border-blue-100">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2 text-blue-800">
                      <TableIcon className="h-5 w-5 text-blue-600" />
                      طاولة {table.name}
                      <Badge className="bg-blue-600 text-white ml-2">
                        {drinkItems.length} مشروبات
                      </Badge>
                    </h3>
                    
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {table.peopleCount} شخص
                    </span>
                  </div>
                  
                  {currentOrder && (
                    <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span>
                        {new Date(currentOrder.createdAt).toLocaleTimeString('ar-SA', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span className="mx-1">•</span>
                      <User className="h-4 w-4 text-blue-500" />
                      <span>{currentOrder.waiterName}</span>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-0">
                  <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                    {drinkItems.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="flex justify-between items-center p-3 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center h-7 w-7 bg-blue-100 text-blue-800 rounded-full font-medium">
                            {item.quantity}×
                          </span>
                          <div>
                            <span className="font-medium">{item.name}</span>
                            {item.notes && (
                              <p className="text-xs text-gray-500 mt-1 bg-gray-50 px-2 py-1 rounded">
                                {item.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white shadow-sm flex items-center gap-1"
                          onClick={() => handleDeliverDrinks(table.id, item.menuItemId)}
                        >
                          <Check className="h-4 w-4" />
                          تم التسليم
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100 shadow-sm">
          <Coffee className="w-16 h-16 mx-auto text-blue-300 mb-4" />
          <p className="text-xl font-medium text-blue-800 mb-2">لا توجد طلبات مشروبات حالياً</p>
          <p className="text-gray-500">ستظهر طلبات المشروبات هنا عندما يتم طلبها</p>
        </div>
      )}
    </div>
  );
};
