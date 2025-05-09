
import React, { useState } from 'react';
import { OrderItem } from '@/types';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Minus, MessageSquare, X } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

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
    <Card className="relative border-primary/10 overflow-hidden">
      <CardContent className="p-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
              {item.quantity}
            </Badge>
            <div className="font-medium">{item.name}</div>
          </div>
          <div className="text-sm font-semibold">{item.price} ريال</div>
        </div>
        
        {/* Quantity controls */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1 bg-gray-50 rounded-lg">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 rounded-r-none hover:bg-gray-200"
              onClick={() => onUpdateQuantity(item.menuItemId, item.quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
            
            <span className="w-8 text-center">{item.quantity}</span>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 rounded-l-none hover:bg-gray-200"
              onClick={() => item.quantity > 1 && onUpdateQuantity(item.menuItemId, item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-1">
            <Button 
              variant={isEditingNote ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsEditingNote(!isEditingNote)}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => onRemoveItem(item.menuItemId)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Note section */}
        {isEditingNote ? (
          <div className="mt-2 bg-secondary/10 p-2 rounded-md">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium">إضافة ملاحظات</span>
              <Button
                variant="ghost" 
                size="icon"
                className="h-5 w-5"
                onClick={() => setIsEditingNote(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="أضف ملاحظات للطبق..."
              className="text-sm h-20 resize-none"
            />
            <div className="flex justify-end mt-1">
              <Button
                variant="default"
                size="sm"
                onClick={handleSaveNote}
                className="text-xs px-3 py-1 h-7"
              >
                حفظ
              </Button>
            </div>
          </div>
        ) : item.notes ? (
          <div className="mt-2 text-sm bg-secondary/10 p-2 rounded-md">
            <div className="flex items-center gap-1 mb-1">
              <MessageSquare className="h-3 w-3 text-gray-500" />
              <span className="text-xs text-gray-600">ملاحظات:</span>
            </div>
            <p className="text-sm">{item.notes}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
