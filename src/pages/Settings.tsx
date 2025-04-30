
import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRole } from "@/types";

export const Settings = () => {
  const { user, systemSettings, updatePerSeatCharge, togglePerSeatChargeEnabled } = useApp();
  const [perSeatCharge, setPerSeatCharge] = useState<number>(systemSettings.perSeatCharge);
  const [enablePerSeatCharge, setEnablePerSeatCharge] = useState<boolean>(systemSettings.enablePerSeatCharge);

  useEffect(() => {
    setPerSeatCharge(systemSettings.perSeatCharge);
    setEnablePerSeatCharge(systemSettings.enablePerSeatCharge);
  }, [systemSettings]);

  const handleUpdatePerSeatCharge = () => {
    updatePerSeatCharge(perSeatCharge);
  };

  const handleTogglePerSeatCharge = (checked: boolean) => {
    setEnablePerSeatCharge(checked);
    togglePerSeatChargeEnabled(checked);
  };

  // Only admins can access settings
  if (user?.role !== 'admin') {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-gray-500">
          هذه الصفحة مخصصة للمشرفين فقط
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">الإعدادات</h1>
      
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">إعدادات عامة</TabsTrigger>
          <TabsTrigger value="advanced">إعدادات متقدمة</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الحساب</CardTitle>
              <CardDescription>
                تعديل إعدادات النظام الأساسية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="restaurantName">اسم المطعم</Label>
                <Input id="restaurantName" defaultValue="مطعمنا" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency">العملة</Label>
                <Input id="currency" defaultValue="ريال" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>حفظ التغييرات</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>رسوم إضافية</CardTitle>
              <CardDescription>
                إعدادات الرسوم الإضافية للطاولات
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="perSeatCharge" className="flex flex-col space-y-1">
                  <span>تفعيل رسوم لكل مقعد</span>
                  <span className="font-normal text-sm text-gray-500">
                    يتم إضافة رسوم لكل شخص عند إنشاء طلب
                  </span>
                </Label>
                <Switch 
                  id="perSeatCharge" 
                  checked={enablePerSeatCharge}
                  onCheckedChange={handleTogglePerSeatCharge}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="perSeatAmount">مقدار الرسوم لكل مقعد (ريال)</Label>
                <div className="flex items-center space-x-2">
                  <Input 
                    id="perSeatAmount" 
                    type="number"
                    value={perSeatCharge}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && val >= 0) {
                        setPerSeatCharge(val);
                      }
                    }}
                    min="0"
                    step="0.5"
                    disabled={!enablePerSeatCharge}
                  />
                  <Button 
                    onClick={handleUpdatePerSeatCharge}
                    disabled={!enablePerSeatCharge || perSeatCharge === systemSettings.perSeatCharge}
                  >
                    تحديث
                  </Button>
                </div>
                
                {enablePerSeatCharge && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600">
                      <strong>مثال:</strong> طاولة بها 4 أشخاص ستتكلف {perSeatCharge * 4} ريال إضافية
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
