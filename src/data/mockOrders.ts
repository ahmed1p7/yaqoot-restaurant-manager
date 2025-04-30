
import { Order } from '../types';

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
    notes: 'زبون منتظم',
    isPaid: false
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
    isPaid: false
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
    isPaid: true
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
    isPaid: false
  }
];
