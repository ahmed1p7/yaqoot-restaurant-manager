
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

  // New function to update printer settings
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
    updatePrinterSettings
  };
};
