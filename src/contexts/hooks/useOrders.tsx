import { useState, useEffect, useCallback } from 'react';
import { Order, OrderItem } from '../../types';
import { mockOrders, mockUsers } from '../../data/mockData';
import { toast } from "sonner";

// Helper functions for order operations
const orderHelpers = {
  // Calculate total amount for an order
  calculateTotal: (items: OrderItem[]): number => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  },
  
  // Find waiter for an order
  findWaiter: (waiterId?: string, waiterRole?: string) => {
    if (waiterRole === 'drinks') {
      return mockUsers.find(u => u.role === 'waiter' && u.isActive);
    }
    return mockUsers.find(u => u.id === waiterId);
  },
  
  // Check if all items in an order are completed
  checkAllItemsCompleted: (items: OrderItem[]): boolean => {
    return items.every(item => item.completed);
  },
  
  // Initialize order from order data
  initializeOrder: (orderData: Partial<Order>, tableId: number, waiterId: string, waiterName: string): Order => {
    return {
      id: `order-${Date.now()}`,
      tableNumber: tableId,
      waiterId: waiterId,
      waiterName: waiterName,
      createdAt: new Date(),
      items: orderData.items.map(item => ({...item, completed: false})) as OrderItem[],
      status: 'pending',
      totalAmount: orderData.totalAmount || 0,
      peopleCount: orderData.peopleCount || 1,
      delayed: false,
      isPaid: false
    };
  }
};

