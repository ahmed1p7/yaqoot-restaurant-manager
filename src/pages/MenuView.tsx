
import React, { useState, useEffect } from 'react';
import { useApp } from "@/contexts/AppContext";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { OrderItem } from '@/types';
import { QuickOrderBar } from "@/components/menu/QuickOrderBar";

export const MenuView = () => {
  const { menuItems, createOrder, tables, orders, getMostOrderedItems } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get("table");
  const selectedTable = tableId ? parseInt(tableId) : null;
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");

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
      completed: false // Adding the required completed property
    };

    const orderData = {
      tableNumber: selectedTable,
      items: [orderItem],
      totalAmount: item.price * quantity,
      peopleCount: tables.find(t => t.id === selectedTable)?.peopleCount,
      status: 'pending', // Adding the required status property
      waiterId: '', // Adding required waiterId (will be set in AppContext)
      delayed: false, // Adding required delayed property
      isPaid: false // Adding required isPaid property
    };

    createOrder(orderData);
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
              toast.success(`تمت إضافة ${item.name} للطلب`, {
                description: "يمكنك تعديل الكمية لاحقاً"
              });
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
