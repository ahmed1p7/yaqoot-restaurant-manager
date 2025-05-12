
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, User, MessageCircle, ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";
import { Order } from "@/types";

interface OrdersByTableProps {
  ordersByTable: Record<number, Order[]>;
  formatTimeDiff: (date: Date | string) => string;
  handleItemCompletion: (orderId: string, menuItemId: string, completed: boolean) => void;
  handleCancelItem: (orderId: string, menuItemId: string) => void;
  openDelayDialog: (orderId: string) => void;
}

export const OrdersByTable = ({
  ordersByTable,
  formatTimeDiff,
  handleItemCompletion,
  handleCancelItem,
  openDelayDialog
}: OrdersByTableProps) => {
  const tableNumbers = Object.keys(ordersByTable).map(Number).sort((a, b) => a - b);
  
  if (tableNumbers.length === 0) {
    return (
      <div className="kitchen-empty">
        <ChefHat className="w-16 h-16 mx-auto text-orange-300 mb-4" />
        <p className="text-xl font-medium text-orange-800 mb-2">لا توجد طلبات نشطة</p>
        <p className="text-gray-500">ستظهر الطلبات هنا عندما يتم طلبها</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {tableNumbers.map((tableNumber) => {
        const tableOrders = ordersByTable[tableNumber];
        
        return (
          <Card key={tableNumber} className="kitchen-card">
            <div className="kitchen-card-header">
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-md">
                  طاولة {tableNumber}
                </span>
                <span className="text-sm text-gray-600">
                  ({tableOrders.length} طلب)
                </span>
              </h3>
            </div>
            
            <CardContent className="p-4">
              <div className="space-y-4">
                {tableOrders.map((order) => (
                  <div 
                    key={order.id}
                    className="border border-orange-100 rounded-lg p-3 bg-gradient-to-r from-white to-orange-50"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className={
                          order.status === 'pending' ? 'bg-yellow-500' : 
                          order.status === 'preparing' ? 'bg-orange-500' : 
                          'bg-green-500'
                        }>
                          {order.status === 'pending' ? 'معلق' : 
                           order.status === 'preparing' ? 'قيد التحضير' : 
                           'جاهز'}
                        </Badge>
                        
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeDiff(order.createdAt)}
                        </div>
                        
                        {order.peopleCount && (
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {order.peopleCount}
                          </div>
                        )}
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-orange-600 border-orange-200 hover:bg-orange-50"
                        onClick={() => openDelayDialog(order.id)}
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        تأجيل
                      </Button>
                    </div>
                    
                    <div className="space-y-2 divide-y divide-orange-100">
                      {order.items.map((item, idx) => (
                        <div 
                          key={`${item.menuItemId}-${idx}`} 
                          className={cn(
                            "flex justify-between items-center py-2",
                            item.completed ? "opacity-60" : ""
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "flex items-center justify-center h-6 w-6 rounded-full font-medium",
                              item.completed ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
                            )}>
                              {item.quantity}
                            </span>
                            <span className={item.completed ? "line-through text-gray-500" : "font-medium"}>
                              {item.name}
                            </span>
                            {item.notes && (
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {item.notes}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant={item.completed ? "outline" : "default"}
                              className={item.completed 
                                ? "border-red-500 text-red-500 hover:bg-red-50"
                                : "kitchen-button"
                              }
                              onClick={() => handleItemCompletion(order.id, item.menuItemId, item.completed)}
                            >
                              {item.completed 
                                ? <X className="w-4 h-4" /> 
                                : <Check className="w-4 h-4" />
                              }
                            </Button>
                            
                            {!item.completed && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-red-500 text-red-500 hover:bg-red-50"
                                onClick={() => handleCancelItem(order.id, item.menuItemId)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
