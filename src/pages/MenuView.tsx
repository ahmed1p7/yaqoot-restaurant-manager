
import React, { useState, useEffect } from 'react';
import { useApp } from "@/contexts/AppContext";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { OrderItem, OrderStatus, MenuItem } from '@/types';
import { QuickOrderBar } from "@/components/menu/QuickOrderBar";
import { CurrentOrderPanel } from "@/components/menu/CurrentOrderPanel";
import { PeopleCountDialog } from "@/components/tables/PeopleCountDialog";
import { Plus, CupSoda, Utensils, CakeSlice, Send } from 'lucide-react';

export const MenuView = () => {
  const { 
    menuItems, 
    createOrder, 
    tables, 
    orders, 
    getMostOrderedItems, 
    cancelOrderItem, 
    updateTablePeopleCount 
  } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get("table");
  const selectedTable = tableId ? parseInt(tableId) : null;
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentOrderItems, setCurrentOrderItems] = useState<OrderItem[]>([]);
  const [isPeopleDialogOpen, setIsPeopleDialogOpen] = useState(false);

  // تحويل التصنيفات إلى مسميات عربية - MOVED BEFORE USAGE
  const mapCategoryToArabic = (category: string): string => {
    switch(category) {
      case "drinks": return "مشروبات";
      case "main": return "أطباق رئيسية";
      case "desserts": return "حلويات";
      case "appetizers": return "مقبلات";
      case "sides": return "أطباق جانبية";
      default: return "";
    }
  }
  
  // Find current order for this table
  useEffect(() => {
    if (selectedTable) {
      const table = tables.find(t => t.id === selectedTable);
      if (table?.currentOrderId) {
        const currentOrder = orders.find(o => o.id === table.currentOrderId);
        if (currentOrder && !currentOrder.isPaid) {
          setCurrentOrderItems(currentOrder.items);
        } else {
          setCurrentOrderItems([]);
        }
      } else {
        setCurrentOrderItems([]);
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

    // Create the order
    const orderData = {
      tableNumber: selectedTable,
      items: itemExists ? currentOrderItems.map(i => 
        i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ) : [...currentOrderItems, orderItem],
      totalAmount: calculateTotalAmount(itemExists ? 
        currentOrderItems.map(i => i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i) 
        : [...currentOrderItems, orderItem]
      ),
      peopleCount: tables.find(t => t.id === selectedTable)?.peopleCount,
      status: 'pending' as OrderStatus,
      waiterId: '',
      delayed: false,
      isPaid: false
    };

    createOrder(orderData);
    
    // Show success toast
    toast.success(`تمت إضافة ${item.name} للطلب`, {
      description: "يمكنك تعديل الكمية لاحقاً"
    });
  };

  const calculateTotalAmount = (items: OrderItem[]) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleUpdateQuantity = (menuItemId: string, quantity: number) => {
    const updatedItems = currentOrderItems.map(item => 
      item.menuItemId === menuItemId ? { ...item, quantity } : item
    );
    
    setCurrentOrderItems(updatedItems);
    
    const orderData = {
      tableNumber: selectedTable,
      items: updatedItems,
      totalAmount: calculateTotalAmount(updatedItems),
      peopleCount: tables.find(t => t.id === selectedTable)?.peopleCount,
      status: 'pending' as OrderStatus,
      waiterId: '',
      delayed: false,
      isPaid: false
    };
    
    createOrder(orderData);
    toast.success("تم تحديث الكمية");
  };

  const handleUpdateNote = (menuItemId: string, note: string) => {
    const updatedItems = currentOrderItems.map(item => 
      item.menuItemId === menuItemId ? { ...item, notes: note } : item
    );
    
    setCurrentOrderItems(updatedItems);
    
    const orderData = {
      tableNumber: selectedTable,
      items: updatedItems,
      totalAmount: calculateTotalAmount(updatedItems),
      peopleCount: tables.find(t => t.id === selectedTable)?.peopleCount,
      status: 'pending' as OrderStatus,
      waiterId: '',
      delayed: false,
      isPaid: false
    };
    
    createOrder(orderData);
    toast.success("تم حفظ الملاحظات");
  };

  const handleRemoveItem = (menuItemId: string) => {
    // First update local state
    const updatedItems = currentOrderItems.filter(item => item.menuItemId !== menuItemId);
    setCurrentOrderItems(updatedItems);
    
    // Then update the order through API
    cancelOrderItem(existingOrder()?.id || '', menuItemId);
  };
  
  const existingOrder = () => {
    const existingTable = tables.find(t => t.id === selectedTable);
    const existingOrderId = existingTable?.currentOrderId;
    return existingOrderId ? orders.find(o => o.id === existingOrderId) : undefined;
  };

  const getCurrentTablePeopleCount = () => {
    const table = tables.find(t => t.id === selectedTable);
    return table?.peopleCount || 0;
  };
  
  const handlePeopleCountConfirm = (count: number) => {
    updateTablePeopleCount(selectedTable, count);
    setIsPeopleDialogOpen(false);
  };

  // عملية إرسال الطلب إلى المطبخ
  const handleSendOrder = () => {
    if (currentOrderItems.length === 0) {
      toast.error("لا يمكن إرسال طلب فارغ");
      return;
    }

    const existingTable = tables.find(t => t.id === selectedTable);
    const existingOrderId = existingTable?.currentOrderId;

    const orderData = {
      tableNumber: selectedTable,
      items: currentOrderItems,
      totalAmount: calculateTotalAmount(currentOrderItems),
      peopleCount: tables.find(t => t.id === selectedTable)?.peopleCount || 1,
      status: 'pending' as OrderStatus,
      waiterId: '',
      delayed: false,
      isPaid: false
    };

    createOrder(orderData);
    
    toast.success("تم إرسال الطلب إلى المطبخ بنجاح", {
      description: "سيتم إشعار المطبخ بالطلب الجديد"
    });
  };

  // Filter menu items by category and search query
  const filteredMenuItems = menuItems.filter(item => {
    if (category && item.category !== mapCategoryToArabic(category)) {
      return false;
    }
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  // تجميع الأطباق حسب التصنيف
  const groupedMenuItems: Record<string, MenuItem[]> = {};
  menuItems.forEach(item => {
    if (!groupedMenuItems[item.category]) {
      groupedMenuItems[item.category] = [];
    }
    groupedMenuItems[item.category].push(item);
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          قائمة الطعام
          {selectedTable && (
            <span className="ml-2 bg-primary text-white px-2 py-1 text-sm rounded-md">
              الطاولة {selectedTable}
            </span>
          )}
        </h1>
        <Input
          type="search"
          placeholder="بحث في قائمة الطعام..."
          className="max-w-xs"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Current Order Panel with Send Button */}
      <CurrentOrderPanel 
        items={currentOrderItems}
        onUpdateQuantity={handleUpdateQuantity}
        onUpdateNote={handleUpdateNote}
        onRemoveItem={handleRemoveItem}
        onSendOrder={handleSendOrder}
        tableNumber={selectedTable}
        peopleCount={getCurrentTablePeopleCount()}
        onOpenPeopleDialog={() => setIsPeopleDialogOpen(true)}
      />

      {/* Quick Order Bar */}
      <QuickOrderBar
        items={getMostOrderedItems(5)}
        onAddItem={handleAddToOrder}
      />

      {/* Menu Tabs and Items - تحسين طريقة عرض التصنيفات */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="all" onClick={() => setCategory(undefined)} className="flex items-center gap-1">
            الكل
          </TabsTrigger>
          <TabsTrigger value="drinks" onClick={() => setCategory("drinks")} className="flex items-center gap-1">
            <CupSoda className="h-4 w-4" /> مشروبات
          </TabsTrigger>
          <TabsTrigger value="main" onClick={() => setCategory("main")} className="flex items-center gap-1">
            <Utensils className="h-4 w-4" /> أطباق رئيسية
          </TabsTrigger>
          <TabsTrigger value="desserts" onClick={() => setCategory("desserts")} className="flex items-center gap-1">
            <CakeSlice className="h-4 w-4" /> حلويات
          </TabsTrigger>
          <TabsTrigger value="appetizers" onClick={() => setCategory("appetizers")} className="flex items-center gap-1">
            مقبلات
          </TabsTrigger>
          <TabsTrigger value="sides" onClick={() => setCategory("sides")} className="flex items-center gap-1">
            أطباق جانبية
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" />
        <TabsContent value="drinks" />
        <TabsContent value="main" />
        <TabsContent value="desserts" />
        <TabsContent value="appetizers" />
        <TabsContent value="sides" />

        <ScrollArea className="h-[450px] w-full rounded-md border p-4">
          {filteredMenuItems.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredMenuItems.map(item => (
                <Card key={item.id} className="cursor-pointer hover:bg-gray-50 transition-all border border-primary/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                    <h3 className="font-medium text-lg">{item.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-primary">{item.price} ريال</span>
                      <Button 
                        size="sm" 
                        onClick={() => handleAddToOrder(item)}
                        className="gap-1"
                      >
                        <Plus className="h-4 w-4" /> إضافة
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg text-gray-500">لا توجد أطباق متطابقة مع البحث</p>
            </div>
          )}
        </ScrollArea>
      </Tabs>
      
      {/* People Count Dialog */}
      <PeopleCountDialog
        isOpen={isPeopleDialogOpen}
        onClose={() => setIsPeopleDialogOpen(false)}
        currentCount={getCurrentTablePeopleCount()}
        onConfirm={handlePeopleCountConfirm}
        isEditing={true}
      />
    </div>
  );
};
