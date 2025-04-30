
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, User, MessageCircle } from "lucide-react";
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
      <div className="text-center py-12">
        <p className="text-xl font-medium text-gray-500">لا توجد طلبات نشطة</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {tableNumbers.map((tableNumber) => {
        const tableOrders = ordersByTable[tableNumber];
        
        return (
          <Card key={tableNumber} className="border-2 border-blue-400">
            <CardContent className="p-4">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
                  طاولة {tableNumber}
                </span>
                <span className="text-sm text-gray-500">
                  ({tableOrders.length} طلب)
                </span>
              </h3>
              
              <div className="space-y-4">
                {tableOrders.map((order) => (
                  <div 
                    key={order.id}
                    className="border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className={
                          order.status === 'pending' ? 'bg-yellow-500' : 
                          order.status === 'preparing' ? 'bg-blue-500' : 
                          'bg-green-500'
                        }>
                          {order.status === 'pending' ? 'معلق' : 
                           order.status === 'preparing' ? 'قيد التحضير' : 
                           'جاهز'}
                        </Badge>
                        
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeDiff(order.createdAt)}
                        </div>
                        
                        {order.peopleCount && (
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {order.peopleCount}
                          </div>
                        )}
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-500 border-red-200"
                        onClick={() => openDelayDialog(order.id)}
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        تأجيل
                      </Button>
                    </div>
                    
                    <div className="space-y-2 divide-y divide-gray-100">
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
                              "font-bold",
                              item.completed ? "text-green-500" : "text-blue-500"
                            )}>
                              {item.quantity}×
                            </span>
                            <span className={item.completed ? "line-through text-gray-500" : ""}>
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
                                : "bg-green-500 hover:bg-green-600"
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
