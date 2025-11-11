import React, { useState, useEffect } from 'react';
import { useApp } from "@/contexts/AppContext";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { OrderItem, OrderStatus, MenuItem } from '@/types';
import { PeopleCountDialog } from "@/components/tables/PeopleCountDialog";
import { Plus, Minus, ArrowRight, Heart, ShoppingCart, Soup, UtensilsCrossed, Cake, Coffee, Salad, X } from 'lucide-react';
import seaLogo from "@/assets/sea-logo.jpg";

const categories = [
  { id: "appetizers", name: "المقبلات", icon: Salad },
  { id: "main_dishes", name: "الأطباق الرئيسية", icon: UtensilsCrossed },
  { id: "desserts", name: "الحلويات", icon: Cake },
  { id: "drinks", name: "المشروبات", icon: Coffee },
  { id: "sides", name: "الأطباق الجانبية", icon: Soup },
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
    (item) => item.category === activeCategory && item.isAvailable
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
    
    toast.success("تم إرسال الطلب بنجاح!");
    navigate('/tables');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-accent to-primary backdrop-blur-md border-b border-white/10 sticky top-0 z-40 shadow-xl">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="relative">
                <img src={seaLogo} alt="SEA" className="h-16 w-16 rounded-2xl object-cover shadow-2xl ring-4 ring-white/20" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-primary-foreground tracking-tight">SEA Restaurant</h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-2 w-2 rounded-full bg-secondary animate-pulse"></div>
                  <p className="text-sm text-primary-foreground/90 font-medium">الطاولة {selectedTable}</p>
                </div>
              </div>
            </div>
            
            <Button
              onClick={() => navigate('/tables')}
              className="relative bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
              size="lg"
            >
              <ShoppingCart className="h-6 w-6" />
              {getTotalItems() > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-secondary text-primary font-bold shadow-lg animate-bounce">
                  {getTotalItems()}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Categories */}
        <div className="mb-8 bg-white/80 backdrop-blur-lg rounded-3xl p-3 shadow-2xl border border-border/50">
          <div className="grid grid-cols-5 gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setSelectedDish(null);
                  }}
                  className={`flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-300 transform ${
                    activeCategory === cat.id
                      ? "bg-gradient-to-br from-primary to-accent text-white shadow-xl scale-105 ring-4 ring-primary/20"
                      : "bg-gradient-to-br from-muted/50 to-muted/30 text-foreground hover:bg-muted hover:scale-105 shadow-md"
                  }`}
                >
                  <div className={`p-2 rounded-xl ${activeCategory === cat.id ? 'bg-white/20' : 'bg-white/50'}`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <span className="text-sm font-bold text-center leading-tight">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Subcategories for Appetizers */}
        {activeCategory === "appetizers" && (
          <div className="mb-6 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <Button variant="outline" size="sm" className="whitespace-nowrap bg-white/70 backdrop-blur-sm hover:bg-primary hover:text-white border-2 shadow-md transition-all duration-300">الكل</Button>
            <Button variant="outline" size="sm" className="whitespace-nowrap bg-white/70 backdrop-blur-sm hover:bg-primary hover:text-white border-2 shadow-md transition-all duration-300">سلطات</Button>
            <Button variant="outline" size="sm" className="whitespace-nowrap bg-white/70 backdrop-blur-sm hover:bg-primary hover:text-white border-2 shadow-md transition-all duration-300">شوربات</Button>
            <Button variant="outline" size="sm" className="whitespace-nowrap bg-white/70 backdrop-blur-sm hover:bg-primary hover:text-white border-2 shadow-md transition-all duration-300">مقبلات ساخنة</Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Items Grid */}
          <div className={`${selectedDish ? "lg:col-span-2" : "lg:col-span-3"}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  onClick={() => {
                    setSelectedDish(item);
                    setQuantity(1);
                  }}
                  className="group cursor-pointer overflow-hidden bg-gradient-to-br from-white via-white to-muted/20 backdrop-blur-lg border-2 border-border/50 hover:border-primary hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2"
                >
                  <div className="relative aspect-square overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-125 group-hover:rotate-2 transition-all duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-muted via-muted/50 to-accent/10 flex items-center justify-center">
                        <span className="text-7xl opacity-40">🍽️</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Badge className="absolute top-3 left-3 bg-green-500 text-white font-bold shadow-lg border border-white/20 backdrop-blur-sm">
                      متوفر
                    </Badge>
                    {item.volume && (
                      <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg backdrop-blur-sm border border-white/20">
                        {item.volume}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5">
                    <h3 className="font-bold text-xl mb-2 text-foreground group-hover:text-primary transition-colors">{item.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{item.description}</p>
                    {item.ingredients && (
                      <p className="text-xs text-muted-foreground/70 line-clamp-1 mb-3 italic">
                        {item.ingredients}
                      </p>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-border/50">
                      <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">${item.price}</span>
                      <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Dish Details Panel */}
          {selectedDish && (
            <div className="lg:col-span-1">
              <Card className="sticky top-24 bg-gradient-to-br from-white via-white to-muted/20 backdrop-blur-xl border-2 border-primary/30 shadow-2xl overflow-hidden rounded-3xl">
                <div className="relative">
                  <Button
                    onClick={() => setSelectedDish(null)}
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 left-4 z-10 bg-white/90 hover:bg-white text-primary rounded-full shadow-xl border-2 border-primary/20 backdrop-blur-sm"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                  
                  <div className="aspect-square overflow-hidden relative">
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
                      <div className="w-full h-full bg-gradient-to-br from-muted via-muted/50 to-accent/20 flex items-center justify-center">
                        <span className="text-9xl opacity-40">🍽️</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-7 space-y-5">
                  <div className="flex items-start justify-between">
                    <h2 className="text-3xl font-bold text-foreground leading-tight">{selectedDish.name}</h2>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-300">
                      <Heart className="h-7 w-7" />
                    </Button>
                  </div>

                  {/* Nutritional Info */}
                  {(selectedDish.volume || selectedDish.calories) && (
                    <div className="bg-gradient-to-r from-primary to-accent text-white rounded-2xl p-4 flex items-center justify-between shadow-lg">
                      {selectedDish.volume && (
                        <div className="flex flex-col">
                          <span className="text-xs opacity-80">الحجم</span>
                          <span className="font-bold text-lg">{selectedDish.volume}</span>
                        </div>
                      )}
                      {selectedDish.calories && (
                        <div className="flex flex-col items-end">
                          <span className="text-xs opacity-80">السعرات</span>
                          <span className="font-bold text-lg">{selectedDish.calories}</span>
                        </div>
                      )}
                      <div className="p-2 bg-white/20 rounded-full">
                        <Heart className="h-5 w-5 fill-white" />
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div className="bg-muted/30 rounded-2xl p-4 border border-border/50">
                    <p className="text-muted-foreground leading-relaxed text-sm">{selectedDish.description}</p>
                  </div>

                  {/* Ingredients */}
                  {selectedDish.ingredients && (
                    <div className="bg-gradient-to-br from-accent/10 to-primary/5 rounded-2xl p-5 border border-accent/20 shadow-sm">
                      <h3 className="font-bold mb-3 text-foreground flex items-center gap-2">
                        <div className="w-1 h-5 bg-gradient-to-b from-primary to-accent rounded-full"></div>
                        المكونات
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedDish.ingredients}
                      </p>
                    </div>
                  )}

                  {/* Price */}
                  <div className="text-center py-4 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl">
                    <p className="text-xs text-muted-foreground mb-1">السعر</p>
                    <span className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">${selectedDish.price}</span>
                  </div>

                  {/* Quantity Selector */}
                  <div className="flex items-center justify-center gap-6 bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 rounded-full p-3 border border-border/50">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuantity(Math.max(1, quantity - 1));
                      }}
                      size="icon"
                      className="rounded-full h-12 w-12 bg-gradient-to-br from-primary to-accent hover:shadow-xl transition-all duration-300 hover:scale-110"
                    >
                      <Minus className="h-5 w-5" />
                    </Button>
                    <span className="font-bold text-3xl w-16 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{quantity}</span>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuantity(quantity + 1);
                      }}
                      size="icon"
                      className="rounded-full h-12 w-12 bg-gradient-to-br from-primary to-accent hover:shadow-xl transition-all duration-300 hover:scale-110"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Order Button */}
                  <Button
                    onClick={() => handleAddToCart(selectedDish, quantity)}
                    className="w-full bg-gradient-to-r from-secondary via-accent to-secondary hover:shadow-2xl text-primary text-xl font-bold py-7 rounded-full transition-all duration-300 hover:scale-[1.02] shadow-lg"
                    size="lg"
                  >
                    إضافة للطلب
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
      
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
