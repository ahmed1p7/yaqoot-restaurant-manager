
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockDepartments } from "@/data/mockData";
import { toast } from "sonner";

export const Settings = () => {
  const { user } = useApp();
  const [general, setGeneral] = useState({
    restaurantName: "مطعم ياقوت",
    address: "شارع الملك عبدالله، الرياض",
    phone: "+966 50 123 4567",
    email: "info@yaqoot-restaurant.com",
    currency: "ريال",
    language: "ar",
    tax: "15"
  });
  
  const [printSettings, setPrintSettings] = useState({
    enablePrinting: true,
    printerName: "مطبخ 1",
    printFormat: "compact",
    autoPrint: true,
    printLogo: true,
    copies: "1"
  });
  
  const [displaySettings, setDisplaySettings] = useState({
    enableKitchenDisplay: true,
    displayTimeout: "30",
    playSound: true,
    displayMode: "list"
  });
  
  const saveSettings = (type: string) => {
    // In a real app, this would call an API to save settings
    toast.success("تم حفظ الإعدادات بنجاح", {
      description: `تم حفظ إعدادات ${
        type === 'general' ? 'عامة' : 
        type === 'print' ? 'الطباعة' : 'العرض'
      }`
    });
  };
  
  // Only admins can access settings
  if (user?.role !== 'admin') {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-gray-500">
          ليس لديك صلاحية للوصول إلى هذه الصفحة
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">الإعدادات</h1>
      
      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general">إعدادات عامة</TabsTrigger>
          <TabsTrigger value="printing">الطباعة</TabsTrigger>
          <TabsTrigger value="display">شاشة العرض</TabsTrigger>
          <TabsTrigger value="departments">الأقسام</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>الإعدادات العامة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="restaurantName">اسم المطعم</Label>
                  <Input
                    id="restaurantName"
                    value={general.restaurantName}
                    onChange={(e) => setGeneral({ ...general, restaurantName: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">العنوان</Label>
                  <Input
                    id="address"
                    value={general.address}
                    onChange={(e) => setGeneral({ ...general, address: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    value={general.phone}
                    onChange={(e) => setGeneral({ ...general, phone: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    value={general.email}
                    onChange={(e) => setGeneral({ ...general, email: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">العملة</Label>
                  <Input
                    id="currency"
                    value={general.currency}
                    onChange={(e) => setGeneral({ ...general, currency: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tax">الضريبة (%)</Label>
                  <Input
                    id="tax"
                    type="number"
                    value={general.tax}
                    onChange={(e) => setGeneral({ ...general, tax: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language">اللغة</Label>
                  <Select
                    value={general.language}
                    onValueChange={(value) => setGeneral({ ...general, language: value })}
                  >
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                className="bg-restaurant-primary hover:bg-restaurant-primary-dark mt-4"
                onClick={() => saveSettings('general')}
              >
                حفظ الإعدادات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="printing" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الطباعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enablePrinting">تفعيل الطباعة</Label>
                  <Switch
                    id="enablePrinting"
                    checked={printSettings.enablePrinting}
                    onCheckedChange={(checked) => 
                      setPrintSettings({ ...printSettings, enablePrinting: checked })
                    }
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="printerName">اسم الطابعة</Label>
                    <Input
                      id="printerName"
                      value={printSettings.printerName}
                      onChange={(e) => setPrintSettings({ ...printSettings, printerName: e.target.value })}
                      disabled={!printSettings.enablePrinting}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="printFormat">نموذج الطباعة</Label>
                    <Select
                      value={printSettings.printFormat}
                      onValueChange={(value) => setPrintSettings({ ...printSettings, printFormat: value })}
                      disabled={!printSettings.enablePrinting}
                    >
                      <SelectTrigger id="printFormat">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">مختصر</SelectItem>
                        <SelectItem value="detailed">مفصل</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="copies">عدد النسخ</Label>
                    <Input
                      id="copies"
                      type="number"
                      value={printSettings.copies}
                      onChange={(e) => setPrintSettings({ ...printSettings, copies: e.target.value })}
                      disabled={!printSettings.enablePrinting}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <Label htmlFor="autoPrint">طباعة تلقائية للطلبات الجديدة</Label>
                  <Switch
                    id="autoPrint"
                    checked={printSettings.autoPrint}
                    onCheckedChange={(checked) => 
                      setPrintSettings({ ...printSettings, autoPrint: checked })
                    }
                    disabled={!printSettings.enablePrinting}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="printLogo">طباعة شعار المطعم</Label>
                  <Switch
                    id="printLogo"
                    checked={printSettings.printLogo}
                    onCheckedChange={(checked) => 
                      setPrintSettings({ ...printSettings, printLogo: checked })
                    }
                    disabled={!printSettings.enablePrinting}
                  />
                </div>
              </div>
              
              <Button 
                className="bg-restaurant-primary hover:bg-restaurant-primary-dark mt-4"
                onClick={() => saveSettings('print')}
                disabled={!printSettings.enablePrinting}
              >
                حفظ إعدادات الطباعة
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="display" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات شاشة العرض</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableKitchenDisplay">تفعيل شاشة المطبخ</Label>
                  <Switch
                    id="enableKitchenDisplay"
                    checked={displaySettings.enableKitchenDisplay}
                    onCheckedChange={(checked) => 
                      setDisplaySettings({ ...displaySettings, enableKitchenDisplay: checked })
                    }
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayMode">نمط العرض</Label>
                    <Select
                      value={displaySettings.displayMode}
                      onValueChange={(value) => setDisplaySettings({ ...displaySettings, displayMode: value })}
                      disabled={!displaySettings.enableKitchenDisplay}
                    >
                      <SelectTrigger id="displayMode">
                        <SelectValue placeholder="Select display mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="list">قائمة</SelectItem>
                        <SelectItem value="grid">شبكة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="displayTimeout">مهلة انقضاء العرض (دقيقة)</Label>
                    <Input
                      id="displayTimeout"
                      type="number"
                      value={displaySettings.displayTimeout}
                      onChange={(e) => setDisplaySettings({ ...displaySettings, displayTimeout: e.target.value })}
                      disabled={!displaySettings.enableKitchenDisplay}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <Label htmlFor="playSound">تشغيل صوت للطلبات الجديدة</Label>
                  <Switch
                    id="playSound"
                    checked={displaySettings.playSound}
                    onCheckedChange={(checked) => 
                      setDisplaySettings({ ...displaySettings, playSound: checked })
                    }
                    disabled={!displaySettings.enableKitchenDisplay}
                  />
                </div>
              </div>
              
              <Button 
                className="bg-restaurant-primary hover:bg-restaurant-primary-dark mt-4"
                onClick={() => saveSettings('display')}
                disabled={!displaySettings.enableKitchenDisplay}
              >
                حفظ إعدادات العرض
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="departments" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>إدارة أقسام المطعم</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockDepartments.map((department, idx) => (
                <Card key={idx}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{department.name}</h3>
                        <p className="text-sm text-gray-500">{department.description}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          تعديل
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-red-500 border-red-200 hover:bg-red-50"
                        >
                          حذف
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Button className="bg-restaurant-primary hover:bg-restaurant-primary-dark">
                <span className="mr-2">+</span> إضافة قسم جديد
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
