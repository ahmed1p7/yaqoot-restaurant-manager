
import { useState } from 'react';
import { Table } from '../../types';
import { mockTables } from '../../data/mockData';
import { toast } from "sonner";

export const useTables = () => {
  const [tables, setTables] = useState<Table[]>(mockTables);

  const updateTablePeopleCount = (tableId: number, peopleCount: number) => {
    setTables(tables.map(table => 
      table.id === tableId 
        ? { ...table, peopleCount } 
        : table
    ));
    
    toast.success(`تم تحديث عدد الأشخاص للطاولة ${tableId} إلى ${peopleCount}`);
    return tables.find(table => table.id === tableId);
  };
  
  // Function to toggle table reservation
  const toggleTableReservation = (tableId: number, isReserved: boolean) => {
    // Don't allow reserving an occupied table
    if (isReserved) {
      const targetTable = tables.find(t => t.id === tableId);
      if (targetTable && targetTable.isOccupied) {
        return;
      }
    }
    
    setTables(tables.map(table => 
      table.id === tableId 
        ? { ...table, isReserved } 
        : table
    ));
  };

  // Function to reset a table after it has been paid
  const resetTable = (tableId: number) => {
    // Find the table to reset
    const tableToReset = tables.find(t => t.id === tableId);
    if (!tableToReset) return null;

    // Reset the table in tables array
    setTables(prevTables => prevTables.map(table => 
      table.id === tableId 
        ? { 
            ...table, 
            isOccupied: false, 
            currentOrderId: undefined,
            peopleCount: 0  // Reset people count to zero when table is reset
          }
        : table
    ));

    return tableToReset;
  };

  const getTablesStatus = () => tables;

  return {
    tables,
    setTables,
    updateTablePeopleCount,
    toggleTableReservation,
    resetTable,
    getTablesStatus
  };
};
