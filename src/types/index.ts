
export type User = {
  id: string;
  name: string;
  username: string;
  role: 'admin' | 'waiter' | 'screen';
  avatar?: string;
  pin?: string; // Added PIN for login
};

export type MenuCategory = 'appetizers' | 'main_dishes' | 'sides' | 'desserts' | 'drinks';

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  image?: string;
  isAvailable: boolean;
  departmentId?: string; // Which department prepares this item
};

export type OrderItem = {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  completed: boolean;
  canceled?: boolean;
};

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'canceled';

export type Order = {
  id: string;
  tableNumber: number;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: Date;
  updatedAt?: Date;
  totalAmount: number;
  waiterId: string;
  waiterName: string;
  notes?: string;
  peopleCount?: number;
  delayed?: boolean;
  delayReason?: string;
  isPaid?: boolean; // New field to track payment status
};

export type Table = {
  id: number;
  name: string;
  capacity: number;
  isOccupied: boolean;
  currentOrderId?: string;
  peopleCount?: number;
  emergency?: boolean;
  isReserved?: boolean; // New field to track reservation status
};

export type SystemSettings = {
  perSeatCharge: number;
  enablePerSeatCharge: boolean;
  emergencyMode?: boolean;
  backupPrinterEnabled?: boolean;
  backupPhoneEnabled?: boolean;
};

export type DepartmentType = {
  id: string;
  name: string;
  description: string;
};

export type PrinterType = {
  id: string;
  name: string;
  ip: string;
  isActive: boolean;
  departmentId?: string;
  isBackup?: boolean;
};
