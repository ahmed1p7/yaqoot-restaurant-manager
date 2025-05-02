
// User types
export interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: 'admin' | 'waiter' | 'screen' | 'drinks';
  isActive: boolean;
}

// Menu Item types
export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category: MenuCategory;
  isAvailable: boolean;
  departmentId: string;
}

export type MenuCategory = 'appetizers' | 'main_dishes' | 'desserts' | 'drinks' | 'sides';

// Order types
export interface Order {
  id: string;
  tableNumber: number;
  waiterId: string;
  waiterName: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  createdAt: Date;
  updatedAt?: Date;
  notes?: string;
  peopleCount: number;
  delayed: boolean;
  delayReason?: string;
  isPaid: boolean;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'canceled';

// Order Item types
export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  completed: boolean;
}

// Table types
export interface Table {
  id: number;
  name: string;
  capacity: number;
  isOccupied: boolean;
  currentOrderId?: string;
  peopleCount?: number;
  isReserved: boolean;
  emergency: boolean;
}

// Department types
export interface Department {
  id: string;
  name: string;
  description?: string;
}

// System Settings types
export interface SystemSettings {
  perSeatCharge: number;
  enablePerSeatCharge: boolean;
  emergencyMode: boolean;
  backupPrinterEnabled: boolean;
  backupPhoneEnabled: boolean;
}

// Printer types
export interface PrinterType {
  id: string;
  name: string;
  model: string;
  connectionType: 'network' | 'usb' | 'bluetooth';
  address: string;
  isActive: boolean;
  departmentId: string;
  ip: string;
  isBackup?: boolean;
}
