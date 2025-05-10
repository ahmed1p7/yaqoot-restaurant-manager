
import { useState } from 'react';
import { User } from '../../types';
import { mockUsers } from '../../data/mockData';
import { toast } from "sonner";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  const login = (username: string, password: string): boolean => {
    // Only allow admin login with correct password
    if (username === 'admin' && password === 'admin123') {
      const adminUser = mockUsers.find(u => u.username === 'admin');
      if (adminUser) {
        setUser(adminUser);
        toast.success(`مرحباً ${adminUser.name}`, {
          description: "تم تسجيل الدخول بنجاح"
        });
        return true;
      }
    }
    
    // Allow waiter login with PIN
    const waiterMatch = /^10[0-9]$/.exec(username);
    if (waiterMatch && password === "0000") {
      const waiterNumber = parseInt(username.substring(2));
      const waiterUser = mockUsers.find(u => u.username === `waiter${waiterNumber}`);
      
      if (waiterUser) {
        setUser(waiterUser);
        toast.success(`مرحباً ${waiterUser.name}`, {
          description: "تم تسجيل الدخول بنجاح"
        });
        return true;
      }
    }
    
    // Allow drinks screen login with specific PIN
    if (username === 'drinks' && password === '222') {
      const drinksUser = mockUsers.find(u => u.username === 'drinks1');
      if (drinksUser) {
        setUser(drinksUser);
        toast.success(`مرحباً ${drinksUser.name}`, {
          description: "تم تسجيل الدخول بنجاح"
        });
        return true;
      }
    }
    
    // Allow kitchen screen login with specific PIN
    if (username === 'kitchen' && password === '111') {
      const screenUser = mockUsers.find(u => u.username === 'screen1');
      if (screenUser) {
        setUser(screenUser);
        toast.success(`تم تشغيل شاشة المطبخ`, {
          description: "تم تسجيل الدخول بنجاح"
        });
        return true;
      }
    }
    
    toast.error("فشل تسجيل الدخول", {
      description: "اسم المستخدم أو كلمة المرور غير صحيحة"
    });
    return false;
  };

  // For backward compatibility - may be removed later
  const loginAsWaiter = (): boolean => {
    const waiterUser = mockUsers.find(u => u.username === 'waiter1');
    if (waiterUser) {
      setUser(waiterUser);
      toast.success(`مرحباً ${waiterUser.name}`, {
        description: "تم تسجيل الدخول بنجاح"
      });
      return true;
    }
    return false;
  };

  // For backward compatibility - may be removed later
  const loginAsScreen = (): boolean => {
    const screenUser = mockUsers.find(u => u.username === 'screen1');
    if (screenUser) {
      setUser(screenUser);
      toast.success(`تم تشغيل شاشة المطبخ`, {
        description: "تم تسجيل الدخول بنجاح لشاشة المطبخ"
      });
      return true;
    }
    return false;
  };

  // For backward compatibility - may be removed later
  const loginAsDrinksScreen = (): boolean => {
    const drinksUser = mockUsers.find(u => u.username === 'drinks1');
    if (drinksUser) {
      setUser(drinksUser);
      toast.success(`تم تشغيل شاشة المشروبات`, {
        description: "تم تسجيل الدخول بنجاح لشاشة المشروبات"
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    toast.info("تم تسجيل الخروج بنجاح");
  };

  return {
    user,
    login,
    loginAsWaiter,
    loginAsScreen,
    loginAsDrinksScreen,
    logout
  };
};
