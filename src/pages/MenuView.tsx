import React, { useState, useEffect } from 'react';
import { useApp } from "@/contexts/AppContext";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { OrderItem, OrderStatus, MenuItem } from '@/types';
import { PeopleCountDialog } from "@/components/tables/PeopleCountDialog";
import { 
  Plus, Minus, ArrowRight, Heart, ShoppingCart, Soup, UtensilsCrossed, 
  Cake, Coffee, Salad, X, Search, ChevronRight, Sparkles, Clock,
  Users, Receipt, Flame, Star, Trash2
} from 'lucide-react';
import seaLogo from "@/assets/sea-logo.jpg";

const categories = [
  { id: "appetizers", name: "المقبلات", icon: Salad, color: "from-emerald-500 to-teal-600" },
  { id: "main_dishes", name: "الأطباق الرئيسية", icon: UtensilsCrossed, color: "from-orange-500 to-red-600" },
  { id: "desserts", name: "الحلويات", icon: Cake, color: "from-pink-500 to-rose-600" },
  { id: "drinks", name: "المشروبات", icon: Coffee, color: "from-blue-500 to-cyan-600" },
  { id: "sides", name: "الأطباق الجانبية", icon: Soup, color: "from-purple-500 to-indigo-600" },
];

export const MenuView = () => {
  const { 
    menuItems, 
    createOrder, 
    tables, 
    orders, 
    cancelOrderItem, 
    updateTablePeopleCount 
  } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get("table");
  const selectedTable = tableId ? parseInt(tableId) : null;
  const [activeCategory, setActiveCategory] = useState("appetizers");
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [currentOrderItems, setCurrentOrderItems] = useState<OrderItem[]>([]);
  const [isPeopleDialogOpen, setIsPeopleDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCart, setShowCart] = useState(false);
  
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

  const filteredItems = menuItems.filter(
    (item) => item.category === activeCategory && item.isAvailable &&
    (searchQuery === "" || item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     item.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddToCart = (item: MenuItem, qty: number = quantity) => {
    const existingTable = tables.find(t => t.id === selectedTable);
    const existingOrderId = existingTable?.currentOrderId;
    const existingOrder = existingOrderId ? orders.find(o => o.id === existingOrderId) : undefined;

    const orderItem: OrderItem = {
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity: qty,
      notes: '',
      completed: false
    };

    // Update local state
    const itemExists = currentOrderItems.some(i => i.menuItemId === item.id);
    if (itemExists) {
      setCurrentOrderItems(prevItems => 
        prevItems.map(i => i.menuItemId === item.id ? 
          { ...i, quantity: i.quantity + qty } : i
        )
      );
    } else {
      setCurrentOrderItems(prevItems => [...prevItems, orderItem]);
    }

    // Create/update the order
    const orderData = {
      tableNumber: selectedTable,
      items: itemExists ? currentOrderItems.map(i => 
        i.menuItemId === item.id ? { ...i, quantity: i.quantity + qty } : i
      ) : [...currentOrderItems, orderItem],
      totalAmount: calculateTotalAmount(itemExists ? 
        currentOrderItems.map(i => i.menuItemId === item.id ? { ...i, quantity: i.quantity + qty } : i) 
        : [...currentOrderItems, orderItem]
      ),
      peopleCount: tables.find(t => t.id === selectedTable)?.peopleCount,
      status: 'pending' as OrderStatus,
      waiterId: '',
      delayed: false,
      isPaid: false
    };

    createOrder(orderData);
    
    toast.success(`تمت إضافة ${item.name} للطلب`);
    setSelectedDish(null);
    setQuantity(1);
  };

  const handleRemoveFromCart = (menuItemId: string) => {
    setCurrentOrderItems(prevItems => prevItems.filter(i => i.menuItemId !== menuItemId));
    toast.success("تم حذف الطبق من السلة");
  };

  const handleUpdateQuantity = (menuItemId: string, delta: number) => {
    setCurrentOrderItems(prevItems => 
      prevItems.map(i => {
        if (i.menuItemId === menuItemId) {
          const newQuantity = Math.max(1, i.quantity + delta);
          return { ...i, quantity: newQuantity };
        }
        return i;
      })
    );
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
    
    // Update the order
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Enhanced Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Info */}
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <img 
                  src={seaLogo} 
                  alt="SEA" 
                  className="relative h-16 w-16 rounded-2xl object-cover shadow-xl ring-4 ring-white/50" 
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  SEA Restaurant
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <Badge className="bg-gradient-to-r from-primary to-accent text-white font-bold shadow-md">
                    <Users className="w-3 h-3 mr-1" />
                    طاولة {selectedTable}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate('/tables')}
                variant="outline"
                className="border-2 hover:bg-slate-100"
              >
                <X className="h-5 w-5 ml-2" />
                إغلاق
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="ابحث عن طبق..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-12 h-14 text-lg bg-white/80 backdrop-blur-sm border-2 border-slate-200 focus:border-primary rounded-2xl shadow-lg"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setSelectedDish(null);
                  }}
                  className={`flex-shrink-0 flex flex-col items-center gap-3 p-5 rounded-2xl transition-all duration-300 transform min-w-[140px] ${
                    activeCategory === cat.id
                      ? `bg-gradient-to-br ${cat.color} text-white shadow-2xl scale-105 ring-4 ring-white/30`
                      : "bg-white text-foreground hover:bg-slate-50 hover:scale-105 shadow-lg border-2 border-slate-200"
                  }`}
                >
                  <div className={`p-3 rounded-xl ${activeCategory === cat.id ? 'bg-white/20' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <span className="text-sm font-bold text-center leading-tight">{cat.name}</span>
                  {activeCategory === cat.id && (
                    <div className="h-1 w-12 bg-white rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="pb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  className="group cursor-pointer overflow-hidden bg-white hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-slate-200 hover:border-primary rounded-3xl"
                  onClick={() => {
                    setSelectedDish(item);
                    setQuantity(1);
                  }}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {item.image ? (
                      <>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 flex items-center justify-center">
                        <span className="text-7xl opacity-40">🍽️</span>
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <Badge className="bg-green-500 text-white font-bold shadow-xl border-2 border-white/50 backdrop-blur-sm">
                        <Sparkles className="w-3 h-3 mr-1" />
                        متوفر
                      </Badge>
                      {item.calories && (
                        <Badge className="bg-orange-500 text-white font-bold shadow-xl border-2 border-white/50 backdrop-blur-sm">
                          <Flame className="w-3 h-3 mr-1" />
                          {item.calories}
                        </Badge>
                      )}
                    </div>

                    {item.volume && (
                      <Badge className="absolute top-3 right-3 bg-white/90 text-primary font-bold shadow-xl backdrop-blur-sm">
                        {item.volume}
                      </Badge>
                    )}
                  </div>
                  
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors leading-tight flex-1">
                        {item.name}
                      </h3>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.success("تمت الإضافة للمفضلة");
                        }}
                      >
                        <Heart className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                      {item.description}
                    </p>
                    
                    {item.ingredients && (
                      <p className="text-xs text-slate-500 line-clamp-1 mb-4 italic bg-slate-50 p-2 rounded-lg">
                        {item.ingredients}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground mb-1">السعر</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                          ${item.price}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="w-4 h-4 fill-amber-500" />
                          <span className="font-bold text-sm">4.8</span>
                        </div>
                        
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(item, 1);
                          }}
                          size="sm"
                          className="bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 font-bold px-4"
                        >
                          <ShoppingCart className="w-4 h-4 ml-1" />
                          إضافة
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>

      {/* Floating Cart Button - Center Bottom */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
        <Button
          onClick={() => setShowCart(true)}
          className="relative bg-white hover:bg-slate-50 text-foreground font-bold transition-all duration-200 hover:shadow-xl px-8 py-6 rounded-2xl shadow-lg border-2 border-slate-200 backdrop-blur-xl flex items-center gap-3"
          size="lg"
        >
          <div className="relative">
            <ShoppingCart className="h-6 w-6" />
            {getTotalItems() > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-primary text-white font-bold shadow-md px-2 py-0.5 text-xs min-w-[20px] h-5 flex items-center justify-center">
                {getTotalItems()}
              </Badge>
            )}
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm text-muted-foreground">سلة الطلبات</span>
            <span className="text-lg font-bold">
              ${calculateTotalAmount(currentOrderItems).toFixed(2)}
            </span>
          </div>
        </Button>
      </div>

      {/* Cart Sheet */}
      <Sheet open={showCart} onOpenChange={setShowCart}>
        <SheetContent side="bottom" className="h-[85vh] p-0 rounded-t-3xl">
          <div className="flex flex-col h-full">
            <SheetHeader className="bg-gradient-to-r from-primary via-accent to-primary text-white p-6 rounded-t-3xl">
              <SheetTitle className="text-3xl font-bold text-white flex items-center gap-3">
                <Receipt className="w-8 h-8" />
                سلة الطلبات
              </SheetTitle>
              <p className="text-white/90 text-lg mt-2">
                الطاولة {selectedTable} • {getTotalItems()} عنصر
              </p>
            </SheetHeader>

            <ScrollArea className="flex-1 p-6">
              {currentOrderItems.length === 0 ? (
                <div className="text-center py-20">
                  <div className="relative inline-block">
                    <ShoppingCart className="w-32 h-32 mx-auto text-slate-200 mb-6" />
                    <Sparkles className="w-12 h-12 absolute top-0 right-0 text-amber-400 animate-bounce" />
                  </div>
                  <p className="text-muted-foreground text-2xl font-bold mb-2">السلة فارغة</p>
                  <p className="text-lg text-slate-400">أضف بعض الأطباق اللذيذة للبدء! 🍽️</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentOrderItems.map((item, index) => {
                    const menuItem = menuItems.find(m => m.id === item.menuItemId);
                    return (
                      <div 
                        key={index}
                        className="bg-gradient-to-br from-white via-slate-50 to-blue-50 rounded-2xl p-5 border-2 border-slate-200 hover:border-primary hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                      >
                        <div className="flex gap-4">
                          {menuItem?.image && (
                            <div className="w-28 h-28 rounded-2xl overflow-hidden flex-shrink-0 ring-4 ring-white shadow-lg">
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
                                className="h-10 w-10 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 bg-white rounded-full p-2 border-2 border-slate-200 shadow-md">
                                <Button
                                  onClick={() => handleUpdateQuantity(item.menuItemId, -1)}
                                  size="icon"
                                  className="h-10 w-10 rounded-full bg-slate-100 hover:bg-red-500 hover:text-white transition-all duration-200 hover:scale-110 active:scale-90"
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-5 w-5" />
                                </Button>
                                <span className="font-bold text-2xl w-12 text-center">{item.quantity}</span>
                                <Button
                                  onClick={() => handleUpdateQuantity(item.menuItemId, 1)}
                                  size="icon"
                                  className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent text-white transition-all duration-200 hover:scale-110 active:scale-90 shadow-lg"
                                >
                                  <Plus className="h-5 w-5" />
                                </Button>
                              </div>
                              
                              <span className="font-bold text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
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
              <div className="border-t-4 border-slate-200 p-6 bg-gradient-to-br from-slate-50 via-white to-blue-50">
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-lg">
                    <span className="text-muted-foreground font-medium">المجموع الفرعي</span>
                    <span className="font-bold text-xl">${calculateTotalAmount(currentOrderItems).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-muted-foreground font-medium">الضريبة (10%)</span>
                    <span className="font-bold text-xl">${(calculateTotalAmount(currentOrderItems) * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"></div>
                  <div className="flex justify-between text-2xl font-bold">
                    <span>المجموع الكلي</span>
                    <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent text-3xl">
                      ${(calculateTotalAmount(currentOrderItems) * 1.1).toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleSendOrder}
                  className="w-full bg-gradient-to-r from-primary via-accent to-primary hover:shadow-2xl text-white text-2xl font-bold py-8 rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-xl"
                  size="lg"
                >
                  <Receipt className="w-7 h-7 ml-3" />
                  إرسال الطلب للمطبخ
                  <ArrowRight className="w-7 h-7 mr-3" />
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Dish Detail Modal */}
      {selectedDish && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedDish(null)}
        >
          <Card 
            className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <Button
                onClick={() => setSelectedDish(null)}
                variant="ghost"
                size="icon"
                className="absolute top-4 left-4 z-10 bg-white/90 hover:bg-white text-primary rounded-full shadow-xl"
              >
                <X className="h-5 w-5" />
              </Button>
              
              <div className="aspect-video overflow-hidden relative">
                {selectedDish.image ? (
                  <>
                    <img
                      src={selectedDish.image}
                      alt={selectedDish.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 flex items-center justify-center">
                    <span className="text-9xl opacity-40">🍽️</span>
                  </div>
                )}
                
                <div className="absolute bottom-6 left-6 right-6">
                  <h2 className="text-4xl font-bold text-white drop-shadow-2xl mb-2">
                    {selectedDish.name}
                  </h2>
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-white font-bold ml-2">(4.8)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {/* Nutritional Info */}
              {(selectedDish.volume || selectedDish.calories) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedDish.volume && (
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border-2 border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Coffee className="w-5 h-5 text-blue-600" />
                        <span className="text-xs text-blue-600 font-semibold">الحجم</span>
                      </div>
                      <span className="font-bold text-2xl text-blue-900">{selectedDish.volume}</span>
                    </div>
                  )}
                  {selectedDish.calories && (
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-4 border-2 border-orange-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Flame className="w-5 h-5 text-orange-600" />
                        <span className="text-xs text-orange-600 font-semibold">السعرات</span>
                      </div>
                      <span className="font-bold text-2xl text-orange-900">{selectedDish.calories}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-full"></div>
                  الوصف
                </h3>
                <p className="text-muted-foreground leading-relaxed bg-slate-50 p-4 rounded-2xl">
                  {selectedDish.description}
                </p>
              </div>

              {/* Ingredients */}
              {selectedDish.ingredients && (
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-accent to-secondary rounded-full"></div>
                    المكونات
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-2xl border-2 border-emerald-200">
                    {selectedDish.ingredients}
                  </p>
                </div>
              )}

              {/* Price & Quantity */}
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border-2 border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">السعر</p>
                    <span className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      ${selectedDish.price}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 bg-white rounded-full p-2 border-2 border-slate-200 shadow-lg">
                    <Button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      size="icon"
                      className="rounded-full h-12 w-12 bg-slate-100 hover:bg-red-500 hover:text-white transition-all duration-200 hover:scale-110 active:scale-90"
                    >
                      <Minus className="h-5 w-5" />
                    </Button>
                    <span className="font-bold text-3xl w-16 text-center">{quantity}</span>
                    <Button
                      onClick={() => setQuantity(quantity + 1)}
                      size="icon"
                      className="rounded-full h-12 w-12 bg-gradient-to-br from-primary to-accent text-white transition-all duration-200 hover:scale-110 active:scale-90 shadow-lg"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={() => handleAddToCart(selectedDish, quantity)}
                  className="w-full bg-gradient-to-r from-primary via-accent to-primary hover:shadow-2xl text-white text-xl font-bold py-7 rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-xl"
                  size="lg"
                >
                  <ShoppingCart className="w-6 h-6 ml-2" />
                  إضافة للسلة • ${(selectedDish.price * quantity).toFixed(2)}
                  <ArrowRight className="w-6 h-6 mr-2" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
      
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
