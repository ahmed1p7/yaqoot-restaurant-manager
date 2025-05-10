
import React, { useState } from "react";
import { Table, Order } from "@/types";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { User, Check } from "lucide-react";
import { PeopleCountDialog } from "./PeopleCountDialog";
import { toast } from "sonner";

interface TableActionsProps {
  table: Table;
  currentOrder?: Order;
  onCreateOrder: (tableId: number) => void;
  isAdmin?: boolean;
}

export const TableActions: React.FC<TableActionsProps> = ({
  table,
  currentOrder,
  onCreateOrder,
  isAdmin = false
}) => {
  const { updateTablePeopleCount, markTableAsPaid, toggleTableReservation } = useApp();
  
  const [isPeopleDialogOpen, setIsPeopleDialogOpen] = useState(false);
  const [isEditingPeople, setIsEditingPeople] = useState(false);
  
  const handleCreateOrder = () => {
    // If table doesn't have people count set, show the dialog
    if (!table.peopleCount || table.peopleCount === 0) {
      setIsPeopleDialogOpen(true);
    } else {
      // If there's already a people count, just create the order
      onCreateOrder(table.id);
    }
  };
  
  const handlePeopleCountConfirm = (count: number) => {
    updateTablePeopleCount(table.id, count);
    
    if (!isEditingPeople) {
      // If table is reserved, automatically remove reservation and mark as occupied
      if (table.isReserved) {
        toggleTableReservation(table.id, false);
      }
      onCreateOrder(table.id);
    }
    
    setIsEditingPeople(false);
  };
  
  const handleMarkAsPaid = () => {
    markTableAsPaid(table.id);
  };
  
  const handleToggleReservation = () => {
    // If table is occupied, don't allow reserving it
    if (table.isOccupied && !table.isReserved) {
      toast.error("لا يمكن حجز طاولة مشغولة");
      return;
    }
    
    // When reserving a table, reset its people count to 0
    if (!table.isReserved) {
      updateTablePeopleCount(table.id, 0);
    }
    
    // We're NOT creating an order here, just toggling reservation state
    toggleTableReservation(table.id, !table.isReserved);
    
    const actionMessage = table.isReserved ? 
      `تم إلغاء حجز الطاولة ${table.id}` : 
      `تم حجز الطاولة ${table.id}`;
      
    toast.success(actionMessage);
  };
  
  return (
    <div className="space-y-3">
      {/* People count display */}
      {table.peopleCount && table.peopleCount > 0 ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <User className="h-4 w-4" />
            <span>{table.peopleCount} شخص</span>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setIsEditingPeople(true);
              setIsPeopleDialogOpen(true);
            }}
            className="h-7 px-2"
          >
            تعديل
          </Button>
        </div>
      ) : null}
      
      {/* Admin actions */}
      {isAdmin && (
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleReservation}
            className={table.isReserved ? "border-purple-500 text-purple-500" : ""}
            disabled={table.isOccupied && !table.isReserved} // Prevent reserving occupied tables
          >
            {table.isReserved ? "إلغاء الحجز" : "حجز الطاولة"}
          </Button>
          
          {table.isOccupied && currentOrder && (
            <Button
              variant="default"
              size="sm"
              onClick={handleMarkAsPaid}
              disabled={currentOrder?.isPaid}
            >
              {currentOrder?.isPaid ? (
                <span className="flex items-center gap-1">
                  <Check className="h-4 w-4" /> تم الدفع
                </span>
              ) : (
                "تسجيل دفع"
              )}
            </Button>
          )}
        </div>
      )}
      
      {/* Waiter actions */}
      {!isAdmin && (
        <Button 
          variant={table.isOccupied ? "outline" : "default"}
          size="sm" 
          onClick={handleCreateOrder}
          className="w-full"
        >
          {table.isOccupied ? "تعديل الطلب" : "طلب جديد"}
        </Button>
      )}
      
      {/* People Count Dialog */}
      <PeopleCountDialog
        isOpen={isPeopleDialogOpen}
        onClose={() => setIsPeopleDialogOpen(false)}
        currentCount={table.peopleCount || 0}
        onConfirm={handlePeopleCountConfirm}
        isEditing={isEditingPeople}
      />
    </div>
  );
};
