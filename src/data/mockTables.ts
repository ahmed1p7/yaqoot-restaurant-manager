
import { Table } from '../types';

export const mockTables: Table[] = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  name: `طاولة ${i + 1}`,
  capacity: Math.floor(Math.random() * 6) + 2, // Capacity between 2-8
  isOccupied: Math.random() > 0.7,
  currentOrderId: Math.random() > 0.7 ? `order-${i+1}` : undefined,
  peopleCount: Math.floor(Math.random() * 5) + 1, // Add random people count between 1-5
  isReserved: Math.random() > 0.8 // Add random reservation status
}));
