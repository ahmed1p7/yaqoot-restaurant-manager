
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, MenuItem, Order, Table } from '../types';
import { mockUsers, mockMenuItems, mockOrders, mockTables } from '../data/mockData';
import { toast } from "sonner";

interface AppContextType {
  user: User | null;
  menuItems: MenuItem[];
  orders: Order[];
  tables: Table[];
  login: (username: string, password: string) => boolean;
  loginAsWaiter: () => boolean;
  logout: () => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
  createOrder: (order: Omit<Order, 'id' | 'createdAt' | 'waiterName'>) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  getFilteredOrders: (status?: Order['status']) => Order[];
  getTablesStatus: () => Table[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [tables, setTables] = useState<Table[]>(mockTables);

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

  // New function for quick waiter login
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
    
    const newOrder: Order = {
      ...orderData,
      id: `order-${Date.now()}`,
      createdAt: new Date(),
      waiterName: waiter.name
    };
    
    setOrders([...orders, newOrder]);
    
    // Update table status
    setTables(tables.map(table => 
      table.id === orderData.tableNumber 
        ? { ...table, isOccupied: true, currentOrderId: newOrder.id }
        : table
    ));
    
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
    login,
    loginAsWaiter,
    logout,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    createOrder,
    updateOrderStatus,
    getFilteredOrders,
    getTablesStatus
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
