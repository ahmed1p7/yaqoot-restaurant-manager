
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { MenuItem, MenuCategory } from "@/types";
import { ChefHat, Pencil, Trash } from "lucide-react";

const translateCategory = (category: string): string => {
  switch (category) {
    case "appetizers": return "مقبلات";
    case "main_dishes": return "أطباق رئيسية";
    case "desserts": return "حلويات";
    case "drinks": return "مشروبات";
    case "sides": return "أطباق جانبية";
    default: return category;
  }
};

export const MenuManagement = () => {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem, departments } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<MenuCategory | "all">("all");
  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<Omit<MenuItem, "id">>({
    name: "",
    description: "",
    price: 0,
    category: "main_dishes",
    image: "/placeholder.svg",
    isAvailable: true,
    departmentId: departments && departments.length > 0 ? departments[0].id : "1"
  });
  
  const handleOpenDialog = (item?: MenuItem) => {
    if (item) {
      setCurrentItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        image: item.image || "/placeholder.svg",
        isAvailable: item.isAvailable,
        departmentId: item.departmentId
      });
    } else {
      setCurrentItem(null);
      setFormData({
        name: "",
        description: "",
        price: 0,
        category: "main_dishes",
        image: "/placeholder.svg",
        isAvailable: true,
        departmentId: departments && departments.length > 0 ? departments[0].id : "1"
      });
    }
    setIsDialogOpen(true);
  };
  
  const handleSubmit = () => {
    if (currentItem) {
      updateMenuItem({ ...formData, id: currentItem.id });
    } else {
      addMenuItem(formData);
    }
    setIsDialogOpen(false);
  };
  
  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا الطبق؟")) {
      deleteMenuItem(id);
    }
  };
  
  const filteredItems = activeTab === "all"
    ? menuItems
    : menuItems.filter((item) => item.category === activeTab);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">إدارة قائمة الطعام</h1>
        <Button onClick={() => handleOpenDialog()} className="bg-restaurant-primary hover:bg-restaurant-primary-dark">
          <span className="mr-2">+</span> إضافة طبق جديد
        </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className={`overflow-hidden ${!item.isAvailable ? 'opacity-60' : ''}`}>
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
                  <div className="flex justify-between items-center">
                    <span className="text-xs px-2 py-1 bg-restaurant-secondary rounded-full">
                      {translateCategory(item.category)}
                    </span>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleOpenDialog(item)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-red-500 border-red-200 hover:bg-red-50"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <ChefHat className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700">لا توجد أطباق في هذا القسم</h3>
              <p className="text-gray-500">اضغط على "إضافة طبق جديد" لإضافة أطباق</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentItem ? "تعديل طبق" : "إضافة طبق جديد"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">اسم الطبق</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">السعر</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">التصنيف</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: string) => setFormData({ 
                    ...formData, 
                    category: value as MenuCategory 
                  })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appetizers">مقبلات</SelectItem>
                    <SelectItem value="main_dishes">أطباق رئيسية</SelectItem>
                    <SelectItem value="desserts">حلويات</SelectItem>
                    <SelectItem value="drinks">مشروبات</SelectItem>
                    <SelectItem value="sides">أطباق جانبية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">القسم</Label>
              <Select
                value={formData.departmentId}
                onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="اختر القسم" />
                </SelectTrigger>
                <SelectContent>
                  {departments?.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="isAvailable">متوفر</Label>
              <Switch
                id="isAvailable"
                checked={formData.isAvailable}
                onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button onClick={handleSubmit} className="bg-restaurant-primary hover:bg-restaurant-primary-dark">
              {currentItem ? "تحديث" : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
