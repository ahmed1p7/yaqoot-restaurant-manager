
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
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

  const handleConfirm = () => {
    if (count === 0) {
      toast.error("يجب تحديد عدد الأشخاص");
      return;
    }
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
        
        <div className="flex flex-col items-center justify-center gap-4 py-6">
          <PeopleCountSlider
            currentCount={currentCount}
            onChange={setCount}
            max={100}
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
          <Button onClick={handleConfirm} disabled={count === 0}>تأكيد</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
