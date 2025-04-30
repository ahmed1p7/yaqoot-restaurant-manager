
import { PrinterType } from '../types';

export const mockPrinters: PrinterType[] = [
  {
    id: '1',
    name: 'طابعة المطبخ الرئيسية',
    ip: '192.168.1.100',
    isActive: true,
    departmentId: '1'
  },
  {
    id: '2',
    name: 'طابعة المشروبات',
    ip: '192.168.1.101',
    isActive: true,
    departmentId: '2'
  },
  {
    id: '3',
    name: 'طابعة الحلويات',
    ip: '192.168.1.102',
    isActive: true,
    departmentId: '3'
  },
  {
    id: '4',
    name: 'طابعة الطوارئ',
    ip: '192.168.1.200',
    isActive: false,
    isBackup: true
  }
];
