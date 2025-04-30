
export type UserRole = 'admin' | 'waiter' | 'screen';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
}

export interface UserWithDetails extends User {
  email: string;
  department?: string;
  access?: string[];
}

export type MenuCategory = 
  | 'appetizers' 
  | 'main_dishes'
  | 'desserts'
  | 'drinks'
  | 'sides';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  image?: string;
  isAvailable: boolean;
}

export type OrderStatus = 
  | 'pending' 
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  completed?: boolean; // Track if this specific item has been prepared
}

export interface Order {
  id: string;
  tableNumber: number;
  peopleCount: number; // Number of people at the table
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  waiterId: string;
  waiterName: string;
  createdAt: Date;
  updatedAt?: Date;
  notes?: string;
}

export interface Table {
  id: number;
  name: string;
  isOccupied: boolean;
  currentOrderId?: string;
  peopleCount?: number; // Store the people count with the table
}

export interface DepartmentType {
  id: string;
  name: string;
  description?: string;
}

export interface Stats {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  topSellingItems: { name: string; count: number }[];
  busyHours: { hour: number; count: number }[];
}

export interface SystemSettings {
  perSeatCharge: number; // Amount charged per person
  enablePerSeatCharge: boolean;
}
