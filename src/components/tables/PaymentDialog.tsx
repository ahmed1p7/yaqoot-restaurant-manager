
import React, { useState } from "react";
import { Order, OrderItem } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CreditCard, User, DollarSign, Percent } from "lucide-react";
import { toast } from "sonner";

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
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [discount, setDiscount] = useState<number>(0);

  if (!order) return null;

  const originalAmount = order.totalAmount;
  const discountedAmount = originalAmount - (originalAmount * discount / 100);

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
            <span>تسجيل دفع للطاولة {order?.tableNumber}</span>
            <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
              <User className="h-3 w-3" /> {order?.peopleCount} أشخاص
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Order Items */}
          <div>
            <h4 className="text-sm font-medium mb-2">الأطباق المطلوبة:</h4>
            <ScrollArea className="h-32 rounded-md border p-2">
              <div className="space-y-2">
                {order?.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      {item.notes && <span className="text-gray-500 text-xs block">{item.notes}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">{item.quantity} x</span>
                      <span>{item.price} ريال</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

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
              <span className="text-gray-600">المبلغ الأصلي:</span>
              <span>{originalAmount} ريال</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between mb-1 text-green-600">
                <span>الخصم ({discount}%):</span>
                <span>- {(originalAmount * discount / 100).toFixed(2)} ريال</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between font-bold">
              <span>الإجمالي:</span>
              <span>{discountedAmount.toFixed(2)} ريال</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              المتوسط للشخص: {(discountedAmount / order?.peopleCount!).toFixed(2)} ريال
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
