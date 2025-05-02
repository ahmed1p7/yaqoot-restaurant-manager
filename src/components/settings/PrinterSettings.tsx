
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Printer, Edit } from "lucide-react";
import { PrinterType } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface PrinterSettingsProps {
  printers: PrinterType[];
  updatePrinterSettings: (printer: PrinterType) => void;
}

export const PrinterSettings: React.FC<PrinterSettingsProps> = ({ 
  printers,
  updatePrinterSettings
}) => {
  const [editPrinter, setEditPrinter] = useState<PrinterType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleEditPrinter = (printer: PrinterType) => {
    setEditPrinter({...printer});
    setIsDialogOpen(true);
  };
  
  const handleSavePrinter = () => {
    if (editPrinter) {
      updatePrinterSettings(editPrinter);
      setIsDialogOpen(false);
      setEditPrinter(null);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Printer className="w-5 h-5" />
          إعدادات الطابعات
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {printers.map(printer => (
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
                onClick={() => handleEditPrinter(printer)}
              >
                <Edit className="w-4 h-4 mr-1" />
                تعديل
              </Button>
            </div>
          </div>
        ))}
        
        <p className="text-sm text-gray-500 mt-4">
          تستخدم الطابعات الاحتياطية في حالة تفعيل وضع الطوارئ
        </p>
      </CardContent>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل إعدادات الطابعة</DialogTitle>
          </DialogHeader>
          
          {editPrinter && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="printer-name">اسم الطابعة</Label>
                <Input 
                  id="printer-name"
                  value={editPrinter.name}
                  onChange={(e) => setEditPrinter({...editPrinter, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="printer-ip">عنوان IP</Label>
                <Input 
                  id="printer-ip"
                  value={editPrinter.ip}
                  onChange={(e) => setEditPrinter({...editPrinter, ip: e.target.value})}
                  placeholder="192.168.1.100"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Switch 
                  id="is-active"
                  checked={editPrinter.isActive}
                  onCheckedChange={(checked) => setEditPrinter({...editPrinter, isActive: checked})}
                />
                <Label htmlFor="is-active">مفعّلة</Label>
              </div>
              
              {editPrinter.isBackup && (
                <div className="flex items-center gap-2">
                  <Switch 
                    id="is-backup"
                    checked={editPrinter.isBackup}
                    disabled
                  />
                  <Label htmlFor="is-backup">طابعة احتياطية</Label>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSavePrinter}>
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
