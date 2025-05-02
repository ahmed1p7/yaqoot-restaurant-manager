
import { User } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'المدير',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    isActive: true
  },
  {
    id: '2',
    name: 'أحمد النادل',
    username: 'waiter1',
    password: '0000',
    role: 'waiter',
    isActive: true
  },
  {
    id: '3',
    name: 'خالد النادل',
    username: 'waiter2',
    password: '0000',
    role: 'waiter',
    isActive: true
  },
  {
    id: '4',
    name: 'سعيد النادل',
    username: 'waiter3',
    password: '0000',
    role: 'waiter',
    isActive: false
  },
  {
    id: '5',
    name: 'شاشة المطبخ',
    username: 'screen1',
    password: '0000',
    role: 'screen',
    isActive: true
  },
  {
    id: '6',
    name: 'شاشة المشروبات',
    username: 'drinks1',
    password: '0000',
    role: 'drinks',
    isActive: true
  }
];
