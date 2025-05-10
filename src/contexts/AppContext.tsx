
import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { Department } from '../types';
import { mockDepartments } from '../data/mockData';
import { AppContextType } from './types';
// Fix: Use correct relative import paths for hooks
import { useAuth } from './hooks/useAuth';
import { useMenu } from './hooks/useMenu';
import { useTables } from './hooks/useTables';
import { useSettings } from './hooks/useSettings';
import { useOrders } from './hooks/useOrders';
import { Order } from '../types';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const tables = useTables();
  const settings = useSettings();
  const menu = useMenu();

  // Update order stats when orders change
  const updateOrderStats = useCallback((orders: Order[]) => {
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
    
    menu.setOrderStats(stats);
  }, [menu]);

  const orders = useOrders(tables, updateOrderStats);
  
  const departments = mockDepartments;

  const contextValue: AppContextType = {
    user: auth.user,
    menuItems: menu.menuItems,
    orders: orders.orders,
    tables: tables.tables,
    printers: settings.printers,
    departments,
    hasNewOrders: orders.hasNewOrders,
    systemSettings: settings.systemSettings,
    login: auth.login,
    loginAsWaiter: auth.loginAsWaiter,
    loginAsScreen: auth.loginAsScreen,
    loginAsDrinksScreen: auth.loginAsDrinksScreen,
    logout: auth.logout,
    addMenuItem: menu.addMenuItem,
    updateMenuItem: menu.updateMenuItem,
    deleteMenuItem: menu.deleteMenuItem,
    // Fix: Pass waiterId and systemSettings separately instead of user object
    createOrder: (orderData) => orders.createOrder({
      ...orderData,
      waiterId: auth.user?.id,
      waiterRole: auth.user?.role
    }),
    updateOrderStatus: orders.updateOrderStatus,
    updateItemCompletionStatus: orders.updateItemCompletionStatus,
    getFilteredOrders: orders.getFilteredOrders,
    getTablesStatus: tables.getTablesStatus,
    updateTablePeopleCount: tables.updateTablePeopleCount,
    clearNewOrdersNotification: orders.clearNewOrdersNotification,
    updatePerSeatCharge: settings.updatePerSeatCharge,
    togglePerSeatChargeEnabled: settings.togglePerSeatChargeEnabled,
    toggleEmergencyMode: settings.toggleEmergencyMode,
    toggleBackupPrinterEnabled: settings.toggleBackupPrinterEnabled,
    toggleBackupPhoneEnabled: settings.toggleBackupPhoneEnabled,
    delayOrder: orders.delayOrder,
    cancelOrderItem: orders.cancelOrderItem,
    getMostOrderedItems: menu.getMostOrderedItems,
    markTableAsPaid: orders.markTableAsPaid,
    toggleTableReservation: tables.toggleTableReservation,
    updatePrinterSettings: settings.updatePrinterSettings,
    getOrdersByTable: orders.getOrdersByTable,
    resetTable: orders.resetTable
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
