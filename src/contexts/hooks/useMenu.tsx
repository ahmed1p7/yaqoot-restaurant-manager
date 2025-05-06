
import { useState } from 'react';
import { MenuItem } from '../../types';
import { mockMenuItems } from '../../data/mockData';
import { toast } from "sonner";

export const useMenu = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems);
  const [orderStats, setOrderStats] = useState<{[key: string]: number}>({});

  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem = {
      ...item,
      id: `menu-${Date.now()}`
    };
    setMenuItems([...menuItems, newItem]);
    toast.success("تمت الإضافة بنجاح", {
      description: `تمت إضافة ${item.name} إلى القائمة`
    });
  };

  const updateMenuItem = (item: MenuItem) => {
    setMenuItems(menuItems.map(menuItem => 
      menuItem.id === item.id ? item : menuItem
    ));
    toast.success("تم التحديث بنجاح", {
      description: `تم تحديث معلومات ${item.name}`
    });
  };

  const deleteMenuItem = (id: string) => {
    const itemToDelete = menuItems.find(item => item.id === id);
    setMenuItems(menuItems.filter(item => item.id !== id));
    if (itemToDelete) {
      toast.success("تم الحذف بنجاح", {
        description: `تم حذف ${itemToDelete.name} من القائمة`
      });
    }
  };

  // Get most ordered menu items
  const getMostOrderedItems = (count: number = 5): MenuItem[] => {
    // Create array of [menuItemId, orderCount] pairs
    const orderedItemsArray = Object.entries(orderStats);
    
    // Sort by count in descending order
    const sortedItems = orderedItemsArray.sort((a, b) => b[1] - a[1]);
    
    // Get the top N item IDs
    const topItemIds = sortedItems.slice(0, count).map(item => item[0]);
    
    // Return the actual MenuItem objects
    return menuItems
      .filter(item => topItemIds.includes(item.id))
      .sort((a, b) => {
        // Sort by the same order as topItemIds
        return orderStats[b.id] - orderStats[a.id];
      })
      .slice(0, count);
  };

  return {
    menuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getMostOrderedItems,
    orderStats,
    setOrderStats
  };
};
