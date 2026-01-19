import { MenuPage } from '@/types';

export const mockMenuPages: MenuPage[] = [
  {
    id: 'page-1',
    title: 'المقبلات',
    order: 1,
    backgroundColor: '#F9F5F0',
    items: ['1', '2', '3']
  },
  {
    id: 'page-2',
    title: 'الأطباق الرئيسية',
    order: 2,
    backgroundColor: '#F9F5F0',
    items: ['4', '5', '6']
  },
  {
    id: 'page-3',
    title: 'الحلويات',
    order: 3,
    backgroundColor: '#F9F5F0',
    items: ['7', '8']
  },
  {
    id: 'page-4',
    title: 'الأطباق الجانبية',
    order: 4,
    backgroundColor: '#F9F5F0',
    items: ['12']
  }
];

export const mockDrinksPages: MenuPage[] = [
  {
    id: 'drinks-page-1',
    title: 'المشروبات الباردة',
    order: 1,
    backgroundColor: '#F0F5F9',
    items: ['9']
  },
  {
    id: 'drinks-page-2',
    title: 'المشروبات الساخنة',
    order: 2,
    backgroundColor: '#F0F5F9',
    items: ['10', '11']
  }
];
