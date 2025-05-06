
import React from 'react';
import { OrderItem } from '@/types';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderItemCard } from './OrderItemCard';

interface CurrentOrderPanelProps {
  items: OrderItem[];
  onUpdateQuantity: (menuItemId: string, quantity: number) => void;
  onUpdateNote: (menuItemId: string, note: string) => void;
  onRemoveItem: (menuItemId: string) => void;
  tableNumber?: number;
}

export const CurrentOrderPanel: React.FC<CurrentOrderPanelProps> = ({
  items,
  onUpdateQuantity,
  onUpdateNote,
  onRemoveItem,
  tableNumber
}) => {
  if (items.length === 0) return null;
  
  // Calculate total amount
  const totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-lg flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span>الطلب الحالي</span>
            {tableNumber && <span className="text-sm text-gray-500">(طاولة {tableNumber})</span>}
          </div>
          <span className="text-sm font-normal">
            الإجمالي: <strong>{totalAmount} ريال</strong>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[250px] pr-4">
          <div className="space-y-2 pr-2">
            {items.map((item) => (
              <OrderItemCard
                key={item.menuItemId}
                item={item}
                onUpdateQuantity={onUpdateQuantity}
                onUpdateNote={onUpdateNote}
                onRemoveItem={onRemoveItem}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
