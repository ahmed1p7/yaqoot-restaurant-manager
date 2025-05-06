
import React, { useState } from "react";
import { Order, OrderItem } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CreditCard, User, DollarSign, Percent, Coffee, Utensils, Folder, Table } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/contexts/AppContext";

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order?: Order;
  onConfirmPayment: (method: 'cash' | 'card', discount: number) => void;
}

export const PaymentDialog: React.FC<PaymentDialogProps> = ({
  isOpen,
  onClose,
  order,
  onConfirmPayment
}) => {
  const { systemSettings, menuItems } = useApp();
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [discount, setDiscount] = useState<number>(0);

  if (!order) return null;

  // Calculate subtotals by category
  const categorizedItems: Record<string, { items: OrderItem[], subtotal: number }> = {};
  
  order.items.forEach(item => {
    // Look up the category from menuItems since it doesn't exist in OrderItem
    const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
    const category = menuItem?.category ? menuItem.category : "أخرى";
    
    if (!categorizedItems[category]) {
      categorizedItems[category] = { items: [], subtotal: 0 };
    }
    categorizedItems[category].items.push(item);
    categorizedItems[category].subtotal += (item.price * item.quantity);
  });
  
  const originalAmount = order.totalAmount;
  
  // Calculate per seat charge
  const perSeatCharge = systemSettings.enablePerSeatCharge 
    ? systemSettings.perSeatCharge * order.peopleCount
    : 0;
  
  // Total including seat charges
  const totalWithCharges = originalAmount + perSeatCharge;
  
  // Calculate discount
  const discountAmount = totalWithCharges * discount / 100;
  const finalAmount = totalWithCharges - discountAmount;

  const handlePaymentConfirm = () => {
    onConfirmPayment(paymentMethod, discount);
    toast.success("تم تسجيل الدفع بنجاح");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Table className="h-4 w-4" />
              <span>فاتورة الطاولة {order?.tableNumber}</span>
            </div>
            <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
              <User className="h-3 w-3" /> {order?.peopleCount} أشخاص
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <ScrollArea className="h-52 rounded-md border p-4">
            <div className="space-y-4">
              {Object.entries(categorizedItems).map(([category, { items, subtotal }]) => (
                <div key={category} className="space-y-2">
                  <div className="flex items-center gap-2 font-medium">
                    {category === "مشروبات" ? (
                      <Coffee className="h-4 w-4 text-blue-500" />
                    ) : category === "أطباق رئيسية" ? (
                      <Utensils className="h-4 w-4 text-green-500" />
                    ) : (
                      <Folder className="h-4 w-4 text-gray-500" />
                    )}
                    <span>{category}</span>
                  </div>
                  
                  {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm px-4">
                      <div>
                        <span>{item.name}</span>
                        {item.notes && <span className="text-gray-500 text-xs block">{item.notes}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">{item.quantity} x</span>
                        <span>{item.price} ريال</span>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-between text-sm font-medium border-t pt-1 mx-4">
                    <span>مجموع {category}:</span>
                    <span>{subtotal} ريال</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Payment Method */}
          <div>
            <h4 className="text-sm font-medium mb-2">طريقة الدفع:</h4>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={paymentMethod === 'cash' ? "default" : "outline"}
                className="flex-1"
                onClick={() => setPaymentMethod('cash')}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                نقدي
              </Button>
              <Button
                type="button"
                variant={paymentMethod === 'card' ? "default" : "outline"}
                className="flex-1"
                onClick={() => setPaymentMethod('card')}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                بطاقة
              </Button>
            </div>
          </div>

          {/* Discount */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
              <Percent className="h-4 w-4" /> الخصم:
            </h4>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                min="0"
                max="100"
                className="w-20"
              />
              <span>%</span>
            </div>
          </div>

          {/* Summary */}
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">إجمالي الطلبات:</span>
              <span>{originalAmount} ريال</span>
            </div>
            
            {perSeatCharge > 0 && (
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">رسوم الطاولة ({systemSettings.perSeatCharge} × {order.peopleCount}):</span>
                <span>{perSeatCharge} ريال</span>
              </div>
            )}
            
            {discount > 0 && (
              <div className="flex justify-between mb-1 text-green-600">
                <span>الخصم ({discount}%):</span>
                <span>- {discountAmount.toFixed(2)} ريال</span>
              </div>
            )}
            
            <Separator className="my-2" />
            <div className="flex justify-between font-bold">
              <span>الإجمالي:</span>
              <span>{finalAmount.toFixed(2)} ريال</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              المتوسط للشخص: {(finalAmount / order?.peopleCount!).toFixed(2)} ريال
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
          <Button onClick={handlePaymentConfirm}>تأكيد الدفع</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
