
export type User = {
  id: string;
  name: string;
  username: string;
  role: 'admin' | 'waiter' | 'screen';
  avatar?: string;
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
};

export type Table = {
  id: number;
  name: string;
  capacity: number;
  isOccupied: boolean;
  currentOrderId?: string;
  peopleCount?: number;
  emergency?: boolean;
};

export type SystemSettings = {
  perSeatCharge: number;
  enablePerSeatCharge: boolean;
  emergencyMode?: boolean;
  backupPrinterEnabled?: boolean;
  backupPhoneEnabled?: boolean;
};
