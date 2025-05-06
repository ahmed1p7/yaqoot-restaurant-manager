
import React from "react";
import { Button } from "@/components/ui/button";
import { MenuItem } from "@/types";

interface QuickOrderBarProps {
  items: MenuItem[];
  onAddItem: (item: MenuItem) => void;
}

export const QuickOrderBar: React.FC<QuickOrderBarProps> = ({ 
  items,
  onAddItem
}) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="bg-gray-50 p-2 rounded-md flex items-center gap-2 overflow-x-auto mb-4">
      <span className="text-sm font-medium min-w-max">طلبات سريعة:</span>
      {items.map(item => (
        <Button 
          key={item.id} 
          variant="outline" 
          size="sm"
          className="min-w-max"
          onClick={() => onAddItem(item)}
        >
          {item.name}
        </Button>
      ))}
    </div>
  );
};
