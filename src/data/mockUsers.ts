
import { User } from '../types';

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
