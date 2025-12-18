import React, { useState, useEffect } from 'react';
import { useApp } from "@/contexts/AppContext";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { OrderItem, OrderStatus, MenuItem, MenuPage } from '@/types';
import { PeopleCountDialog } from "@/components/tables/PeopleCountDialog";
import { MenuBooklet } from "@/components/menu/MenuBooklet";
import { mockMenuPages } from '@/data/mockMenuPages';
import { 
  Plus, Minus, ArrowRight, ShoppingCart, 
  X, Users, Receipt, Trash2, Sparkles, Clock, Edit
} from 'lucide-react';
import seaLogo from "@/assets/sea-logo.jpg";

export const MenuView = () => {
  const { 
    menuItems, 
    createOrder, 
    tables, 
    orders, 
    updateMenuItem,
    deleteMenuItem,
    updateTablePeopleCount,
    user
  } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get("table");
  const selectedTable = tableId ? parseInt(tableId) : null;
  const [currentOrderItems, setCurrentOrderItems] = useState<OrderItem[]>([]);
  const [isPeopleDialogOpen, setIsPeopleDialogOpen] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [menuPages, setMenuPages] = useState<MenuPage[]>(mockMenuPages);
  
  const isAdmin = user?.role === 'admin';
  
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

  const handleAddToCart = (item: MenuItem, qty: number) => {
    const orderItem: OrderItem = {
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity: qty,
      notes: '',
      completed: false
    };

    const itemExists = currentOrderItems.some(i => i.menuItemId === item.id);
    let newItems: OrderItem[];
    
    if (itemExists) {
      newItems = currentOrderItems.map(i => 
        i.menuItemId === item.id ? { ...i, quantity: i.quantity + qty } : i
      );
    } else {
      newItems = [...currentOrderItems, orderItem];
    }
    
    setCurrentOrderItems(newItems);

    const orderData = {
      tableNumber: selectedTable,
      items: newItems,
      totalAmount: calculateTotalAmount(newItems),
      peopleCount: tables.find(t => t.id === selectedTable)?.peopleCount,
      status: 'pending' as OrderStatus,
      waiterId: '',
      delayed: false,
      isPaid: false
    };

    createOrder(orderData);
    toast.success(`تمت إضافة ${item.name} للطلب`);
  };

  const handleUpdateQuantity = (menuItemId: string, delta: number) => {
    const newItems = currentOrderItems.map(i => {
      if (i.menuItemId === menuItemId) {
        const newQuantity = i.quantity + delta;
        if (newQuantity <= 0) {
          return null;
        }
        return { ...i, quantity: newQuantity };
      }
      return i;
    }).filter(Boolean) as OrderItem[];
    
    setCurrentOrderItems(newItems);
    
    // Update order in system
    const orderData = {
      tableNumber: selectedTable,
      items: newItems,
      totalAmount: calculateTotalAmount(newItems),
      peopleCount: tables.find(t => t.id === selectedTable)?.peopleCount,
      status: 'pending' as OrderStatus,
      waiterId: '',
      delayed: false,
      isPaid: false
    };
    createOrder(orderData);
  };

  const handleRemoveFromCart = (menuItemId: string) => {
    setCurrentOrderItems(prevItems => prevItems.filter(i => i.menuItemId !== menuItemId));
    toast.success("تم حذف الطبق من السلة");
  };

  const calculateTotalAmount = (items: OrderItem[]) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return currentOrderItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getCurrentTablePeopleCount = () => {
    const table = tables.find(t => t.id === selectedTable);
    return table?.peopleCount || 0;
  };
  
  const handlePeopleCountConfirm = (count: number) => {
    updateTablePeopleCount(selectedTable, count);
    setIsPeopleDialogOpen(false);
  };

  const handleSendOrder = () => {
    if (currentOrderItems.length === 0) {
      toast.error("السلة فارغة");
      return;
    }
    
    const orderData = {
      tableNumber: selectedTable,
      items: currentOrderItems,
      totalAmount: calculateTotalAmount(currentOrderItems),
      peopleCount: tables.find(t => t.id === selectedTable)?.peopleCount,
      status: 'pending' as OrderStatus,
      waiterId: '',
      delayed: false,
      isPaid: false
    };

    createOrder(orderData);
    toast.success("تم إرسال الطلب للمطبخ بنجاح!");
    setShowCart(false);
  };

  // Menu page management (admin only)
  const handlePageUpdate = (page: MenuPage) => {
    setMenuPages(pages => pages.map(p => p.id === page.id ? page : p));
    toast.success("تم تحديث الصفحة");
  };

  const handlePageCreate = (page: Omit<MenuPage, 'id'>) => {
    const newPage: MenuPage = {
      ...page,
      id: `page-${Date.now()}`
    };
    setMenuPages(pages => [...pages, newPage]);
    toast.success("تمت إضافة الصفحة");
  };

  const handlePageDelete = (pageId: string) => {
    setMenuPages(pages => pages.filter(p => p.id !== pageId));
    toast.success("تم حذف الصفحة");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-background to-cream">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-border shadow-sea-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Info */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <img 
                  src={seaLogo} 
                  alt="SEA" 
                  className="h-14 w-14 rounded-2xl object-cover shadow-sea-md ring-2 ring-primary/20" 
                />
              </div>
              
              <div>
                <h1 className="text-2xl font-display font-bold text-primary">
                  SEA Restaurant
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="sea-badge-primary">
                    طاولة {selectedTable}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 ml-1" />
                    {new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                  </Badge>
                </div>
              </div>
            </div>

            {/* People Count & Actions */}
            <div className="flex items-center gap-3">
              {/* People Count Button */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPeopleDialogOpen(true);
                }}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                <span>{getCurrentTablePeopleCount() || 0} أشخاص</span>
                <Edit className="w-3 h-3 text-muted-foreground" />
              </Button>

              <Button
                onClick={() => navigate('/tables')}
                variant="outline"
                className="border-2"
              >
                <X className="h-5 w-5 ml-2" />
                إغلاق
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Menu Booklet */}
      <div className="container mx-auto px-6 py-8 pb-32">
        <MenuBooklet
          menuItems={menuItems}
          menuPages={menuPages}
          isAdmin={isAdmin}
          currentOrderItems={currentOrderItems}
          onAddToCart={handleAddToCart}
          onUpdateQuantity={handleUpdateQuantity}
          onPageUpdate={handlePageUpdate}
          onPageCreate={handlePageCreate}
          onPageDelete={handlePageDelete}
          onItemUpdate={updateMenuItem}
          onItemDelete={deleteMenuItem}
        />
      </div>

      {/* Floating Cart Button */}
      {!isAdmin && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
          <Button
            onClick={() => setShowCart(true)}
            className="relative sea-btn-primary font-bold px-8 py-6 rounded-2xl shadow-sea-xl flex items-center gap-3"
            size="lg"
          >
            <div className="relative">
              <ShoppingCart className="h-6 w-6" />
              {getTotalItems() > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground font-bold shadow-md px-2 py-0.5 text-xs min-w-[20px] h-5 flex items-center justify-center">
                  {getTotalItems()}
                </Badge>
              )}
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm opacity-80">سلة الطلبات</span>
              <span className="text-lg font-bold">
                ${calculateTotalAmount(currentOrderItems).toFixed(2)}
              </span>
            </div>
          </Button>
        </div>
      )}

      {/* Cart Sheet */}
      <Sheet open={showCart} onOpenChange={setShowCart}>
        <SheetContent side="bottom" className="h-[85vh] p-0 rounded-t-3xl">
          <div className="flex flex-col h-full">
            <SheetHeader className="gradient-primary text-primary-foreground p-6 rounded-t-3xl">
              <SheetTitle className="text-3xl font-bold text-primary-foreground flex items-center gap-3">
                <Receipt className="w-8 h-8" />
                سلة الطلبات
              </SheetTitle>
              <p className="text-primary-foreground/90 text-lg mt-2">
                الطاولة {selectedTable} • {getTotalItems()} عنصر
              </p>
            </SheetHeader>

            <ScrollArea className="flex-1 p-6">
              {currentOrderItems.length === 0 ? (
                <div className="text-center py-20">
                  <div className="relative inline-block">
                    <ShoppingCart className="w-32 h-32 mx-auto text-muted/30 mb-6" />
                    <Sparkles className="w-12 h-12 absolute top-0 right-0 text-secondary animate-bounce" />
                  </div>
                  <p className="text-muted-foreground text-2xl font-bold mb-2">السلة فارغة</p>
                  <p className="text-lg text-muted-foreground/70">أضف بعض الأطباق اللذيذة للبدء!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentOrderItems.map((item, index) => {
                    const menuItem = menuItems.find(m => m.id === item.menuItemId);
                    return (
                      <div 
                        key={index}
                        className="sea-card p-5 hover:shadow-sea-lg transition-all duration-300"
                      >
                        <div className="flex gap-4">
                          {menuItem?.image && (
                            <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-border">
                              <img 
                                src={menuItem.image} 
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-bold text-xl text-foreground leading-tight mb-1">
                                  {item.name}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  ${item.price} × {item.quantity}
                                </p>
                              </div>
                              <Button
                                onClick={() => handleRemoveFromCart(item.menuItemId)}
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 text-destructive hover:bg-destructive/10 rounded-full"
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 bg-muted rounded-full p-1">
                                <Button
                                  onClick={() => handleUpdateQuantity(item.menuItemId, -1)}
                                  size="icon"
                                  variant="ghost"
                                  className="h-9 w-9 rounded-full hover:bg-destructive hover:text-destructive-foreground"
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="font-bold text-xl w-10 text-center">{item.quantity}</span>
                                <Button
                                  onClick={() => handleUpdateQuantity(item.menuItemId, 1)}
                                  size="icon"
                                  className="h-9 w-9 rounded-full sea-btn-primary"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              <span className="font-bold text-2xl text-primary">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            {currentOrderItems.length > 0 && (
              <div className="border-t-2 border-border p-6 bg-muted/30">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-lg">
                    <span className="text-muted-foreground">المجموع الفرعي</span>
                    <span className="font-bold">${calculateTotalAmount(currentOrderItems).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-muted-foreground">الضريبة (10%)</span>
                    <span className="font-bold">${(calculateTotalAmount(currentOrderItems) * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between text-2xl font-bold">
                    <span>المجموع الكلي</span>
                    <span className="text-primary">
                      ${(calculateTotalAmount(currentOrderItems) * 1.1).toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleSendOrder}
                  className="w-full sea-btn-primary text-xl font-bold py-7 rounded-2xl"
                  size="lg"
                >
                  <Receipt className="w-6 h-6 ml-2" />
                  إرسال الطلب للمطبخ
                  <ArrowRight className="w-6 h-6 mr-2" />
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
      
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
