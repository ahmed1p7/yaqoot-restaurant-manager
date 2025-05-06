
import React, { useState } from 'react';
import { OrderItem } from '@/types';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Minus, MessageSquare } from 'lucide-react';

interface OrderItemCardProps {
  item: OrderItem;
  onUpdateQuantity: (menuItemId: string, quantity: number) => void;
  onUpdateNote: (menuItemId: string, note: string) => void;
  onRemoveItem: (menuItemId: string) => void;
}

export const OrderItemCard: React.FC<OrderItemCardProps> = ({
  item,
  onUpdateQuantity,
  onUpdateNote,
  onRemoveItem
}) => {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(item.notes || '');
  
  const handleSaveNote = () => {
    onUpdateNote(item.menuItemId, noteText);
    setIsEditingNote(false);
  };
  
  return (
    <Card className="mb-2">
      <CardContent className="p-3">
        <div className="flex justify-between items-center">
          <div className="font-medium">{item.name}</div>
          <div className="text-sm text-gray-500">{item.price} ريال</div>
        </div>
        
        {/* Quantity controls */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              className="h-7 w-7"
              onClick={() => onUpdateQuantity(item.menuItemId, item.quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
            
            <span className="w-6 text-center">{item.quantity}</span>
            
            <Button 
              variant="outline" 
              size="icon"
              className="h-7 w-7"
              onClick={() => item.quantity > 1 && onUpdateQuantity(item.menuItemId, item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-7 w-7 text-gray-500 hover:text-primary"
              onClick={() => setIsEditingNote(!isEditingNote)}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="h-7 w-7 text-gray-500 hover:text-red-500"
              onClick={() => onRemoveItem(item.menuItemId)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Note section */}
        {isEditingNote ? (
          <div className="mt-2">
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="أضف ملاحظات للطبق..."
              className="text-sm h-20"
            />
            <div className="flex justify-end mt-1">
              <Button
                variant="default"
                size="sm"
                onClick={handleSaveNote}
                className="text-xs px-2 py-1 h-7"
              >
                حفظ
              </Button>
            </div>
          </div>
        ) : item.notes ? (
          <div className="mt-2 text-sm bg-gray-50 p-2 rounded-md">
            <span className="text-xs text-gray-500">ملاحظات: </span>
            {item.notes}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
