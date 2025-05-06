
import { useState, useEffect } from 'react';
import { Order, OrderItem } from '../../types';
import { mockOrders, mockUsers } from '../../data/mockData';
import { toast } from "sonner";

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
  const clearNewOrdersNotification = () => {
    setHasNewOrders(false);
  };

  const createOrder = (orderData: Partial<Order>) => {
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

    // If the user is "drinks" role, find a waiter to assign
    let waiterId = orderData.waiterId;
    let waiter;
    
    if (orderData.user?.role === 'drinks') {
      const availableWaiter = mockUsers.find(u => u.role === 'waiter' && u.isActive);
      if (availableWaiter) {
        waiterId = availableWaiter.id;
        waiter = availableWaiter;
      }
    } else {
      waiter = mockUsers.find(u => u.id === waiterId);
    }
    
    if (!waiter) return;
    
    // Find existing order if any
    const existingTable = tables.tables.find(t => t.id === orderData.tableNumber);
    const existingOrderId = existingTable?.currentOrderId;
    const existingOrder = existingOrderId ? orders.find(o => o.id === existingOrderId) : undefined;
    
    // If order exists, update it
    if (existingOrder && !existingOrder.isPaid) {
      // Merge existing items with new items
      const updatedItems = [...orderData.items] as OrderItem[];
      
      setOrders(orders.map(order => 
        order.id === existingOrderId ? 
        {
          ...order,
          items: updatedItems,
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
    
    // Add completed: false to each order item
    const orderItemsWithCompletionStatus = orderData.items.map(item => ({
      ...item,
      completed: false
    }));
    
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      tableNumber: tableId, // Ensure tableNumber is explicitly set
      waiterId: waiterId,
      waiterName: waiter.name,
      createdAt: new Date(),
      items: orderItemsWithCompletionStatus as OrderItem[],
      status: 'pending', // Set a default status
      totalAmount: orderData.totalAmount || 0,
      peopleCount: orderData.peopleCount || tables.tables.find(t => t.id === tableId)?.peopleCount || 1,
      delayed: false,
      isPaid: false
    };
    
    setOrders([...orders, newOrder]);
    
    // Update table status and people count
    tables.setTables(tables.tables.map(table => 
      table.id === orderData.tableNumber 
        ? { 
            ...table, 
            isOccupied: true, 
            currentOrderId: newOrder.id,
            peopleCount: orderData.peopleCount || table.peopleCount || 1,
            isReserved: false // Remove reservation when creating order
          }
        : table
    ));
    
    // Set notification for screen users
    setHasNewOrders(true);
    
    // If emergency mode is on, handle backup procedures
    if (orderData.systemSettings?.emergencyMode) {
      if (orderData.systemSettings.backupPrinterEnabled) {
        toast.info("تم إرسال الطلب إلى الطابعة الاحتياطية", {
          description: "نظام الطوارئ مفعل"
        });
      }
      
      if (orderData.systemSettings.backupPhoneEnabled) {
        toast.info("تم إرسال إشعار إلى تطبيق الطهاة", {
          description: "نظام الطوارئ مفعل"
        });
      }
    }
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, status, updatedAt: new Date() } 
        : order
    ));
    
    // If status is delivered, free up the table
    if (status === 'delivered') {
      tables.setTables(tables.tables.map(table => 
        table.currentOrderId === orderId
          ? { ...table, isOccupied: false, currentOrderId: undefined }
          : table
      ));
    }
    
    // No status change notifications as requested, except for "ready" status
    if (status === 'ready') {
      toast.success("الطلب جاهز للتقديم");
    }
  };

  // New function to update item completion status
  const updateItemCompletionStatus = (orderId: string, menuItemId: string, completed: boolean) => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        const updatedItems = order.items.map(item => 
          item.menuItemId === menuItemId ? { ...item, completed } : item
        );
        
        // Check if all items are completed
        const allCompleted = updatedItems.every(item => item.completed);
        
        // If all items are completed, automatically set order status to ready
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
  };

  // New function to delay an order
  const delayOrder = (orderId: string, reason: string) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, delayed: true, delayReason: reason, updatedAt: new Date() } 
        : order
    ));
    
    toast.info("تم تحديث حالة الطلب", {
      description: "تم تأجيل الطلب وإرسال إشعار للنادل"
    });
  };
  
  // New function to cancel a specific order item
  const cancelOrderItem = (orderId: string, menuItemId: string) => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        // Filter out the canceled item
        const updatedItems = order.items.filter(item => item.menuItemId !== menuItemId);
        
        // If no items are left, mark order as canceled
        if (updatedItems.length === 0) {
          // Free up the table if this is the current order
          tables.setTables(tables.tables.map(table => 
            table.currentOrderId === orderId
              ? { ...table, isOccupied: false, currentOrderId: undefined }
              : table
          ));
          
          return { ...order, status: 'canceled', items: [], updatedAt: new Date() };
        }
        
        return { ...order, items: updatedItems, updatedAt: new Date() };
      }
      return order;
    }));
    
    toast.success("تم إلغاء العنصر من الطلب");
  };

  // New function to mark a table order as paid
  const markTableAsPaid = (tableId: number) => {
    // Find the active order for this table
    const tableOrder = orders.find(o => 
      o.tableNumber === tableId && 
      !o.isPaid &&
      (o.status === 'pending' || o.status === 'preparing' || o.status === 'ready' || o.status === 'delivered')
    );
    
    if (tableOrder) {
      // Update the order to mark it as paid
      setOrders(orders.map(order => 
        order.id === tableOrder.id 
          ? { ...order, isPaid: true, updatedAt: new Date() } 
          : order
      ));
      
      toast.success(`تم تسجيل الدفع للطاولة ${tableId}`);
      return true;
    } else {
      toast.error(`لا يوجد طلب نشط للطاولة ${tableId}`);
      return false;
    }
  };

  // Using the resetTable function from tables
  const resetTableOrder = (tableId: number) => {
    const tableToReset = tables.resetTable(tableId);

    // Update any orders for this table - use 'delivered' instead of 'completed'
    if (tableToReset?.currentOrderId) {
      updateOrderStatus(tableToReset.currentOrderId, 'delivered');
    }
  };

  const getFilteredOrders = (status?: Order['status']) => {
    if (!status) return orders;
    return orders.filter(order => order.status === status);
  };

  // New function to get orders grouped by table
  const getOrdersByTable = (): Record<number, Order[]> => {
    const tableOrders: Record<number, Order[]> = {};
    
    // Group orders by table number
    orders.forEach(order => {
      if (!tableOrders[order.tableNumber]) {
        tableOrders[order.tableNumber] = [];
      }
      tableOrders[order.tableNumber].push(order);
    });
    
    return tableOrders;
  };

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
