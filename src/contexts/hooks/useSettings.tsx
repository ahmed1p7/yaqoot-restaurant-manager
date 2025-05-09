
import { useState } from 'react';
import { SystemSettings, PrinterType } from '../../types';
import { mockPrinters } from '../../data/mockData';
import { toast } from "sonner";

export const useSettings = () => {
  const [printers, setPrinters] = useState<PrinterType[]>(mockPrinters);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    perSeatCharge: 2,
    enablePerSeatCharge: false,
    emergencyMode: false,
    backupPrinterEnabled: false,
    backupPhoneEnabled: false
  });

  // System settings functions
  const updatePerSeatCharge = (amount: number) => {
    setSystemSettings({...systemSettings, perSeatCharge: amount});
    toast.success(`تم تحديث رسوم المقعد إلى ${amount} ريال`);
  };

  const togglePerSeatChargeEnabled = (enabled: boolean) => {
    setSystemSettings({...systemSettings, enablePerSeatCharge: enabled});
    toast.success(enabled ? "تم تفعيل رسوم المقعد" : "تم إيقاف رسوم المقعد");
  };

  // Emergency mode functions
  const toggleEmergencyMode = (enabled: boolean) => {
    setSystemSettings({...systemSettings, emergencyMode: enabled});
    toast.success(enabled ? "تم تفعيل وضع الطوارئ" : "تم إيقاف وضع الطوارئ");
  };

  const toggleBackupPrinterEnabled = (enabled: boolean) => {
    setSystemSettings({...systemSettings, backupPrinterEnabled: enabled});
    toast.success(enabled ? "تم تفعيل الطابعة الاحتياطية" : "تم إيقاف الطابعة الاحتياطية");
  };

  const toggleBackupPhoneEnabled = (enabled: boolean) => {
    setSystemSettings({...systemSettings, backupPhoneEnabled: enabled});
    toast.success(enabled ? "تم تفعيل إشعارات الطوارئ" : "تم إيقاف إشعارات الطوارئ");
  };

  // Printer settings functions
  const updatePrinterSettings = (printer: PrinterType) => {
    setPrinters(printers.map(p => 
      p.id === printer.id 
        ? printer
        : p
    ));
    
    toast.success(`تم تحديث إعدادات الطابعة ${printer.name}`);
  };

  return {
    printers,
    systemSettings,
    updatePerSeatCharge,
    togglePerSeatChargeEnabled,
    toggleEmergencyMode,
    toggleBackupPrinterEnabled,
    toggleBackupPhoneEnabled,
    updatePrinterSettings
  };
};
