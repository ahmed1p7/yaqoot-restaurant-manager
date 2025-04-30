import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MenuItem, OrderItem, MenuCategory } from "@/types";
import { Table as TableIcon, ArrowRight, ChefHat, Plus, Utensils, Wine } from "lucide-react";

export const Tables = () => {
  const { tables, menuItems, createOrder, user, orders } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [selectedMenuItems, setSelectedMenuItems] = useState<Map<string, { quantity: number; notes: string }>>(new Map());
  const [activeTab, setActiveTab] = useState<string>("all");
  
  const handleOpenDialog = (tableId: number) => {
    setSelectedTable(tableId);
    setSelectedMenuItems(new Map());
    setIsDialogOpen(true);
  };
  
  const handleSelectMenuItem = (item: MenuItem) => {
    const updatedItems = new Map(selectedMenuItems);
    
    if (updatedItems.has(item.id)) {
      const existingItem = updatedItems.get(item.id)!;
      updatedItems.set(item.id, {
        ...existingItem,
        quantity: existingItem.quantity + 1
      });
    } else {
      updatedItems.set(item.id, { quantity: 1, notes: '' });
    }
    
    setSelectedMenuItems(updatedItems);
  };
  
  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    const updatedItems = new Map(selectedMenuItems);
    
    if (quantity <= 0) {
      updatedItems.delete(itemId);
    } else {
      const existingItem = updatedItems.get(itemId)!;
      updatedItems.set(itemId, { ...existingItem, quantity });
    }
    
    setSelectedMenuItems(updatedItems);
  };
  
  const handleUpdateNotes = (itemId: string, notes: string) => {
    const updatedItems = new Map(selectedMenuItems);
    const existingItem = updatedItems.get(itemId)!;
    updatedItems.set(itemId, { ...existingItem, notes });
    setSelectedMenuItems(updatedItems);
  };
  
  const handleCreateOrder = () => {
    if (!selectedTable || !user) return;
    
    const orderItems: OrderItem[] = [];
    let totalAmount = 0;
    
    selectedMenuItems.forEach((value, menuItemId) => {
      const menuItem = menuItems.find(item => item.id === menuItemId);
      if (menuItem) {
        const itemTotal = menuItem.price * value.quantity;
        totalAmount += itemTotal;
        
        orderItems.push({
          menuItemId: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: value.quantity,
          notes: value.notes || undefined,
        });
      }
    });
    
    createOrder({
      tableNumber: selectedTable,
      items: orderItems,
      status: 'pending',
      totalAmount,
      waiterId: user.id,
    });
    
    setIsDialogOpen(false);
  };
  
  // Filter tables based on tab
  const filteredTables = tables.filter(table => {
    if (activeTab === 'all') return true;
    if (activeTab === 'free') return !table.isOccupied;
    if (activeTab === 'occupied') return table.isOccupied;
    return true;
  });
  
  // Calculate totals
  const calculateTotal = () => {
    let total = 0;
    selectedMenuItems.forEach((value, menuItemId) => {
      const menuItem = menuItems.find(item => item.id === menuItemId);
      if (menuItem) {
        total += menuItem.price * value.quantity;
      }
    });
    return total;
  };
  
  // Get menu items by category
  const getMenuByCategory = (category: MenuCategory) => {
    return menuItems.filter(item => 
      item.isAvailable && 
      item.category === category
    );
  };

  // Get all drinks
  const drinks = getMenuByCategory('drinks');
  
  // Get all food items (non-drinks)
  const foodItems = menuItems.filter(item => 
    item.isAvailable && 
    item.category !== 'drinks'
  );
  
  // Get order for a specific table
  const getTableOrder = (tableId: number) => {
    return orders.find(order => 
      order.tableNumber === tableId && 
      (order.status === 'pending' || order.status === 'preparing' || order.status === 'ready')
    );
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">الطاولات</h1>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">الكل</TabsTrigger>
          <TabsTrigger value="free">متاحة</TabsTrigger>
          <TabsTrigger value="occupied">مشغولة</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredTables.map((table) => {
              const tableOrder = getTableOrder(table.id);
              
              return (
                <Card 
                  key={table.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    table.isOccupied ? 'border-restaurant-primary border-2' : ''
                  }`}
                  onClick={() => handleOpenDialog(table.id)}
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <TableIcon className={`w-10 h-10 mb-2 ${
                      table.isOccupied ? 'text-restaurant-primary' : 'text-gray-400'
                    }`} />
                    
                    <h3 className="font-medium">{table.name}</h3>
                    
                    {table.isOccupied ? (
                      <Badge className="mt-2 bg-restaurant-primary">مشغولة</Badge>
                    ) : (
                      <Badge className="mt-2 bg-green-500">متاحة</Badge>
                    )}
                    
                    {tableOrder && (
                      <div className="mt-2 text-xs text-gray-500">
                        طلب {tableOrder.id.slice(-4)} - {tableOrder.items.length} عناصر
                      </div>
                    )}
                    
                    <Button 
                      size="sm"
                      className="mt-3 w-full"
                      disabled={user?.role !== 'waiter' && user?.role !== 'admin'}
                    >
                      {table.isOccupied ? 'عرض الطلب' : 'طلب جديد'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedTable ? `طلب جديد - ${tables.find(t => t.id === selectedTable)?.name}` : 'طلب جديد'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="mb-6">
                <h3 className="font-medium mb-2 flex items-center gap-2 text-lg pb-2 border-b">
                  <Wine className="w-5 h-5 text-blue-500" />
                  <span>المشروبات</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-2">
                  {drinks.length > 0 ? (
                    drinks.map((item) => (
                      <Card 
                        key={item.id}
                        className="cursor-pointer hover:bg-gray-50 border-blue-100"
                        onClick={() => handleSelectMenuItem(item)}
                      >
                        <CardContent className="p-3 flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-xs text-gray-500 line-clamp-1">{item.price} ريال</p>
                          </div>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-2">لا توجد مشروبات متاحة</p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2 flex items-center gap-2 text-lg pb-2 border-b">
                  <Utensils className="w-5 h-5 text-restaurant-primary" />
                  <span>الأطباق</span>
                </h3>
                
                <Tabs defaultValue="appetizers">
                  <TabsList className="mb-4">
                    <TabsTrigger value="appetizers">مقبلات</TabsTrigger>
                    <TabsTrigger value="main_dishes">رئيسي</TabsTrigger>
                    <TabsTrigger value="desserts">حلويات</TabsTrigger>
                    <TabsTrigger value="sides">جانبي</TabsTrigger>
                  </TabsList>
                  
                  <div className="max-h-[300px] overflow-y-auto pr-2">
                    <TabsContent value="appetizers" className="mt-0 space-y-2">
                      {getMenuByCategory('appetizers').map((item) => (
                        <Card 
                          key={item.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSelectMenuItem(item)}
                        >
                          <CardContent className="p-3 flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{item.price} ريال</span>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="main_dishes" className="mt-0 space-y-2">
                      {getMenuByCategory('main_dishes').map((item) => (
                        <Card 
                          key={item.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSelectMenuItem(item)}
                        >
                          <CardContent className="p-3 flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{item.price} ريال</span>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="desserts" className="mt-0 space-y-2">
                      {getMenuByCategory('desserts').map((item) => (
                        <Card 
                          key={item.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSelectMenuItem(item)}
                        >
                          <CardContent className="p-3 flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{item.price} ريال</span>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="sides" className="mt-0 space-y-2">
                      {getMenuByCategory('sides').map((item) => (
                        <Card 
                          key={item.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSelectMenuItem(item)}
                        >
                          <CardContent className="p-3 flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{item.price} ريال</span>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>
            
            <div className="md:w-80 flex flex-col">
              <h3 className="font-medium mb-3">الطلب الحالي</h3>
              
              <div className="flex-1 border rounded-md p-3 mb-4 max-h-[300px] overflow-y-auto">
                {selectedMenuItems.size === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ChefHat className="w-8 h-8 mx-auto mb-2" />
                    <p>اختر من القائمة لإضافة عناصر</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Array.from(selectedMenuItems.entries()).map(([menuItemId, data]) => {
                      const menuItem = menuItems.find(item => item.id === menuItemId);
                      if (!menuItem) return null;
                      
                      return (
                        <div key={menuItemId} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">{menuItem.name}</span>
                            <span>{menuItem.price * data.quantity} ريال</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="px-2 py-0 h-8 text-lg"
                              onClick={() => handleUpdateQuantity(menuItemId, data.quantity - 1)}
                            >
                              -
                            </Button>
                            <Input
                              className="w-12 h-8 text-center"
                              value={data.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val)) {
                                  handleUpdateQuantity(menuItemId, val);
                                }
                              }}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              className="px-2 py-0 h-8 text-lg"
                              onClick={() => handleUpdateQuantity(menuItemId, data.quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                          
                          <div>
                            <Textarea
                              placeholder="ملاحظات (اختياري)"
                              className="text-sm"
                              value={data.notes}
                              onChange={(e) => handleUpdateNotes(menuItemId, e.target.value)}
                              rows={1}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span>المجموع الفرعي:</span>
                  <span>{calculateTotal()} ريال</span>
                </div>
              </div>
              
              <Button
                onClick={handleCreateOrder}
                disabled={selectedMenuItems.size === 0}
                className="w-full bg-restaurant-primary hover:bg-restaurant-primary-dark"
              >
                إرسال الطلب
                <ArrowRight className="mr-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
