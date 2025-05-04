
import { Table } from '../types';

export const mockTables: Table[] = Array.from({ length: 15 }, (_, i) => {
  const isOccupied = Math.random() > 0.7;
  const isReserved = !isOccupied && Math.random() > 0.8;
  
  return {
    id: i + 1,
    name: `طاولة ${i + 1}`,
    capacity: Math.floor(Math.random() * 6) + 2, // Capacity between 2-8
    isOccupied: isOccupied,
    currentOrderId: isOccupied ? `order-${i+1}` : undefined,
    peopleCount: isOccupied ? Math.floor(Math.random() * 5) + 1 : 0, // People count only for occupied tables
    isReserved: isReserved, // Only allow reservation if not occupied
    emergency: false // Default not in emergency state
  };
});
