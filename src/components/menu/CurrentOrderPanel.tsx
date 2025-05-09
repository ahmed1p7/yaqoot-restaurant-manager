
import React from 'react';
import { OrderItem } from '@/types';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { OrderItemCard } from './OrderItemCard';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, SendHorizonal, Send } from 'lucide-react';

interface CurrentOrderPanelProps {
  items: OrderItem[];
  onUpdateQuantity: (menuItemId: string, quantity: number) => void;
  onUpdateNote: (menuItemId: string, note: string) => void;
  onRemoveItem: (menuItemId: string) => void;
  onSendOrder?: () => void;
  tableNumber?: number;
  peopleCount?: number;
  onOpenPeopleDialog?: () => void;
}

export const CurrentOrderPanel: React.FC<CurrentOrderPanelProps> = ({
  items,
  onUpdateQuantity,
  onUpdateNote,
  onRemoveItem,
  onSendOrder,
  tableNumber,
  peopleCount,
  onOpenPeopleDialog
}) => {
  if (items.length === 0 && !tableNumber) return null;
  
  // Calculate total amount
  const totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  return (
    <Card className="mb-4 border-2 border-primary/10 shadow-md">
      <CardHeader className="pb-2 pt-4 bg-primary/5">
        <CardTitle className="text-lg flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span>الطلب الحالي</span>
            {tableNumber && <Badge variant="outline" className="text-sm">طاولة {tableNumber}</Badge>}
          </div>
          <span className="text-sm font-normal">
            الإجمالي: <strong>{totalAmount} ريال</strong>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        {peopleCount !== undefined && (
          <div 
            className="flex items-center gap-2 mb-3 p-2 bg-secondary/20 rounded-md cursor-pointer"
            onClick={onOpenPeopleDialog}
          >
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm">{peopleCount} شخص</span>
            <Badge variant="outline" className="mr-auto text-xs cursor-pointer">
              تعديل
            </Badge>
          </div>
        )}
        
        {items.length > 0 ? (
          <ScrollArea className="h-[250px] pr-3">
            <div className="space-y-3 pr-2">
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
        ) : (
          <div className="text-center py-8 text-gray-500">
            لا توجد أطباق في الطلب الحالي
          </div>
        )}
      </CardContent>
      
      {items.length > 0 && (
        <CardFooter className="bg-primary/5 py-3 flex flex-col gap-2">
          <Button 
            className="w-full" 
            size="lg" 
            onClick={onSendOrder}
            disabled={items.length === 0}
          >
            <Send className="h-5 w-5 ml-2" />
            إرسال الطلب إلى المطبخ
          </Button>
          <div className="w-full text-center text-sm text-muted-foreground">
            * يمكنك تعديل الكميات وإضافة ملاحظات للأطباق
          </div>
        </CardFooter>
      )}
    </Card>
  );
};