export const useOrders = (
  tables: ReturnType<typeof import('./useTables').useTables>,
  updateOrderStats: (orders: Order[]) => void
) => {
  const [orders, setOrders] = useState<Order[]>(mockOrders.map(order => ({
    ...order,
    peopleCount: order.peopleCount || 1,
    items: order.items.map(item => ({ ...item, completed: false }))
  })));
  const [hasNewOrders, setHasNewOrders] = useState<boolean>(false);

  // Update order statistics whenever orders change
  useEffect(() => {
    updateOrderStats(orders);
  }, [orders, updateOrderStats]);

  // Function to clear new orders notification
  const clearNewOrdersNotification = useCallback(() => {
    setHasNewOrders(false);
  }, []);

  // Create or update an order
  const createOrder = useCallback((orderData: Partial<Order> & { waiterId?: string, waiterRole?: string }) => {
    // Check if this is an update for an existing order
    const tableId = orderData.tableNumber;
    if (!tableId) return;

    // Find the table
    const table = tables.tables.find(t => t.id === tableId);
    if (!table) return;

    // If no items in order, reset people count to 0
    if (!orderData.items || orderData.items.length === 0) {
      tables.updateTablePeopleCount(tableId, 0);
      return;
    }

    // Find waiter for this order
    const waiter = orderHelpers.findWaiter(orderData.waiterId, orderData.waiterRole);
    if (!waiter) return;
    
    // Find existing order if any
    const existingTable = tables.tables.find(t => t.id === orderData.tableNumber);
    const existingOrderId = existingTable?.currentOrderId;
    const existingOrder = existingOrderId ? orders.find(o => o.id === existingOrderId) : undefined;
    
    // Update existing order if found and not paid
    if (existingOrder && !existingOrder.isPaid) {
      setOrders(prevOrders => prevOrders.map(order => 
        order.id === existingOrderId ? 
        {
          ...order,
          items: [...orderData.items] as OrderItem[],
          notes: orderData.notes,
          totalAmount: orderData.totalAmount,
          peopleCount: orderData.peopleCount || order.peopleCount,
          updatedAt: new Date()
        } : 
        order
      ));
      return;
    }
    
    // If the table has a paid order, clear it
    if (existingOrder?.isPaid) {
      tables.resetTable(orderData.tableNumber);
    }
    
    // Create a new order
    const newOrder = orderHelpers.initializeOrder(
      orderData,
      tableId,
      waiter.id,
      waiter.name
    );
    
    setOrders(prevOrders => [...prevOrders, newOrder]);
    
    // Update table status and people count
    updateTableWithNewOrder(tableId, newOrder.id, orderData.peopleCount);
    
    // Set notification for screen users
    setHasNewOrders(true);
  }, [orders, tables]);

  // Helper to update table with new order
  const updateTableWithNewOrder = useCallback((tableId: number, orderId: string, peopleCount?: number) => {
    tables.setTables(prevTables => prevTables.map(table => 
      table.id === tableId 
        ? { 
            ...table, 
            isOccupied: true, 
            currentOrderId: orderId,
            peopleCount: peopleCount || table.peopleCount || 1,
            isReserved: false // Remove reservation when creating order
          }
        : table
    ));
  }, [tables]);

  // Update order status
  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    setOrders(prevOrders => prevOrders.map(order => 
      order.id === orderId 
        ? { ...order, status, updatedAt: new Date() } 
        : order
    ));
    
    // If status is delivered, free up the table
    if (status === 'delivered') {
      tables.setTables(prevTables => prevTables.map(table => 
        table.currentOrderId === orderId
          ? { ...table, isOccupied: false, currentOrderId: undefined }
          : table
      ));
    }
    
    // Notify only for "ready" status
    if (status === 'ready') {
      toast.success("الطلب جاهز للتقديم");
    }
  }, [tables]);

  // Update item completion status
  const updateItemCompletionStatus = useCallback((orderId: string, menuItemId: string, completed: boolean) => {
    setOrders(prevOrders => prevOrders.map(order => {
      if (order.id === orderId) {
        const updatedItems = order.items.map(item => 
          item.menuItemId === menuItemId ? { ...item, completed } : item
        );
        
        // Check if all items are completed
        const allCompleted = orderHelpers.checkAllItemsCompleted(updatedItems);
        
        // Auto-update status if all items are completed
        const newStatus = allCompleted ? 'ready' : order.status;
        
        return { 
          ...order, 
          items: updatedItems,
          status: newStatus === 'pending' ? 'preparing' : newStatus,
          updatedAt: new Date()
        };
      }
      return order;
    }));
    
    toast.success(completed ? "تم الانتهاء من تحضير العنصر" : "تمت إعادة العنصر للتحضير");
  }, []);

  // Delay an order
  const delayOrder = useCallback((orderId: string, reason: string) => {
    setOrders(prevOrders => prevOrders.map(order => 
      order.id === orderId 
        ? { ...order, delayed: true, delayReason: reason, updatedAt: new Date() } 
        : order
    ));
    
    toast.info("تم تحديث حالة الطلب", {
      description: "تم تأجيل الطلب وإرسال إشعار للنادل"
    });
  }, []);
  
  // Cancel a specific order item
  const cancelOrderItem = useCallback((orderId: string, menuItemId: string) => {
    setOrders(prevOrders => prevOrders.map(order => {
      if (order.id === orderId) {
        // Filter out the canceled item
        const updatedItems = order.items.filter(item => item.menuItemId !== menuItemId);
        
        // If no items left, mark order as canceled and free up the table
        if (updatedItems.length === 0) {
          freeUpTable(orderId);
          return { ...order, status: 'canceled', items: [], updatedAt: new Date() };
        }
        
        return { ...order, items: updatedItems, updatedAt: new Date() };
      }
      return order;
    }));
    
    toast.success("تم إلغاء العنصر من الطلب");
  }, []);

  // Helper to free up a table
  const freeUpTable = useCallback((orderId: string) => {
    tables.setTables(prevTables => prevTables.map(table => 
      table.currentOrderId === orderId
        ? { ...table, isOccupied: false, currentOrderId: undefined }
        : table
    ));
  }, [tables]);

  // Mark a table order as paid - Enhanced for admin functionality
  const markTableAsPaid = useCallback((tableId: number) => {
    // Find active order for this table
    const tableOrder = orders.find(o => 
      o.tableNumber === tableId && 
      !o.isPaid &&
      (o.status === 'pending' || o.status === 'preparing' || o.status === 'ready' || o.status === 'delivered')
    );
    
    if (tableOrder) {
      // Mark the order as paid in the orders state
      setOrders(prevOrders => prevOrders.map(order => 
        order.id === tableOrder.id 
          ? { ...order, isPaid: true, updatedAt: new Date() } 
          : order
      ));
      
      toast.success(`تم تسجيل الدفع للطاولة ${tableId}`);
      
      // After marking as paid, we completely reset the table
      // This is the admin-specific functionality to clear everything
      tables.resetTable(tableId);
      
      return true;
    } else {
      toast.error(`لا يوجد طلب نشط للطاولة ${tableId}`);
      return false;
    }
  }, [orders, tables]);

  // Reset table order - Enhanced for admin functionality
  const resetTableOrder = useCallback((tableId: number) => {
    const tableToReset = tables.resetTable(tableId);

    if (tableToReset?.currentOrderId) {
      updateOrderStatus(tableToReset.currentOrderId, 'delivered');
    }
    
    toast.success(`تم إعادة تهيئة الطاولة ${tableId}`);
  }, [tables, updateOrderStatus]);

  // Get filtered orders by status
  const getFilteredOrders = useCallback((status?: Order['status']) => {
    if (!status) return orders;
    return orders.filter(order => order.status === status);
  }, [orders]);

  // Get orders grouped by table
  const getOrdersByTable = useCallback((): Record<number, Order[]> => {
    const tableOrders: Record<number, Order[]> = {};
    
    orders.forEach(order => {
      if (!tableOrders[order.tableNumber]) {
        tableOrders[order.tableNumber] = [];
      }
      tableOrders[order.tableNumber].push(order);
    });
    
    return tableOrders;
  }, [orders]);

  return {
    orders,
    hasNewOrders,
    createOrder,
    updateOrderStatus,
    updateItemCompletionStatus,
    delayOrder,
    cancelOrderItem,
    markTableAsPaid,
    resetTable: resetTableOrder,
    getFilteredOrders,
    getOrdersByTable,
    clearNewOrdersNotification
  };
};
