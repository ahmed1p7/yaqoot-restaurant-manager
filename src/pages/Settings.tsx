import React from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Settings as SettingsIcon, Bell, Printer, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Settings = () => {
  const { 
    systemSettings, 
    updatePerSeatCharge, 
    togglePerSeatChargeEnabled, 
    user,
    printers,
    updatePrinterSettings
  } = useApp();
  const [perSeatCharge, setPerSeatCharge] = React.useState(systemSettings.perSeatCharge.toString());
  const [emergencyMode, setEmergencyMode] = React.useState(systemSettings.emergencyMode || false);
  const [backupPrinterEnabled, setBackupPrinterEnabled] = React.useState(systemSettings.backupPrinterEnabled || false);
  const [backupPhoneEnabled, setBackupPhoneEnabled] = React.useState(systemSettings.backupPhoneEnabled || false);
  
  const handlePerSeatChargeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPerSeatCharge(e.target.value);
  };
  
  const handlePerSeatChargeSave = () => {
    const amount = parseFloat(perSeatCharge);
    if (!isNaN(amount) && amount >= 0) {
      updatePerSeatCharge(amount);
    }
  };
  
  const handleEmergencyModeChange = (checked: boolean) => {
    setEmergencyMode(checked);
    // Update the system setting
    // This would require adding a function to AppContext
    // For now, we'll just update the local state
  };
  
  const handleBackupPrinterEnabledChange = (checked: boolean) => {
    setBackupPrinterEnabled(checked);
    // This would require adding a function to AppContext
  };
  
  const handleBackupPhoneEnabledChange = (checked: boolean) => {
    setBackupPhoneEnabled(checked);
    // This would require adding a function to AppContext
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <SettingsIcon className="w-6 h-6" />
        الإعدادات
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Per-seat charge settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              رسوم المقعد
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="enable-charge" 
                checked={systemSettings.enablePerSeatCharge}
                onCheckedChange={togglePerSeatChargeEnabled}
              />
              <Label htmlFor="enable-charge" className="mr-2">تفعيل رسوم المقعد</Label>
            </div>
            
            <div className="flex items-end gap-2">
              <div className="space-y-1 flex-1">
                <Label htmlFor="seat-charge">قيمة الرسوم (ريال)</Label>
                <Input 
                  id="seat-charge" 
                  type="number" 
                  min="0" 
                  step="0.5"
                  value={perSeatCharge} 
                  onChange={handlePerSeatChargeChange}
                  disabled={!systemSettings.enablePerSeatCharge}
                />
              </div>
              <Button 
                onClick={handlePerSeatChargeSave}
                disabled={!systemSettings.enablePerSeatCharge}
              >
                حفظ
              </Button>
            </div>
            
            <p className="text-sm text-gray-500">
              سيتم إضافة هذه الرسوم لكل شخص في الطلب عند تفعيلها
            </p>
          </CardContent>
        </Card>
        
        {/* Emergency mode settings (admin only) */}
        {user?.role === 'admin' && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                وضع الطوارئ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="emergency-mode" 
                  checked={emergencyMode}
                  onCheckedChange={handleEmergencyModeChange}
                />
                <Label htmlFor="emergency-mode" className="mr-2 font-medium">
                  تفعيل وضع الطوارئ
                </Label>
              </div>
              
              <div className="bg-red-50 p-3 rounded-md text-sm">
                <p>
                  في حالة تفعيل وضع الطوارئ، سيتم تنفيذ الإجراءات البديلة عند تعطل نظام المطبخ
                </p>
              </div>
              
              <div className="space-y-2 border-t pt-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="backup-printer" 
                    checked={backupPrinterEnabled}
                    onCheckedChange={handleBackupPrinterEnabledChange}
                    disabled={!emergencyMode}
                  />
                  <Label htmlFor="backup-printer" className="mr-2">
                    طباعة الطلبات على الطابعة الاحتياطية
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="backup-phone" 
                    checked={backupPhoneEnabled}
                    onCheckedChange={handleBackupPhoneEnabledChange}
                    disabled={!emergencyMode}
                  />
                  <Label htmlFor="backup-phone" className="mr-2">
                    إرسال إشعارات لتطبيق الطهاة
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Printer settings (admin only) */}
        {user?.role === 'admin' && (
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Printer className="w-5 h-5" />
                  إعدادات الطابعات
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {printers && printers.map(printer => (
                  <div key={printer.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{printer.name}</h3>
                      <p className="text-sm text-gray-500">IP: {printer.ip}</p>
                      {printer.isBackup && (
                        <Badge className="bg-yellow-500 mt-1">طابعة احتياطية</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={printer.isActive}
                          onCheckedChange={(checked) => updatePrinterSettings({...printer, isActive: checked})}
                        />
                        <span className="text-sm">
                          {printer.isActive ? "مفعّلة" : "معطلة"}
                        </span>
                      </div>
                      
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          // In a real app, this would open a dialog to edit printer settings
                          updatePrinterSettings({...printer});
                        }}
                      >
                        تعديل
                      </Button>
                    </div>
                  </div>
                ))}
                
                <p className="text-sm text-gray-500 mt-4">
                  تستخدم الطابعات الاحتياطية في حالة تفعيل وضع الطوارئ
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
