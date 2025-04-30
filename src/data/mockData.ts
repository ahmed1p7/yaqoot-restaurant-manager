
import { User, MenuItem, Order, Table, DepartmentType } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    name: 'محمد المدير',
    role: 'admin',
    pin: '1234'
  },
  {
    id: '2',
    username: 'waiter1',
    name: 'أحمد النادل',
    role: 'waiter',
    pin: '101'
  },
  {
    id: '3',
    username: 'waiter2',
    name: 'خالد النادل',
    role: 'waiter',
    pin: '102'
  },
  {
    id: '4',
    username: 'screen1',
    name: 'شاشة المطبخ',
    role: 'screen',
    pin: '999'
  }
];

export const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'سلطة البيت',
    description: 'سلطة طازجة مع خضروات موسمية وصلصة خاصة',
    price: 25,
    category: 'appetizers',
    image: '/placeholder.svg',
    isAvailable: true,
    departmentId: '1'
  },
  {
    id: '2',
    name: 'حمص',
    description: 'حمص مطحون مع طحينة وزيت زيتون',
    price: 15,
    category: 'appetizers',
    image: '/placeholder.svg',
    isAvailable: true,
    departmentId: '1'
  },
  {
    id: '3',
    name: 'شوربة عدس',
    description: 'شوربة عدس تقليدية مع خبز محمص',
    price: 18,
    category: 'appetizers',
    image: '/placeholder.svg',
    isAvailable: true,
    departmentId: '1'
  },
  {
    id: '4',
    name: 'مشاوي مشكلة',
    description: 'تشكيلة من اللحوم المشوية مع أرز وخضار',
    price: 85,
    category: 'main_dishes',
    image: '/placeholder.svg',
    isAvailable: true,
    departmentId: '1'
  },
  {
    id: '5',
    name: 'دجاج مشوي',
    description: 'نصف دجاجة مشوية متبلة مع بطاطا',
    price: 65,
    category: 'main_dishes',
    image: '/placeholder.svg',
    isAvailable: true,
    departmentId: '1'
  },
  {
    id: '6',
    name: 'سمك مشوي',
    description: 'سمك طازج مشوي مع صلصة الليمون',
    price: 90,
    category: 'main_dishes',
    image: '/placeholder.svg',
    isAvailable: true,
    departmentId: '1'
  },
  {
    id: '7',
    name: 'كنافة',
    description: 'كنافة بالجبن مع قطر',
    price: 30,
    category: 'desserts',
    image: '/placeholder.svg',
    isAvailable: true,
    departmentId: '3'
  },
  {
    id: '8',
    name: 'أم علي',
    description: 'حلوى أم علي الساخنة بالمكسرات',
    price: 25,
    category: 'desserts',
    image: '/placeholder.svg',
    isAvailable: true,
    departmentId: '3'
  },
  {
    id: '9',
    name: 'عصير برتقال',
    description: 'عصير برتقال طازج',
    price: 15,
    category: 'drinks',
    image: '/placeholder.svg',
    isAvailable: true,
    departmentId: '2'
  },
  {
    id: '10',
    name: 'قهوة عربية',
    description: 'قهوة عربية تقليدية',
    price: 10,
    category: 'drinks',
    image: '/placeholder.svg',
    isAvailable: true,
    departmentId: '2'
  },
  {
    id: '11',
    name: 'شاي',
    description: 'شاي مغربي بالنعناع',
    price: 8,
    category: 'drinks',
    image: '/placeholder.svg',
    isAvailable: true,
    departmentId: '2'
  },
  {
    id: '12',
    name: 'بطاطا مقلية',
    description: 'بطاطا مقلية مقرمشة',
    price: 18,
    category: 'sides',
    image: '/placeholder.svg',
    isAvailable: true,
    departmentId: '1'
  }
];

export const mockTables: Table[] = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  name: `طاولة ${i + 1}`,
  capacity: Math.floor(Math.random() * 6) + 2, // Capacity between 2-8
  isOccupied: Math.random() > 0.7,
  currentOrderId: Math.random() > 0.7 ? `order-${i+1}` : undefined,
  peopleCount: Math.floor(Math.random() * 5) + 1 // Add random people count between 1-5
}));

export const mockOrders: Order[] = [
  {
    id: 'order-1',
    tableNumber: 3,
    peopleCount: 4,
    items: [
      { menuItemId: '1', name: 'سلطة البيت', price: 25, quantity: 1, completed: false },
      { menuItemId: '4', name: 'مشاوي مشكلة', price: 85, quantity: 2, notes: 'بدون بصل', completed: false },
      { menuItemId: '9', name: 'عصير برتقال', price: 15, quantity: 2, completed: false }
    ],
    status: 'preparing',
    totalAmount: 25 + (85 * 2) + (15 * 2),
    waiterId: '2',
    waiterName: 'أحمد النادل',
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    notes: 'زبون منتظم'
  },
  {
    id: 'order-2',
    tableNumber: 5,
    peopleCount: 2,
    items: [
      { menuItemId: '2', name: 'حمص', price: 15, quantity: 1, completed: false },
      { menuItemId: '5', name: 'دجاج مشوي', price: 65, quantity: 1, completed: false },
      { menuItemId: '11', name: 'شاي', price: 8, quantity: 2, completed: false }
    ],
    status: 'ready',
    totalAmount: 15 + 65 + (8 * 2),
    waiterId: '3',
    waiterName: 'خالد النادل',
    createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
  },
  {
    id: 'order-3',
    tableNumber: 8,
    peopleCount: 1,
    items: [
      { menuItemId: '6', name: 'سمك مشوي', price: 90, quantity: 1, completed: false },
      { menuItemId: '12', name: 'بطاطا مقلية', price: 18, quantity: 1, completed: false },
      { menuItemId: '9', name: 'عصير برتقال', price: 15, quantity: 1, completed: false }
    ],
    status: 'delivered',
    totalAmount: 90 + 18 + 15,
    waiterId: '2',
    waiterName: 'أحمد النادل',
    createdAt: new Date(Date.now() - 1000 * 60 * 60), // 60 mins ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
  },
  {
    id: 'order-4',
    tableNumber: 10,
    peopleCount: 3,
    items: [
      { menuItemId: '7', name: 'كنافة', price: 30, quantity: 2, completed: false },
      { menuItemId: '10', name: 'قهوة عربية', price: 10, quantity: 2, completed: false }
    ],
    status: 'pending',
    totalAmount: (30 * 2) + (10 * 2),
    waiterId: '3',
    waiterName: 'خالد النادل',
    createdAt: new Date(), // just now
  }
];

export const mockDepartments: DepartmentType[] = [
  {
    id: '1',
    name: 'المطبخ الرئيسي',
    description: 'تحضير الأطباق الرئيسية'
  },
  {
    id: '2',
    name: 'قسم المشروبات',
    description: 'تحضير المشروبات والعصائر'
  },
  {
    id: '3',
    name: 'قسم الحلويات',
    description: 'تحضير الحلويات والتحلية'
  }
];
