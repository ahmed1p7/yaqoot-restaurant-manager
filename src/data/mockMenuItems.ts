
import { MenuItem } from '../types';

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
