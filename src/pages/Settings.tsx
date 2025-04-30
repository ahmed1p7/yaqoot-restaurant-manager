
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Printer, AlertTriangle, Smartphone, DollarSign } from "lucide-react";
import { toast } from "sonner";

export const Settings = () => {
  const { systemSettings, updatePerSeatCharge, togglePerSeatChargeEnabled, user } = useApp();
  const [perSeatCharge, setPerSeatCharge] = useState(systemSettings.perSeatCharge);
  const [emergencyMode, setEmergencyMode] = useState(systemSettings.emergencyMode || false);
  const [backupPrinterEnabled, setBackupPrinterEnabled] = useState(systemSettings.backupPrinterEnabled || false);
  const [backupPhoneEnabled, setBackupPhoneEnabled] = useState(systemSettings.backupPhoneEnabled || false);

  // If not admin, show access denied
  if (user?.role !== 'admin') {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-gray-500">
          هذه الصفحة مخصصة للمشرف فقط
        </p>
      </div>
    );
  }

  const handleUpdatePerSeatCharge = () => {
    updatePerSeatCharge(perSeatCharge);
  };

  const handleTogglePerSeatCharge = (enabled: boolean) => {
    togglePerSeatChargeEnabled(enabled);
  };

  const handleToggleEmergencyMode = (enabled: boolean) => {
    setEmergencyMode(enabled);
    // In a real app, we would update the system settings
    // For now, just show a toast notification
    toast.info(enabled ? "تم تفعيل وضع الطوارئ" : "تم إيقاف وضع الطوارئ");
  };

  const handleToggleBackupPrinter = (enabled: boolean) => {
    setBackupPrinterEnabled(enabled);
    toast.info(enabled ? "تم تفعيل الطابعة الاحتياطية" : "تم إيقاف الطابعة الاحتياطية");
  };

  const handleToggleBackupPhone = (enabled: boolean) => {
    setBackupPhoneEnabled(enabled);
    toast.info(enabled ? "تم تفعيل إشعارات الجوال" : "تم إيقاف إشعارات الجوال");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">الإعدادات</h1>

      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general">عام</TabsTrigger>
          <TabsTrigger value="pricing">التسعير</TabsTrigger>
          <TabsTrigger value="emergency" className="flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" />
            وضع الطوارئ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>الإعدادات العامة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="restaurant-name">اسم المطعم</Label>
                  <Input 
                    id="restaurant-name" 
                    className="w-[250px]" 
                    defaultValue="مطعم الشرق" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="restaurant-phone">رقم الهاتف</Label>
                  <Input 
                    id="restaurant-phone" 
                    className="w-[250px]" 
                    defaultValue="0123456789" 
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button className="bg-restaurant-primary">حفظ التغييرات</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                رسوم المقعد
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="per-seat-charge-enabled">تفعيل رسوم المقعد</Label>
                <Switch 
                  id="per-seat-charge-enabled"
                  checked={systemSettings.enablePerSeatCharge}
                  onCheckedChange={handleTogglePerSeatCharge}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="per-seat-charge">رسوم المقعد (ريال)</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    id="per-seat-charge" 
                    type="number"
                    value={perSeatCharge}
                    onChange={(e) => setPerSeatCharge(Number(e.target.value))}
                  />
                  <Button 
                    onClick={handleUpdatePerSeatCharge}
                    className="bg-restaurant-primary"
                  >
                    تحديث
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  يتم إضافة هذا المبلغ لكل شخص في الطاولة
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency" className="space-y-4">
          <Card>
            <CardHeader className="bg-red-50">
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                وضع الطوارئ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="emergency-mode" className="text-lg font-bold">تفعيل وضع الطوارئ</Label>
                  <p className="text-sm text-gray-500">
                    عند تعطل شاشة المطبخ، سيتم إرسال الطلبات تلقائياً إلى الأنظمة الاحتياطية
                  </p>
                </div>
                <Switch 
                  id="emergency-mode"
                  checked={emergencyMode}
                  onCheckedChange={handleToggleEmergencyMode}
                />
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-4">أنظمة الطوارئ الاحتياطية</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Printer className="w-5 h-5 text-gray-500" />
                      <div>
                        <Label htmlFor="backup-printer" className="font-medium">الطابعة الاحتياطية</Label>
                        <p className="text-xs text-gray-500">طباعة الطلبات تلقائياً عند استلامها</p>
                      </div>
                    </div>
                    <Switch 
                      id="backup-printer"
                      disabled={!emergencyMode}
                      checked={backupPrinterEnabled && emergencyMode}
                      onCheckedChange={handleToggleBackupPrinter}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-gray-500" />
                      <div>
                        <Label htmlFor="backup-phone" className="font-medium">إشعارات الجوال</Label>
                        <p className="text-xs text-gray-500">إرسال إشعارات إلى تطبيق الطهاة</p>
                      </div>
                    </div>
                    <Switch 
                      id="backup-phone"
                      disabled={!emergencyMode}
                      checked={backupPhoneEnabled && emergencyMode}
                      onCheckedChange={handleToggleBackupPhone}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
