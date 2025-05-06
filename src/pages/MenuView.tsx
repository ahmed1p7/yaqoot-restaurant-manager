
import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from "@/contexts/AppContext";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { OrderItem, OrderStatus } from '@/types';
import { QuickOrderBar } from "@/components/menu/QuickOrderBar";

export const MenuView = () => {
  const { menuItems, createOrder, tables, orders, getMostOrderedItems } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get("table");
  const selectedTable = tableId ? parseInt(tableId) : null;
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentOrderItems, setCurrentOrderItems] = useState<OrderItem[]>([]);

  // Find current order for this table
  useEffect(() => {
    if (selectedTable) {
      const table = tables.find(t => t.id === selectedTable);
      if (table?.currentOrderId) {
        const currentOrder = orders.find(o => o.id === table.currentOrderId);
        if (currentOrder && !currentOrder.isPaid) {
          setCurrentOrderItems(currentOrder.items);
        }
      }
    }
  }, [selectedTable, tables, orders]);

  useEffect(() => {
    if (!selectedTable) {
      toast.error("الرجاء تحديد طاولة");
      navigate('/tables');
    }
  }, [selectedTable, navigate]);

  if (!selectedTable) {
    return null;
  }

  const handleAddToOrder = (item: any) => {
    const existingTable = tables.find(t => t.id === selectedTable);
    const existingOrderId = existingTable?.currentOrderId;
    const existingOrder = existingOrderId ? orders.find(o => o.id === existingOrderId) : undefined;

    let quantity = 1;
    if (existingOrder) {
      const existingItem = existingOrder.items.find(i => i.menuItemId === item.id);
      if (existingItem) {
        quantity = existingItem.quantity + 1;
      }
    }

    const orderItem: OrderItem = {
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity: quantity,
      notes: '',
      completed: false
    };

    const orderData = {
      tableNumber: selectedTable,
      items: [orderItem],
      totalAmount: item.price * quantity,
      peopleCount: tables.find(t => t.id === selectedTable)?.peopleCount,
      status: 'pending' as OrderStatus,
      waiterId: '',
      delayed: false,
      isPaid: false
    };

    createOrder(orderData);
    
    // Update local state to show the item immediately
    const itemExists = currentOrderItems.some(i => i.menuItemId === item.id);
    if (itemExists) {
      setCurrentOrderItems(prevItems => 
        prevItems.map(i => i.menuItemId === item.id ? 
          { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setCurrentOrderItems(prevItems => [...prevItems, orderItem]);
    }
    
    // Show success toast
    toast.success(`تمت إضافة ${item.name} للطلب`, {
      description: "يمكنك تعديل الكمية لاحقاً"
    });
  };

  const filteredMenuItems = menuItems.filter(item => {
    if (category && item.category !== category) {
      return false;
    }
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          قائمة الطعام
          {selectedTable && (
            <Badge className="ml-2">
              الطاولة رقم {selectedTable}
            </Badge>
          )}
        </h1>
        <Input
          type="search"
          placeholder="بحث في قائمة الطعام..."
          className="max-w-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Current Order Items Display */}
      {currentOrderItems.length > 0 && (
        <div className="bg-gray-50 p-3 rounded-lg border mb-4">
          <h3 className="font-medium mb-2">الطلب الحالي:</h3>
          <div className="flex flex-wrap gap-2">
            {currentOrderItems.map((item) => (
              <Badge key={item.menuItemId} variant="outline" className="px-3 py-1">
                {item.name} ({item.quantity}x)
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" onClick={() => setCategory(undefined)}>الكل</TabsTrigger>
          <TabsTrigger value="drinks" onClick={() => setCategory("مشروبات")}>مشروبات</TabsTrigger>
          <TabsTrigger value="main" onClick={() => setCategory("أطباق رئيسية")}>أطباق رئيسية</TabsTrigger>
          <TabsTrigger value="desserts" onClick={() => setCategory("حلويات")}>حلويات</TabsTrigger>
        </TabsList>
        <TabsContent value="all" />
        <TabsContent value="drinks" />
        <TabsContent value="main" />
        <TabsContent value="desserts" />

        {selectedTable && (
          <QuickOrderBar
            items={getMostOrderedItems(5)}
            onAddItem={(item) => {
              handleAddToOrder(item);
            }}
          />
        )}

        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredMenuItems.map(item => (
              <Card key={item.id} className="cursor-pointer hover:bg-gray-50 transition-all">
                <CardContent className="p-4">
                  <h3 className="font-medium text-lg">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.description}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span>السعر: {item.price} ريال</span>
                    <Button size="sm" onClick={() => handleAddToOrder(item)}>إضافة</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
};
