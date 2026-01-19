import React, { useState, useEffect } from 'react';
import { useApp } from "@/contexts/AppContext";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { OrderItem, OrderStatus, MenuItem, MenuPage } from '@/types';
import { PeopleCountDialog } from "@/components/tables/PeopleCountDialog";
import { MenuBooklet } from "@/components/menu/MenuBooklet";
import { mockMenuPages, mockDrinksPages } from '@/data/mockMenuPages';
import { 
  Plus, Minus, ArrowRight, ShoppingCart, 
  X, Users, Receipt, Trash2, Clock, UtensilsCrossed,
  Wine, Search, Send, Printer
} from 'lucide-react';
import seaLogo from "@/assets/sea-logo.jpg";
import { cn } from '@/lib/utils';

type MenuType = 'food' | 'drinks';

export const MenuView = () => {
  const { 
    menuItems, 
    createOrder, 
    tables, 
    orders, 
    updateMenuItem,
    addMenuItem,
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
  const [menuType, setMenuType] = useState<MenuType>('food');
  const [foodPages, setFoodPages] = useState<MenuPage[]>(mockMenuPages);
  const [drinksPages, setDrinksPages] = useState<MenuPage[]>(mockDrinksPages);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MenuItem[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  
  const isAdmin = user?.role === 'admin';
  const currentTable = tables.find(t => t.id === selectedTable);
  
  // Check if people count is 0 and prompt
  useEffect(() => {
    if (selectedTable && currentTable && !isAdmin) {
      if ((currentTable.peopleCount || 0) === 0) {
        setIsPeopleDialogOpen(true);
      }
    }
  }, [selectedTable, currentTable, isAdmin]);
  
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

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = menuItems.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, menuItems]);

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
    toast.success(`تمت إضافة ${item.name} للطلب`, { duration: 1500 });
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

    if (getCurrentTablePeopleCount() === 0) {
      toast.error("يجب تحديد عدد الأشخاص أولاً");
      setIsPeopleDialogOpen(true);
      return;
    }
    
    const orderData = {
      tableNumber: selectedTable,
      items: currentOrderItems,
      totalAmount: calculateTotalAmount(currentOrderItems),
      peopleCount: getCurrentTablePeopleCount(),
      status: 'pending' as OrderStatus,
      waiterId: '',
      delayed: false,
      isPaid: false
    };

    createOrder(orderData);
    toast.success("تم إرسال الطلب للمطبخ والطابعات بنجاح!", { duration: 3000 });
    setShowCart(false);
  };

  // Menu page management
  const currentPages = menuType === 'food' ? foodPages : drinksPages;
  const setCurrentPages = menuType === 'food' ? setFoodPages : setDrinksPages;

  const handlePageUpdate = (page: MenuPage) => {
    setCurrentPages(pages => pages.map(p => p.id === page.id ? page : p));
    toast.success("تم تحديث الصفحة");
  };

  const handlePageCreate = (page: Omit<MenuPage, 'id'>) => {
    const newPage: MenuPage = {
      ...page,
      id: `page-${Date.now()}`
    };
    setCurrentPages(pages => [...pages, newPage]);
    toast.success("تمت إضافة الصفحة");
  };

  const handlePageDelete = (pageId: string) => {
    setCurrentPages(pages => pages.filter(p => p.id !== pageId));
    toast.success("تم حذف الصفحة");
  };

  const handleItemCreate = (item: Omit<MenuItem, 'id'>) => {
    // Add the item to menu
    addMenuItem(item);
    
    // We need to add to current page after creation
    // For now the item is added to global menu
    toast.success("تمت إضافة الطبق");
  };

  const handleSearchItemAdd = (item: MenuItem) => {
    handleAddToCart(item, 1);
    setSearchQuery('');
    setShowSearch(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-background to-cream">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            {/* Logo & Info */}
            <div className="flex items-center gap-2 sm:gap-4">
              <img 
                src={seaLogo} 
                alt="SEA" 
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl object-cover shadow-md ring-2 ring-primary/20" 
              />
              
              <div className="hidden sm:block">
                <h1 className="text-xl font-display font-bold text-primary">
                  SEA Restaurant
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge className="sea-badge-primary text-xs">
                    طاولة {selectedTable}
                  </Badge>
                </div>
              </div>
              
              <Badge className="sm:hidden sea-badge-primary">
                طاولة {selectedTable}
              </Badge>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Search Toggle */}
              <Button
                onClick={() => setShowSearch(!showSearch)}
                variant="outline"
                size="icon"
                className="h-9 w-9 sm:h-10 sm:w-10"
              >
                <Search className="w-4 h-4" />
              </Button>
              
              {/* People Count Button */}
              <Button
                onClick={() => setIsPeopleDialogOpen(true)}
                variant="outline"
                size="sm"
                className="hidden sm:flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                <span>{getCurrentTablePeopleCount()} أشخاص</span>
              </Button>

              <Button
                onClick={() => navigate('/tables')}
                variant="outline"
                size="icon"
                className="h-9 w-9 sm:h-10 sm:w-10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="mt-3 relative">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث عن طبق أو مشروب..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 text-base"
                  autoFocus
                />
              </div>
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-border max-h-64 overflow-y-auto z-50">
                  {searchResults.map(item => (
                    <div 
                      key={item.id}
                      className="flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer border-b border-border last:border-0"
                      onClick={() => handleSearchItemAdd(item)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          {item.category === 'drinks' ? (
                            <Wine className="w-5 h-5 text-info" />
                          ) : (
                            <UtensilsCrossed className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.category === 'drinks' ? 'مشروبات' : 'طعام'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary">${item.price}</span>
                        <Button size="sm" className="h-8 sea-btn-primary">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Menu Type Switch */}
          <div className="flex gap-2 mt-3">
            <Button
              onClick={() => setMenuType('food')}
              variant={menuType === 'food' ? 'default' : 'outline'}
              className={cn(
                "flex-1 gap-2",
                menuType === 'food' && "sea-btn-primary"
              )}
            >
              <UtensilsCrossed className="w-4 h-4" />
              قائمة الطعام
            </Button>
            <Button
              onClick={() => setMenuType('drinks')}
              variant={menuType === 'drinks' ? 'default' : 'outline'}
              className={cn(
                "flex-1 gap-2",
                menuType === 'drinks' && "bg-info hover:bg-info/90 text-white"
              )}
            >
              <Wine className="w-4 h-4" />
              المشروبات
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Menu Booklet */}
      <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-28 sm:pb-32">
        <MenuBooklet
          menuItems={menuItems}
          menuPages={currentPages}
          isAdmin={isAdmin}
          currentOrderItems={currentOrderItems}
          onAddToCart={handleAddToCart}
          onUpdateQuantity={handleUpdateQuantity}
          onPageUpdate={handlePageUpdate}
          onPageCreate={handlePageCreate}
          onPageDelete={handlePageDelete}
          onItemUpdate={updateMenuItem}
          onItemCreate={handleItemCreate}
          onItemDelete={deleteMenuItem}
        />
      </div>

      {/* Floating Cart Button */}
      {!isAdmin && (
        <div className="fixed bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-40">
          <Button
            onClick={() => setShowCart(true)}
            className={cn(
              "relative font-bold px-6 sm:px-8 py-5 sm:py-6 rounded-2xl shadow-2xl flex items-center gap-3",
              "sea-btn-primary hover:scale-105 transition-transform"
            )}
            size="lg"
          >
            <div className="relative">
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
              {getTotalItems() > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground font-bold shadow-md px-1.5 py-0 text-xs min-w-[18px] h-[18px] flex items-center justify-center">
                  {getTotalItems()}
                </Badge>
              )}
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xs opacity-80">سلة الطلبات</span>
              <span className="text-base sm:text-lg font-bold">
                ${calculateTotalAmount(currentOrderItems).toFixed(2)}
              </span>
            </div>
          </Button>
        </div>
      )}

      {/* Mobile People Count Button */}
      {!isAdmin && (
        <Button
          onClick={() => setIsPeopleDialogOpen(true)}
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 sm:hidden h-12 w-12 rounded-full shadow-lg bg-white z-40"
        >
          <Users className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {getCurrentTablePeopleCount()}
          </span>
        </Button>
      )}

      {/* Cart Sheet */}
      <Sheet open={showCart} onOpenChange={setShowCart}>
        <SheetContent side="bottom" className="h-[85vh] p-0 rounded-t-3xl">
          <div className="flex flex-col h-full">
            <SheetHeader className="gradient-primary text-primary-foreground p-4 sm:p-6 rounded-t-3xl">
              <SheetTitle className="text-xl sm:text-2xl font-bold text-primary-foreground flex items-center gap-3">
                <Receipt className="w-6 h-6 sm:w-7 sm:h-7" />
                سلة الطلبات
              </SheetTitle>
              <p className="text-primary-foreground/90 text-sm sm:text-base mt-1">
                الطاولة {selectedTable} • {getTotalItems()} عنصر • {getCurrentTablePeopleCount()} أشخاص
              </p>
            </SheetHeader>

            <ScrollArea className="flex-1 p-4 sm:p-6">
              {currentOrderItems.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingCart className="w-20 h-20 mx-auto text-muted/30 mb-4" />
                  <p className="text-muted-foreground text-xl font-bold mb-2">السلة فارغة</p>
                  <p className="text-muted-foreground/70">أضف بعض الأطباق للبدء</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentOrderItems.map((item, index) => {
                    const menuItem = menuItems.find(m => m.id === item.menuItemId);
                    return (
                      <div 
                        key={index}
                        className="sea-card p-3 sm:p-4"
                      >
                        <div className="flex gap-3">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                            {menuItem?.image && menuItem.image !== '/placeholder.svg' ? (
                              <img 
                                src={menuItem.image} 
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <UtensilsCrossed className="w-6 h-6 text-muted-foreground/30" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-bold text-base sm:text-lg text-foreground leading-tight">
                                  {item.name}
                                </h4>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  ${item.price} × {item.quantity}
                                </p>
                              </div>
                              <Button
                                onClick={() => handleRemoveFromCart(item.menuItemId)}
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-full"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 bg-muted rounded-full p-1">
                                <Button
                                  onClick={() => handleUpdateQuantity(item.menuItemId, -1)}
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-destructive hover:text-destructive-foreground"
                                >
                                  <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                                <span className="font-bold text-base sm:text-lg w-8 text-center">{item.quantity}</span>
                                <Button
                                  onClick={() => handleUpdateQuantity(item.menuItemId, 1)}
                                  size="icon"
                                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-full sea-btn-primary"
                                >
                                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                              </div>
                              
                              <span className="font-bold text-lg sm:text-xl text-primary">
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
              <div className="border-t-2 border-border p-4 sm:p-6 bg-muted/30">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-muted-foreground">المجموع الفرعي</span>
                    <span className="font-bold">${calculateTotalAmount(currentOrderItems).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-muted-foreground">الضريبة (10%)</span>
                    <span className="font-bold">${(calculateTotalAmount(currentOrderItems) * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between text-lg sm:text-xl font-bold">
                    <span>المجموع الكلي</span>
                    <span className="text-primary">
                      ${(calculateTotalAmount(currentOrderItems) * 1.1).toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleSendOrder}
                  className="w-full sea-btn-primary text-base sm:text-lg font-bold py-5 sm:py-6 rounded-xl"
                  size="lg"
                >
                  <Send className="w-5 h-5 ml-2" />
                  إرسال الطلب للمطبخ
                  <Printer className="w-5 h-5 mr-2" />
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
      
      {/* People Count Dialog */}
      <PeopleCountDialog
        isOpen={isPeopleDialogOpen}
        onClose={() => {
          if (getCurrentTablePeopleCount() === 0 && !isAdmin) {
            toast.error("يجب تحديد عدد الأشخاص للمتابعة");
            return;
          }
          setIsPeopleDialogOpen(false);
        }}
        currentCount={getCurrentTablePeopleCount()}
        onConfirm={handlePeopleCountConfirm}
        isEditing={getCurrentTablePeopleCount() > 0}
      />
    </div>
  );
};
