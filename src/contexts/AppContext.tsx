import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, MenuItem, Order, Table, OrderItem, SystemSettings, PrinterType } from '../types';
import { mockUsers, mockMenuItems, mockOrders, mockTables, mockDepartments, mockPrinters } from '../data/mockData';
import { toast } from "sonner";

interface AppContextType {
  user: User | null;
  menuItems: MenuItem[];
  orders: Order[];
  tables: Table[];
  printers: PrinterType[];
  hasNewOrders: boolean;
  systemSettings: SystemSettings;
  login: (username: string, password: string) => boolean;
  loginAsWaiter: () => boolean;
  loginAsScreen: () => boolean;
  logout: () => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
  createOrder: (order: Omit<Order, 'id' | 'createdAt' | 'waiterName'>) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updateItemCompletionStatus: (orderId: string, menuItemId: string, completed: boolean) => void;
  getFilteredOrders: (status?: Order['status']) => Order[];
  getTablesStatus: () => Table[];
  updateTablePeopleCount: (tableId: number, peopleCount: number) => void;
  clearNewOrdersNotification: () => void;
  updatePerSeatCharge: (amount: number) => void;
  togglePerSeatChargeEnabled: (enabled: boolean) => void;
  delayOrder: (orderId: string, reason: string) => void;
  cancelOrderItem: (orderId: string, menuItemId: string) => void;
  getMostOrderedItems: (count?: number) => MenuItem[];
  markTableAsPaid: (tableId: number) => void;
  toggleTableReservation: (tableId: number, isReserved: boolean) => void;
  updatePrinterSettings: (printer: PrinterType) => void;
  getOrdersByTable: () => Record<number, Order[]>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems);
  const [orders, setOrders] = useState<Order[]>(mockOrders.map(order => ({
    ...order,
    peopleCount: order.peopleCount || 1,
    items: order.items.map(item => ({ ...item, completed: false }))
  })));
  const [tables, setTables] = useState<Table[]>(mockTables);
  const [printers, setPrinters] = useState<PrinterType[]>(mockPrinters);
  const [hasNewOrders, setHasNewOrders] = useState<boolean>(false);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    perSeatCharge: 2,
    enablePerSeatCharge: false,
    emergencyMode: false,
    backupPrinterEnabled: false,
    backupPhoneEnabled: false
  });
  const [orderStats, setOrderStats] = useState<{[key: string]: number}>({});

  // Calculate order statistics on mount and when orders change
  useEffect(() => {
    const stats: {[key: string]: number} = {};
    
    // Count all ordered menu items
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!stats[item.menuItemId]) {
          stats[item.menuItemId] = 0;
        }
        stats[item.menuItemId] += item.quantity;
      });
    });
    
    setOrderStats(stats);
  }, [orders]);

  // Function to clear new orders notification
  const clearNewOrdersNotification = () => {
    setHasNewOrders(false);
  };

  const login = (username: string, password: string): boolean => {
    // Only allow admin login with correct password
    if (username === 'admin' && password === 'admin123') {
      const adminUser = mockUsers.find(u => u.username === 'admin');
      if (adminUser) {
        setUser(adminUser);
        toast.success(`مرحباً ${adminUser.name}`, {
          description: "تم تسجيل الدخول بنجاح"
        });
        return true;
      }
    }
    
    // Allow waiter login with PIN
    const waiterMatch = /^10[0-9]$/.exec(username);
    if (waiterMatch && password === "0000") {
      const waiterNumber = parseInt(username.substring(2));
      const waiterUser = mockUsers.find(u => u.username === `waiter${waiterNumber}`);
      
      if (waiterUser) {
        setUser(waiterUser);
        toast.success(`مرحباً ${waiterUser.name}`, {
          description: "تم تسجيل الدخول بنجاح"
        });
        return true;
      }
    }
    
    toast.error("فشل تسجيل الدخول", {
      description: "اسم المستخدم أو كلمة المرور غير صحيحة"
    });
    return false;
  };

  // Login for waiter
  const loginAsWaiter = (): boolean => {
    const waiterUser = mockUsers.find(u => u.username === 'waiter1');
    if (waiterUser) {
      setUser(waiterUser);
      toast.success(`مرحباً ${waiterUser.name}`, {
        description: "ت�� تسجيل الدخول بنجاح"
      });
      return true;
    }
    return false;
  };

  // Screen login function
  const loginAsScreen = (): boolean => {
    const screenUser = mockUsers.find(u => u.username === 'screen1');
    if (screenUser) {
      setUser(screenUser);
      toast.success(`تم تشغيل شاشة المطبخ`, {
        description: "تم تسجيل الدخول بنجاح"
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    toast.info("تم تسجيل الخروج بنجاح");
  };

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

  const createOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'waiterName'>) => {
    if (!user) return;
    
    const waiter = mockUsers.find(u => u.id === orderData.waiterId);
    if (!waiter) return;
    
    // Add completed: false to each order item
    const orderItemsWithCompletionStatus = orderData.items.map(item => ({
      ...item,
      completed: false
    }));
    
    const newOrder: Order = {
      ...orderData,
      id: `order-${Date.now()}`,
      createdAt: new Date(),
      waiterName: waiter.name,
      items: orderItemsWithCompletionStatus,
      peopleCount: orderData.peopleCount || tables.find(t => t.id === orderData.tableNumber)?.peopleCount || 1,
      delayed: false,
      isPaid: false
    };
    
    setOrders([...orders, newOrder]);
    
    // Update table status and people count
    setTables(tables.map(table => 
      table.id === orderData.tableNumber 
        ? { 
            ...table, 
            isOccupied: true, 
            currentOrderId: newOrder.id,
            peopleCount: orderData.peopleCount || table.peopleCount || 1
          }
        : table
    ));
    
    // Set notification for screen users
    setHasNewOrders(true);
    
    toast.success("تم إنشاء الطلب بنجاح", {
      description: `طلب جديد للطاولة ${orderData.tableNumber}`
    });
    
    // If emergency mode is on, handle backup procedures
    if (systemSettings.emergencyMode) {
      if (systemSettings.backupPrinterEnabled) {
        toast.info("تم إرسال الطلب إلى الطابعة الاحتياطية", {
          description: "نظام الطوارئ مفعل"
        });
      }
      
      if (systemSettings.backupPhoneEnabled) {
        toast.info("تم إرسال إشعار إلى تطبيق الطهاة", {
          description: "نظام الطوارئ مفعل"
        });
      }
    }
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, status, updatedAt: new Date() } 
        : order
    ));
    
    // If status is delivered, free up the table
    if (status === 'delivered') {
      setTables(tables.map(table => 
        table.currentOrderId === orderId
          ? { ...table, isOccupied: false, currentOrderId: undefined }
          : table
      ));
    }
    
    toast.success("تم تحديث حالة الطلب", {
      description: `تم تغيير حالة الطلب إلى ${status === 'pending' ? 'معلق' : 
        status === 'preparing' ? 'قيد التحضير' : 
        status === 'ready' ? 'جاهز' : 
        status === 'delivered' ? 'تم التسليم' : 'ملغى'}`
    });
  };

  // New function to update item completion status
  const updateItemCompletionStatus = (orderId: string, menuItemId: string, completed: boolean) => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        const updatedItems = order.items.map(item => 
          item.menuItemId === menuItemId ? { ...item, completed } : item
        );
        
        // Check if all items are completed
        const allCompleted = updatedItems.every(item => item.completed);
        
        // If all items are completed, automatically set order status to ready
        const newStatus = allCompleted ? 'ready' : order.status;
        
        return { 
          ...order, 
          items: updatedItems,
          status: newStatus === 'pending' ? 'preparing' : newStatus,
          updatedAt: new Date()
        };
      }
      return order;
    }));
    
    toast.success(completed ? "تم الانتهاء من تحضير العنصر" : "تمت إعادة العنصر للتحضير");
  };

  // New function to delay an order
  const delayOrder = (orderId: string, reason: string) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, delayed: true, delayReason: reason, updatedAt: new Date() } 
        : order
    ));
    
    toast.info("تم تحديث حالة الطلب", {
      description: "تم تأجيل الطلب وإرسال إشعار للنادل"
    });
  };
  
  // New function to cancel a specific order item
  const cancelOrderItem = (orderId: string, menuItemId: string) => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        // Filter out the canceled item
        const updatedItems = order.items.filter(item => item.menuItemId !== menuItemId);
        
        // If no items are left, mark order as canceled
        if (updatedItems.length === 0) {
          // Free up the table if this is the current order
          setTables(tables.map(table => 
            table.currentOrderId === orderId
              ? { ...table, isOccupied: false, currentOrderId: undefined }
              : table
          ));
          
          return { ...order, status: 'canceled', items: [], updatedAt: new Date() };
        }
        
        return { ...order, items: updatedItems, updatedAt: new Date() };
      }
      return order;
    }));
    
    toast.success("تم إلغاء العنصر من الطلب");
  };
  
  const updateTablePeopleCount = (tableId: number, peopleCount: number) => {
    setTables(tables.map(table => 
      table.id === tableId 
        ? { ...table, peopleCount } 
        : table
    ));

    // Also update any active order for this table
    const tableOrder = orders.find(o => 
      o.tableNumber === tableId && 
      (o.status === 'pending' || o.status === 'preparing' || o.status === 'ready')
    );

    if (tableOrder) {
      setOrders(orders.map(order => 
        order.id === tableOrder.id 
          ? { ...order, peopleCount } 
          : order
      ));
    }
    
    toast.success(`تم تحديث عدد الأشخاص للطاولة ${tableId} إلى ${peopleCount}`);
  };
  
  // New function to mark a table order as paid
  const markTableAsPaid = (tableId: number) => {
    // Find the active order for this table
    const tableOrder = orders.find(o => 
      o.tableNumber === tableId && 
      (o.status === 'pending' || o.status === 'preparing' || o.status === 'ready' || o.status === 'delivered')
    );
    
    if (tableOrder) {
      // Update the order to mark it as paid
      setOrders(orders.map(order => 
        order.id === tableOrder.id 
          ? { ...order, isPaid: true } 
          : order
      ));
      
      toast.success(`تم تسجيل الدفع للطاولة ${tableId}`);
    } else {
      toast.error(`لا يوجد طلب نشط للطاولة ${tableId}`);
    }
  };
  
  // New function to toggle table reservation
  const toggleTableReservation = (tableId: number, isReserved: boolean) => {
    setTables(tables.map(table => 
      table.id === tableId 
        ? { ...table, isReserved } 
        : table
    ));
    
    if (isReserved) {
      toast.success(`تم حجز الطاولة ${tableId}`);
    } else {
      toast.success(`تم إلغاء حجز الطاولة ${tableId}`);
    }
  };
  
  // New function to update printer settings
  const updatePrinterSettings = (printer: PrinterType) => {
    setPrinters(printers.map(p => 
      p.id === printer.id 
        ? printer
        : p
    ));
    
    toast.success(`تم تحديث إعدادات الطابعة ${printer.name}`);
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

  // System settings functions
  const updatePerSeatCharge = (amount: number) => {
    setSystemSettings({...systemSettings, perSeatCharge: amount});
    toast.success(`تم تحديث رسوم المقعد إلى ${amount} ريال`);
  };

  const togglePerSeatChargeEnabled = (enabled: boolean) => {
    setSystemSettings({...systemSettings, enablePerSeatCharge: enabled});
    toast.success(enabled ? "تم تفعيل رسوم المقعد" : "تم إيقاف رسوم المقعد");
  };

  const getFilteredOrders = (status?: Order['status']) => {
    if (!status) return orders;
    return orders.filter(order => order.status === status);
  };

  const getTablesStatus = () => tables;

  const contextValue: AppContextType = {
    user,
    menuItems,
    orders,
    tables,
    printers,
    hasNewOrders,
    systemSettings,
    login,
    loginAsWaiter,
    loginAsScreen,
    logout,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    createOrder,
    updateOrderStatus,
    updateItemCompletionStatus,
    getFilteredOrders,
    getTablesStatus,
    updateTablePeopleCount,
    clearNewOrdersNotification,
    updatePerSeatCharge,
    togglePerSeatChargeEnabled,
    delayOrder,
    cancelOrderItem,
    getMostOrderedItems,
    markTableAsPaid,
    toggleTableReservation,
    updatePrinterSettings,
    getOrdersByTable
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
