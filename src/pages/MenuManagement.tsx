import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { MenuItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, X, Plus, Minus, Send } from "lucide-react";
import { toast } from "sonner";
import seaLogo from "@/assets/sea-logo.jpg";

const categories = [
  { id: "appetizers", name: "المقبلات", icon: "🍤" },
  { id: "main_dishes", name: "الأطباق الرئيسية", icon: "🍜" },
  { id: "desserts", name: "الحلويات", icon: "🍰" },
  { id: "drinks", name: "المشروبات", icon: "🥤" },
  { id: "sides", name: "الأطباق الجانبية", icon: "🥗" },
];

interface CartItem extends MenuItem {
  quantity: number;
}

export const MenuManagement = () => {
  const { menuItems } = useApp();
  const [activeCategory, setActiveCategory] = useState("appetizers");
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  const filteredItems = menuItems.filter(
    (item) => item.category === activeCategory
  );

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);
    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    toast.success(`تمت إضافة ${item.name} إلى السلة`);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(
      cart
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const sendOrder = () => {
    if (cart.length === 0) {
      toast.error("السلة فارغة");
      return;
    }
    toast.success("تم إرسال الطلب بنجاح!");
    setCart([]);
    setShowCart(false);
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
                <p className="text-sm text-secondary">نكهة البحر الأصيلة</p>
              </div>
            </div>
            
            <Button
              onClick={() => setShowCart(!showCart)}
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
            {categories.map((cat) => (
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
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-medium text-center">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu Items Grid */}
          <div className={`${selectedDish || showCart ? "lg:col-span-2" : "lg:col-span-3"}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  onClick={() => setSelectedDish(item)}
                  className="group cursor-pointer overflow-hidden bg-card/80 backdrop-blur-sm border-2 border-secondary/20 hover:border-secondary hover:shadow-2xl transition-all duration-300 hover:scale-105"
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
                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-destructive/80 flex items-center justify-center">
                        <span className="text-destructive-foreground font-bold">غير متوفر</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      ${item.price}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 text-card-foreground">{item.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Dish Details Panel */}
          {selectedDish && !showCart && (
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
                  <div>
                    <h2 className="text-2xl font-bold text-card-foreground mb-2">{selectedDish.name}</h2>
                    <p className="text-muted-foreground">{selectedDish.description}</p>
                  </div>

                  <div className="bg-primary/10 rounded-lg p-4 border border-secondary/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">السعر</span>
                      <span className="text-3xl font-bold text-primary">${selectedDish.price}</span>
                    </div>
                    {selectedDish.isAvailable ? (
                      <Badge className="w-full justify-center bg-secondary text-primary">متوفر</Badge>
                    ) : (
                      <Badge variant="destructive" className="w-full justify-center">غير متوفر</Badge>
                    )}
                  </div>

                  <Button
                    onClick={() => addToCart(selectedDish)}
                    disabled={!selectedDish.isAvailable}
                    className="w-full bg-secondary hover:bg-secondary/90 text-primary text-lg py-6"
                    size="lg"
                  >
                    إضافة إلى السلة
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Cart Panel */}
          {showCart && (
            <div className="lg:col-span-1">
              <Card className="sticky top-24 bg-card/95 backdrop-blur-sm border-2 border-secondary shadow-2xl">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-card-foreground flex items-center gap-2">
                      <ShoppingCart className="h-6 w-6" />
                      السلة
                    </h2>
                    <Button
                      onClick={() => setShowCart(false)}
                      variant="ghost"
                      size="icon"
                      className="hover:bg-destructive/20"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  {cart.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p>السلة فارغة</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4 max-h-96 overflow-y-auto mb-6">
                        {cart.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-secondary/20"
                          >
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center">
                                  <span className="text-2xl">🍽️</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm truncate">{item.name}</h3>
                              <p className="text-primary font-bold">${item.price}</p>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => updateQuantity(item.id, -1)}
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 rounded-full"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="font-bold w-8 text-center">{item.quantity}</span>
                              <Button
                                onClick={() => updateQuantity(item.id, 1)}
                                size="icon"
                                className="h-8 w-8 rounded-full bg-secondary hover:bg-secondary/90 text-primary"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-4 pt-4 border-t border-secondary/20">
                        <div className="flex justify-between text-lg">
                          <span className="text-muted-foreground">الإجمالي الفرعي</span>
                          <span className="font-bold">${getTotalPrice().toFixed(2)}</span>
                        </div>
                        
                        <Button
                          onClick={sendOrder}
                          className="w-full bg-secondary hover:bg-secondary/90 text-primary text-lg py-6"
                          size="lg"
                        >
                          <Send className="h-5 w-5 ml-2" />
                          إرسال الطلب
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
