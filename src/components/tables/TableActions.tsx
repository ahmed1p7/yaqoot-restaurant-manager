
import React, { useState } from "react";
import { Table, Order } from "@/types";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { AlertTriangle, User, Check } from "lucide-react";
import { PeopleCountDialog } from "./PeopleCountDialog";
import { Badge } from "@/components/ui/badge";

interface TableActionsProps {
  table: Table;
  currentOrder?: Order;
  onCreateOrder: (tableId: number) => void;
  isAdmin?: boolean;
  triggerEmergency?: (tableId: number) => void;
}

export const TableActions: React.FC<TableActionsProps> = ({
  table,
  currentOrder,
  onCreateOrder,
  isAdmin = false,
  triggerEmergency
}) => {
  const { updateTablePeopleCount, markTableAsPaid, toggleTableReservation } = useApp();
  
  const [isPeopleDialogOpen, setIsPeopleDialogOpen] = useState(false);
  const [isEditingPeople, setIsEditingPeople] = useState(false);
  
  const handleCreateOrder = () => {
    if (table.peopleCount) {
      onCreateOrder(table.id);
    } else {
      setIsPeopleDialogOpen(true);
    }
  };
  
  const handlePeopleCountConfirm = (count: number) => {
    updateTablePeopleCount(table.id, count);
    
    if (!isEditingPeople) {
      onCreateOrder(table.id);
    }
    
    setIsEditingPeople(false);
  };
  
  const handleMarkAsPaid = () => {
    markTableAsPaid(table.id);
  };
  
  const handleToggleReservation = () => {
    toggleTableReservation(table.id, !table.isReserved);
  };
  
  const handleEmergency = () => {
    if (triggerEmergency) {
      triggerEmergency(table.id);
    }
  };
  
  return (
    <div className="space-y-3">
      {/* People count display */}
      {table.peopleCount && table.peopleCount > 0 && (
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
      )}
      
      {/* Show reservation badge if table is reserved */}
      {table.isReserved && (
        <Badge className="w-full justify-center bg-purple-500">محجوزة</Badge>
      )}
      
      {/* Admin actions */}
      {isAdmin && (
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleReservation}
            className={table.isReserved ? "border-purple-500 text-purple-500" : ""}
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
        <>
          <Button 
            variant={table.isOccupied ? "outline" : "default"}
            size="sm" 
            onClick={handleCreateOrder}
            disabled={table.isReserved && !table.isOccupied}
            className="w-full"
          >
            {table.isOccupied ? "تعديل الطلب" : "إنشاء طلب"}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="w-full text-red-500 border-red-200"
            onClick={handleEmergency}
          >
            <AlertTriangle className="h-4 w-4 mr-1" />
            طوارئ
          </Button>
        </>
      )}
      
      {/* People Count Dialog */}
      <PeopleCountDialog
        isOpen={isPeopleDialogOpen}
        onClose={() => setIsPeopleDialogOpen(false)}
        currentCount={table.peopleCount || 1}
        onConfirm={handlePeopleCountConfirm}
        isEditing={isEditingPeople}
      />
    </div>
  );
};
