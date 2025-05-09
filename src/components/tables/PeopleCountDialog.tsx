
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, Users } from "lucide-react";
import { toast } from "sonner";
import { PeopleCountSlider } from "./PeopleCountSlider";

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
  const [count, setCount] = useState<number>(currentCount || 0);
  
  // Reset count when dialog opens with new currentCount
  useEffect(() => {
    if (isOpen) {
      setCount(currentCount);
    }
  }, [isOpen, currentCount]);

  const handleConfirm = () => {
    if (count === 0) {
      toast.error("يجب تحديد عدد الأشخاص");
      return;
    }
    onConfirm(count);
    onClose();
    
    const message = isEditing 
      ? `تم تحديث عدد الأشخاص إلى ${count}`
      : `تم تحديد عدد الأشخاص: ${count}`;
      
    toast.success(message);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5" />
            {isEditing ? "تعديل عدد الأشخاص" : "تحديد عدد الأشخاص"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center gap-4 py-6">
          <PeopleCountSlider
            currentCount={count}
            onChange={setCount}
            max={100}
          />
        </div>
        
        <DialogFooter className="gap-2 flex-row sm:justify-between">
          <Button variant="outline" onClick={onClose} className="flex-1">إلغاء</Button>
          <Button onClick={handleConfirm} disabled={count === 0} className="flex-1">
            تأكيد
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
