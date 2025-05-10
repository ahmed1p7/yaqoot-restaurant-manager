
import { User, MenuItem, Order, Table, OrderItem, SystemSettings, PrinterType, Department } from '../types';

export interface AppContextType {
  user: User | null;
  menuItems: MenuItem[];
  orders: Order[];
  tables: Table[];
  printers: PrinterType[];
  departments: Department[];
  hasNewOrders: boolean;
  systemSettings: SystemSettings;
  login: (username: string, password: string) => boolean;
  loginAsWaiter: () => boolean;
  loginAsScreen: () => boolean;
  loginAsDrinksScreen: () => boolean;
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
  toggleEmergencyMode: (enabled: boolean) => void;
  toggleBackupPrinterEnabled: (enabled: boolean) => void;
  toggleBackupPhoneEnabled: (enabled: boolean) => void;
  delayOrder: (orderId: string, reason: string) => void;
  cancelOrderItem: (orderId: string, menuItemId: string) => void;
  getMostOrderedItems: (count?: number) => MenuItem[];
  markTableAsPaid: (tableId: number) => void;
  toggleTableReservation: (tableId: number, isReserved: boolean) => void;
  updatePrinterSettings: (printer: PrinterType) => void;
  getOrdersByTable: () => Record<number, Order[]>;
  resetTable: (tableId: number) => void;
}
