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
    <div className="min-h-screen bg-gradient-to-br from-primary via-muted to-primary/90">
      {/* Header */}
      <div className="bg-primary/95 backdrop-blur-sm border-b border-secondary/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={seaLogo} alt="SEA" className="h-12 w-12 rounded-full object-cover shadow-lg" />
              <div>
                <h1 className="text-2xl font-bold text-primary-foreground">SEA Restaurant</h1>
                <p className="text-sm text-secondary">الطاولة {selectedTable}</p>
              </div>
            </div>
            
            <Button
              onClick={() => navigate('/tables')}
              className="relative bg-secondary hover:bg-secondary/90 text-primary"
              size="lg"
            >
              <ShoppingCart className="h-5 w-5" />
              {getTotalItems() > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-accent text-accent-foreground">
                  {getTotalItems()}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Categories */}
        <div className="mb-6 bg-primary/50 backdrop-blur-sm rounded-2xl p-2 shadow-xl border border-secondary/20">
          <div className="grid grid-cols-5 gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setSelectedDish(null);
                  }}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300 ${
                    activeCategory === cat.id
                      ? "bg-secondary text-primary shadow-lg scale-105"
                      : "bg-primary/30 text-secondary hover:bg-primary/40"
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs font-medium text-center">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Subcategories for Soup */}
        {activeCategory === "appetizers" && (
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
            <Button variant="outline" size="sm" className="whitespace-nowrap">الكل</Button>
            <Button variant="outline" size="sm" className="whitespace-nowrap">سلطات</Button>
            <Button variant="outline" size="sm" className="whitespace-nowrap">شوربات</Button>
            <Button variant="outline" size="sm" className="whitespace-nowrap">مقبلات ساخنة</Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu Items Grid */}
          <div className={`${selectedDish ? "lg:col-span-2" : "lg:col-span-3"}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  onClick={() => {
                    setSelectedDish(item);
                    setQuantity(1);
                  }}
                  className="group cursor-pointer overflow-hidden bg-card/95 backdrop-blur-sm border-2 border-secondary/20 hover:border-secondary hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <div className="relative aspect-square overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-muted to-primary/20 flex items-center justify-center">
                        <span className="text-6xl opacity-30">🍽️</span>
                      </div>
                    )}
                    <Badge className="absolute top-2 left-2 bg-secondary text-primary font-bold">
                      متوفر
                    </Badge>
                    {item.volume && (
                      <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground px-2 py-1 rounded-lg text-xs">
                        +{item.volume.replace('ml', '').replace('g', '')}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 text-card-foreground">{item.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{item.description}</p>
                    {item.ingredients && (
                      <p className="text-xs text-muted-foreground/70 line-clamp-1 mb-2">
                        {item.ingredients}
                      </p>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-primary">${item.price}</span>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Dish Details Panel */}
          {selectedDish && (
            <div className="lg:col-span-1">
              <Card className="sticky top-24 bg-card/95 backdrop-blur-sm border-2 border-secondary shadow-2xl overflow-hidden">
                <div className="relative">
                  <Button
                    onClick={() => setSelectedDish(null)}
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 left-2 z-10 bg-primary/80 hover:bg-primary text-primary-foreground rounded-full"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                  
                  <div className="aspect-square overflow-hidden">
                    {selectedDish.image ? (
                      <img
                        src={selectedDish.image}
                        alt={selectedDish.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-muted to-primary/20 flex items-center justify-center">
                        <span className="text-8xl opacity-30">🍽️</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <h2 className="text-2xl font-bold text-card-foreground">{selectedDish.name}</h2>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80">
                      <Heart className="h-6 w-6" />
                    </Button>
                  </div>

                  {/* Nutritional Info */}
                  {(selectedDish.volume || selectedDish.calories) && (
                    <div className="bg-primary text-primary-foreground rounded-lg p-3 flex items-center justify-between">
                      {selectedDish.volume && (
                        <span className="font-semibold">{selectedDish.volume}</span>
                      )}
                      {selectedDish.calories && (
                        <span className="font-semibold">{selectedDish.calories}cal</span>
                      )}
                      <Heart className="h-5 w-5 fill-primary-foreground" />
                      <span className="font-bold">348</span>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed">{selectedDish.description}</p>

                  {/* Ingredients */}
                  {selectedDish.ingredients && (
                    <div className="bg-muted/30 rounded-lg p-4">
                      <h3 className="font-semibold mb-2 text-sm">المكونات:</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedDish.ingredients}
                      </p>
                    </div>
                  )}

                  {/* Price */}
                  <div className="text-center py-2">
                    <span className="text-4xl font-bold text-primary">${selectedDish.price}</span>
                  </div>

                  {/* Quantity Selector */}
                  <div className="flex items-center justify-center gap-4 bg-primary/10 rounded-full p-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuantity(Math.max(1, quantity - 1));
                      }}
                      size="icon"
                      className="rounded-full h-10 w-10 bg-primary hover:bg-primary/90"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="font-bold text-2xl w-12 text-center">{quantity}</span>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuantity(quantity + 1);
                      }}
                      size="icon"
                      className="rounded-full h-10 w-10 bg-primary hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Order Button */}
                  <Button
                    onClick={() => handleAddToCart(selectedDish, quantity)}
                    className="w-full bg-secondary hover:bg-secondary/90 text-primary text-lg py-6 rounded-full"
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
