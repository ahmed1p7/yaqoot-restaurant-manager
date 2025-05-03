import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Minus, Plus, ArrowLeft, Trash2, User, AlertTriangle, Check } from "lucide-react";
import { toast } from "sonner";
import { MenuItem, Order, OrderItem } from "@/types";

export const MenuView = () => {
  const { menuItems, user, orders, tables, createOrder, updateTablePeopleCount } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tableId = parseInt(queryParams.get("table") || "0");
  
  // Find the current table
  const currentTable = tables.find(t => t.id === tableId);
  
  // Find existing order for this table if any
  const existingOrder = currentTable?.currentOrderId 
    ? orders.find(o => o.id === currentTable.currentOrderId)
    : undefined;
  
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>(
    existingOrder?.items.map(item => ({
      menuItemId: item.menuItemId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      notes: item.notes || "",
      completed: item.completed
    })) || []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [orderNotes, setOrderNotes] = useState(existingOrder?.notes || "");
  const [peopleCount, setPeopleCount] = useState(currentTable?.peopleCount || 0);
  
  // Only show the people dialog when table has no people count set
  const [showPeopleDialog, setShowPeopleDialog] = useState(
    currentTable ? (currentTable.peopleCount || 0) === 0 : true
  );
  
  const [orderTotal, setOrderTotal] = useState(0);
  
  // Calculate total whenever selected items change
  useEffect(() => {
    const total = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setOrderTotal(total);
  }, [selectedItems]);
  
  // Update people count if needed
  useEffect(() => {
    if (currentTable && currentTable.peopleCount) {
      setPeopleCount(currentTable.peopleCount);
    }
  }, [currentTable]);
  
  // Get unique categories
  const categories = [...new Set(menuItems.map(item => item.category))];
  
  // Filter menu items based on search query and active category
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    
    // For drinks screen, only show drinks
    if (user?.role === 'drinks') {
      return item.category === 'drinks' && matchesSearch;
    }
    
    return matchesSearch && matchesCategory;
  });
  
  // Function to handle item selection
  const handleAddItem = (menuItem: MenuItem) => {
    const existingItemIndex = selectedItems.findIndex(item => item.menuItemId === menuItem.id);
    
    if (existingItemIndex >= 0) {
      // Item already exists, increment quantity
      const updatedItems = [...selectedItems];
      updatedItems[existingItemIndex].quantity += 1;
      setSelectedItems(updatedItems);
    } else {
      // Add new item with quantity 1
      setSelectedItems([
        ...selectedItems,
        {
          menuItemId: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1,
          notes: "",
          completed: false
        }
      ]);
    }
    
    toast.success(`تمت إضافة ${menuItem.name} للطلب`);
  };
  
  // Function to update item quantity
  const updateItemQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      // Remove item
      setSelectedItems(selectedItems.filter(item => item.menuItemId !== menuItemId));
      return;
    }
    
    // Update quantity
    setSelectedItems(selectedItems.map(item => 
      item.menuItemId === menuItemId ? { ...item, quantity } : item
    ));
  };
  
  // Function to update item notes
  const updateItemNotes = (menuItemId: string, notes: string) => {
    setSelectedItems(selectedItems.map(item => 
      item.menuItemId === menuItemId ? { ...item, notes } : item
    ));
  };
  
  // Function to remove item
  const removeItem = (menuItemId: string) => {
    setSelectedItems(selectedItems.filter(item => item.menuItemId !== menuItemId));
    toast.success("تم حذف العنصر من الطلب");
  };
  
  // Function to handle order submission
  const handleSubmitOrder = () => {
    if (selectedItems.length === 0) {
      toast.error("لا يمكن إنشاء طلب فارغ");
      return;
    }
    
    if (peopleCount <= 0) {
      setShowPeopleDialog(true);
      return;
    }
    
    // Update table people count if changed
    if (currentTable && currentTable.peopleCount !== peopleCount) {
      updateTablePeopleCount(tableId, peopleCount);
    }
    
    // Create or update order
    createOrder({
      tableNumber: tableId,
      waiterId: user?.id || "",
      items: selectedItems,
      status: "pending",
      totalAmount: orderTotal,
      peopleCount: peopleCount,
      notes: orderNotes,
      delayed: false,
      isPaid: false
    });
    
    // Navigate back to tables view
    navigate("/tables");
  };
  
  // Handle people count confirmation
  const handlePeopleConfirm = (count: number) => {
    setPeopleCount(count);
    setShowPeopleDialog(false);
    
    // Update table people count
    if (tableId) {
      updateTablePeopleCount(tableId, count);
    }
  };
  
  // If no table ID is provided, navigate back to tables view
  if (!tableId || !currentTable) {
    useEffect(() => {
      toast.error("لم يتم اختيار طاولة");
      navigate("/tables");
    }, []);
    return null;
  }
  
  const isAdmin = user?.role === 'admin';
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/tables")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <h1 className="text-2xl font-bold">
            {existingOrder ? `تعديل طلب الطاولة ${tableId}` : `طلب جديد للطاولة ${tableId}`}
          </h1>
          
          <Badge className="bg-purple-100 text-purple-800 mr-2 flex items-center">
            <User className="h-3 w-3 mr-1" />
            {peopleCount} أشخاص
          </Badge>
        </div>
        
        {/* Special buttons for drinks screen */}
        {user?.role === 'drinks' && (
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={handleSubmitOrder}
          >
            <Check className="h-4 w-4 mr-1" />
            تم تسليم المشروبات
          </Button>
        )}
      </div>
      
      {/* Food and drink selection section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search bar */}
          <Input
            placeholder="بحث عن طبق أو مشروب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />
          
          {/* Categories */}
          <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="mb-4 w-full flex overflow-x-auto">
              <TabsTrigger value="all" className="flex-1">الكل</TabsTrigger>
              {categories.map(category => (
                <TabsTrigger key={category} value={category} className="flex-1">
                  {category === 'appetizers' ? 'مقبلات' : 
                   category === 'main_dishes' ? 'أطباق رئيسية' : 
                   category === 'desserts' ? 'حلويات' : 
                   category === 'drinks' ? 'مشروبات' : 
                   category === 'sides' ? 'إضافات' : category}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {/* Menu items grid - Changed to keypad style layout */}
            <TabsContent value={activeCategory} className="mt-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredMenuItems.map((menuItem) => (
                  <Card 
                    key={menuItem.id} 
                    className="cursor-pointer hover:border-blue-300 transition-colors"
                    onClick={() => handleAddItem(menuItem)}
                  >
                    <CardContent className="p-3 flex flex-col items-center justify-center h-24 text-center">
                      <h3 className="font-medium">{menuItem.name}</h3>
                      {/* Only show price for admin users */}
                      {isAdmin && (
                        <span className="text-sm font-semibold mt-1">
                          {menuItem.price} ريال
                        </span>
                      )}
                    </CardContent>
                  </Card>
                ))}
                
                {filteredMenuItems.length === 0 && (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-500">لا توجد أطباق متطابقة مع البحث</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Order summary */}
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-bold mb-4 border-b pb-2">
              ملخص الطلب
            </h3>
            
            {selectedItems.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                لم يتم اختيار أي عناصر بعد
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {selectedItems.map((item) => (
                    <div key={item.menuItemId} className="bg-white p-3 rounded-md">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          {/* Only show price for admin users */}
                          {isAdmin && (
                            <div className="text-sm text-gray-600">{item.price} ريال</div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateItemQuantity(item.menuItemId, item.quantity - 1);
                            }}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          
                          <span className="w-6 text-center">{item.quantity}</span>
                          
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateItemQuantity(item.menuItemId, item.quantity + 1);
                            }}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeItem(item.menuItemId);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Notes input */}
                      <Input
                        placeholder="ملاحظات (بدون بصل، حار، الخ)"
                        value={item.notes}
                        onChange={(e) => updateItemNotes(item.menuItemId, e.target.value)}
                        className="mt-2 text-sm"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
            
            {/* Order notes */}
            <div className="mt-4">
              <label htmlFor="orderNotes" className="text-sm font-medium">
                ملاحظات إضافية للطلب
              </label>
              <Textarea
                id="orderNotes"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="أي ملاحظات خاصة بالطلب"
                className="mt-1"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
            {/* Show total only for admin users */}
            {isAdmin && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between font-bold">
                  <span>الإجمالي:</span>
                  <span>{orderTotal} ريال</span>
                </div>
              </div>
            )}
            
            {/* Submit button */}
            <Button 
              className="w-full mt-4 bg-green-600 hover:bg-green-700"
              onClick={handleSubmitOrder}
              disabled={selectedItems.length === 0}
            >
              {existingOrder ? "تحديث الطلب" : "تأكيد الطلب"}
            </Button>
          </div>
        </div>
      </div>
      
      {/* People count dialog - Only show when table has no people count */}
      <Dialog open={showPeopleDialog} onOpenChange={(open) => {
        // Don't allow closing if count is 0
        if (!open && peopleCount === 0) {
          toast.error("يجب تحديد عدد الأشخاص");
          return;
        }
        setShowPeopleDialog(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>عدد الأشخاص</DialogTitle>
            <DialogDescription>
              الرجاء تحديد عدد الأشخاص للطاولة
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <Button
                key={num}
                variant={peopleCount === num ? "default" : "outline"}
                onClick={() => handlePeopleConfirm(num)}
                className="text-lg"
              >
                {num}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
