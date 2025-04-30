
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User as UserIcon, Edit, Trash, Save } from "lucide-react";
import { toast } from "sonner";

// Define an extended user type for the UI
type ExtendedUser = {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'waiter' | 'screen';
  email: string;
  department: string;
  access: string[];
};

export const Users = () => {
  const { user } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ExtendedUser | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  
  // In a real app, users would be fetched from an API
  // For this demo, we're using our mock data
  const users: ExtendedUser[] = [
    {
      id: '1',
      username: 'admin',
      name: 'محمد المدير',
      role: 'admin',
      email: 'admin@example.com',
      department: 'الإدارة',
      access: ['الطلبات', 'المستخدمين', 'القائمة', 'الإعدادات']
    },
    {
      id: '2',
      username: 'waiter1',
      name: 'أحمد النادل',
      role: 'waiter',
      email: 'waiter1@example.com',
      department: 'خدمة الطاولات',
      access: ['الطلبات', 'القائمة']
    },
    {
      id: '3',
      username: 'waiter2',
      name: 'خالد النادل',
      role: 'waiter',
      email: 'waiter2@example.com',
      department: 'خدمة الطاولات',
      access: ['الطلبات', 'القائمة']
    },
    {
      id: '4',
      username: 'screen1',
      name: 'شاشة المطبخ',
      role: 'screen',
      email: 'screen@example.com',
      department: 'المطبخ',
      access: ['العرض فقط']
    }
  ];

  const handleEditUser = (user: ExtendedUser) => {
    setEditingUser({...user});
    setIsAddingUser(false);
    setIsDialogOpen(true);
  };

  const handleAddNewUser = () => {
    setEditingUser({
      id: '',
      username: '',
      name: '',
      role: 'waiter',
      email: '',
      department: '',
      access: []
    });
    setIsAddingUser(true);
    setIsDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (!editingUser) return;
    
    toast.success(
      isAddingUser ? "تمت إضافة المستخدم بنجاح" : "تم تحديث بيانات المستخدم بنجاح",
      { 
        description: `${editingUser.name} (${editingUser.username})` 
      }
    );
    
    setIsDialogOpen(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;
    
    toast.success(`تم حذف المستخدم بنجاح`, {
      description: `${userToDelete.name} (${userToDelete.username})`
    });
  };
  
  // Only admins can see this page
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
        <Button 
          className="bg-restaurant-primary hover:bg-restaurant-primary-dark flex items-center gap-2"
          onClick={handleAddNewUser}
        >
          <span>+</span> إضافة مستخدم
        </Button>
      </div>
      
      <div className="space-y-4">
        {users.map((user) => (
          <Card key={user.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${
                    user.role === 'admin' ? 'bg-restaurant-primary/10' :
                    user.role === 'waiter' ? 'bg-blue-500/10' : 'bg-gray-100'
                  }`}>
                    <UserIcon className={`w-6 h-6 ${
                      user.role === 'admin' ? 'text-restaurant-primary' :
                      user.role === 'waiter' ? 'text-blue-500' : 'text-gray-500'
                    }`} />
                  </div>
                  
                  <div>
                    <h3 className="font-medium">{user.name}</h3>
                    <div className="text-sm text-gray-500">
                      <span>{user.email}</span>
                      <span className="mx-2">•</span>
                      <span>{user.username}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 ml-auto">
                  <Badge className={
                    user.role === 'admin' ? 'bg-restaurant-primary' : 
                    user.role === 'waiter' ? 'bg-blue-500' : 'bg-gray-500'
                  }>
                    {user.role === 'admin' ? 'مدير' : 
                     user.role === 'waiter' ? 'نادل' : 'شاشة'}
                  </Badge>
                  <span className="text-sm text-gray-500">{user.department}</span>
                  
                  <div className="ml-4 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit className="w-4 h-4" />
                      تعديل
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-500 border-red-200 hover:bg-red-50 flex items-center gap-1"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash className="w-4 h-4" />
                      حذف
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-100">
                <h4 className="text-sm font-medium mb-2">الصلاحيات:</h4>
                <div className="flex flex-wrap gap-2">
                  {user.access.map((item, idx) => (
                    <Badge key={idx} variant="outline" className="bg-gray-50">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isAddingUser ? 'إضافة مستخدم جديد' : 'تعديل المستخدم'}
            </DialogTitle>
          </DialogHeader>
          
          {editingUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">اسم المستخدم</Label>
                  <Input 
                    id="username"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">الدور</Label>
                  <Select 
                    value={editingUser.role} 
                    onValueChange={(value: 'admin' | 'waiter' | 'screen') => 
                      setEditingUser({...editingUser, role: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">مدير</SelectItem>
                      <SelectItem value="waiter">نادل</SelectItem>
                      <SelectItem value="screen">شاشة عرض</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">الاسم</Label>
                <Input 
                  id="name"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input 
                  id="email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">القسم</Label>
                <Input 
                  id="department"
                  value={editingUser.department}
                  onChange={(e) => setEditingUser({...editingUser, department: e.target.value})}
                />
              </div>
              
              {isAddingUser && (
                <div className="space-y-2">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Input id="password" type="password" />
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              إلغاء
            </Button>
            <Button 
              className="bg-restaurant-primary hover:bg-restaurant-primary-dark flex items-center gap-2"
              onClick={handleSaveUser}
            >
              <Save className="w-4 h-4" />
              {isAddingUser ? 'إضافة' : 'حفظ التغييرات'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
