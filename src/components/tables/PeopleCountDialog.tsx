
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Plus, Minus } from "lucide-react";

interface PeopleCountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentCount: number;
  onConfirm: (count: number) => void;
  isEditing?: boolean;
}

export const PeopleCountDialog: React.FC<PeopleCountDialogProps> = ({
  isOpen,
  onClose,
  currentCount,
  onConfirm,
  isEditing = false
}) => {
  const [count, setCount] = useState<number>(currentCount || 1);

  const handleIncrement = () => {
    setCount(prev => Math.min(prev + 1, 20));
  };

  const handleDecrement = () => {
    setCount(prev => Math.max(prev - 1, 1));
  };

  const handleConfirm = () => {
    onConfirm(count);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {isEditing ? "تعديل عدد الأشخاص" : "تحديد عدد الأشخاص"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex items-center justify-center gap-4 py-6">
          <Button
            variant="outline"
            size="icon"
            onClick={handleDecrement}
            disabled={count <= 1}
          >
            <Minus className="w-4 h-4" />
          </Button>
          
          <Input
            type="number"
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
            className="w-20 text-center text-lg"
            min={1}
            max={20}
          />
          
          <Button
            variant="outline"
            size="icon"
            onClick={handleIncrement}
            disabled={count >= 20}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
          <Button onClick={handleConfirm}>تأكيد</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
