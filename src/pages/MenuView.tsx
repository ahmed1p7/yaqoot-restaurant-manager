
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChefHat } from "lucide-react";
import { MenuCategory } from "@/types";

const translateCategory = (category: MenuCategory): string => {
  switch (category) {
    case "appetizers": return "مقبلات";
    case "main_dishes": return "أطباق رئيسية";
    case "desserts": return "حلويات";
    case "drinks": return "مشروبات";
    case "sides": return "أطباق جانبية";
    default: return category;
  }
};

export const MenuView = () => {
  const { menuItems } = useApp();
  const [activeTab, setActiveTab] = useState<MenuCategory | "all">("all");
  
  const availableMenuItems = menuItems.filter(item => item.isAvailable);
  
  const filteredItems = activeTab === "all"
    ? availableMenuItems
    : availableMenuItems.filter((item) => item.category === activeTab);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">قائمة الطعام</h1>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as MenuCategory | "all")}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">الكل</TabsTrigger>
          <TabsTrigger value="appetizers">مقبلات</TabsTrigger>
          <TabsTrigger value="main_dishes">أطباق رئيسية</TabsTrigger>
          <TabsTrigger value="desserts">حلويات</TabsTrigger>
          <TabsTrigger value="drinks">مشروبات</TabsTrigger>
          <TabsTrigger value="sides">أطباق جانبية</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0">
          <div className="menu-grid">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="h-40 bg-gray-200 flex items-center justify-center">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ChefHat className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{item.name}</h3>
                    <span className="text-restaurant-primary font-bold">{item.price} ريال</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.description}</p>
                  <div>
                    <span className="text-xs px-2 py-1 bg-restaurant-secondary rounded-full">
                      {translateCategory(item.category)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <ChefHat className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700">لا توجد أطباق في هذا القسم</h3>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
