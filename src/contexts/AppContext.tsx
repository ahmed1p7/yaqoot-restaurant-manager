
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, MenuItem, Order, Table, OrderItem, SystemSettings } from '../types';
import { mockUsers, mockMenuItems, mockOrders, mockTables } from '../data/mockData';
import { toast } from "sonner";

interface AppContextType {
  user: User | null;
  menuItems: MenuItem[];
  orders: Order[];
  tables: Table[];
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
  const [hasNewOrders, setHasNewOrders] = useState<boolean>(false);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    perSeatCharge: 2,
    enablePerSeatCharge: false
  });

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
        description: "تم تسجيل الدخول بنجاح"
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
      peopleCount: orderData.peopleCount || tables.find(t => t.id === orderData.tableNumber)?.peopleCount || 1
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
    togglePerSeatChargeEnabled
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
