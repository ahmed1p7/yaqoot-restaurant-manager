
import { useState, useEffect } from "react";
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
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User as UserIcon, Edit, Trash, Save, Lock, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define an extended user type for the UI
type ExtendedUser = {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'waiter' | 'screen' | 'drinks';
  email: string;
  department: string;
  access: string[];
  isActive: boolean;
};

// Define permissions by role
const rolePermissions: Record<string, string[]> = {
  'admin': ['الطلبات', 'المستخدمين', 'القائمة', 'الإعدادات', 'التقارير', 'إدارة الطابعات'],
  'waiter': ['الطلبات', 'القائمة'],
  'screen': ['العرض فقط'],
  'drinks': ['المشروبات']
};

export const Users = () => {
  const { user } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ExtendedUser | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // In a real app, users would be fetched from an API
  const [users, setUsers] = useState<ExtendedUser[]>([
    {
      id: '1',
      username: 'admin',
      name: 'محمد المدير',
      role: 'admin',
      email: 'admin@example.com',
      department: 'الإدارة',
      access: rolePermissions['admin'],
      isActive: true
    },
    {
      id: '2',
      username: 'waiter1',
      name: 'أحمد النادل',
      role: 'waiter',
      email: 'waiter1@example.com',
      department: 'خدمة الطاولات',
      access: rolePermissions['waiter'],
      isActive: true
    },
    {
      id: '3',
      username: 'waiter2',
      name: 'خالد النادل',
      role: 'waiter',
      email: 'waiter2@example.com',
      department: 'خدمة الطاولات',
      access: rolePermissions['waiter'],
      isActive: true
    },
    {
      id: '4',
      username: 'screen1',
      name: 'شاشة المطبخ',
      role: 'screen',
      email: 'screen@example.com',
      department: 'المطبخ',
      access: rolePermissions['screen'],
      isActive: true
    },
    {
      id: '5',
      username: 'drinks1',
      name: 'شاشة المشروبات',
      role: 'drinks',
      email: 'drinks@example.com',
      department: 'المشروبات',
      access: rolePermissions['drinks'],
      isActive: true
    }
  ]);

  // Filter users based on active tab
  const filteredUsers = activeTab === 'all' 
    ? users 
    : users.filter(u => activeTab === 'active' ? u.isActive : !u.isActive);

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
      access: [],
      isActive: true
    });
    setIsAddingUser(true);
    setIsDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (!editingUser) return;
    
    if (isAddingUser) {
      // Generate ID for new user
      const newUser = {
        ...editingUser,
        id: `user-${Date.now()}`,
        access: rolePermissions[editingUser.role] || [] // Set default permissions based on role
      };
      setUsers([...users, newUser]);
    } else {
      // Update existing user
      setUsers(users.map(u => u.id === editingUser.id ? {
        ...editingUser,
        access: rolePermissions[editingUser.role] || editingUser.access // Update permissions if role changed
      } : u));
    }
    
    toast.success(
      isAddingUser ? "تمت إضافة المستخدم بنجاح" : "تم تحديث بيانات المستخدم بنجاح",
      { description: `${editingUser.name} (${editingUser.username})` }
    );
    
    setIsDialogOpen(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;
    
    // Instead of deleting, just set as inactive
    if (userToDelete.id === '1') {
      toast.error("لا يمكن حذف المستخدم الرئيسي للنظام");
      return;
    }
    
    setUsers(users.map(u => 
      u.id === userId ? {...u, isActive: false} : u
    ));
    
    toast.success(`تم تعطيل حساب المستخدم بنجاح`, {
      description: `${userToDelete.name} (${userToDelete.username})`
    });
  };
  
  const handleToggleUserStatus = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId ? {...u, isActive: !u.isActive} : u
    ));
    
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      toast.success(
        targetUser.isActive ? "تم تعطيل حساب المستخدم" : "تم تفعيل حساب المستخدم",
        { description: `${targetUser.name} (${targetUser.username})` }
      );
    }
  };
  
  const handleChangePassword = (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      setEditingUser(targetUser);
      setNewPassword('');
      setConfirmPassword('');
      setIsPasswordDialogOpen(true);
    }
  };
  
  const handleSavePassword = () => {
    if (!editingUser) return;
    
    if (newPassword.length < 4) {
      toast.error("كلمة المرور يجب أن تكون 4 أحرف على الأقل");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("كلمة المرور وتأكيدها غير متطابقين");
      return;
    }
    
    toast.success("تم تغيير كلمة المرور بنجاح", {
      description: `${editingUser.name} (${editingUser.username})`
    });
    
    setIsPasswordDialogOpen(false);
    setEditingUser(null);
  };
  
  // Update role permissions when role changes
  useEffect(() => {
    if (editingUser && editingUser.role) {
      setEditingUser({
        ...editingUser,
        access: rolePermissions[editingUser.role] || []
      });
    }
  }, [editingUser?.role]);
  
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
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'active' | 'inactive')}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">جميع المستخدمين</TabsTrigger>
          <TabsTrigger value="active">المفعّلين</TabsTrigger>
          <TabsTrigger value="inactive">المعطّلين</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className={`overflow-hidden shadow-md hover:shadow-lg transition-shadow ${!user.isActive ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${
                        user.role === 'admin' ? 'bg-restaurant-primary/10' :
                        user.role === 'waiter' ? 'bg-blue-500/10' : 
                        user.role === 'drinks' ? 'bg-purple-500/10' : 'bg-gray-100'
                      }`}>
                        <UserIcon className={`w-6 h-6 ${
                          user.role === 'admin' ? 'text-restaurant-primary' :
                          user.role === 'waiter' ? 'text-blue-500' : 
                          user.role === 'drinks' ? 'text-purple-500' : 'text-gray-500'
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
                        user.role === 'waiter' ? 'bg-blue-500' : 
                        user.role === 'drinks' ? 'bg-purple-500' : 'bg-gray-500'
                      }>
                        {user.role === 'admin' ? 'مدير' : 
                        user.role === 'waiter' ? 'نادل' : 
                        user.role === 'drinks' ? 'مشروبات' : 'شاشة'}
                      </Badge>
                      <span className="text-sm text-gray-500">{user.department}</span>
                      
                      <Badge variant={user.isActive ? "outline" : "destructive"} className="mr-2">
                        {user.isActive ? 'نشط' : 'معطل'}
                      </Badge>
                      
                      <div className="ml-4 flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => handleToggleUserStatus(user.id)}
                        >
                          {user.isActive ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                          {user.isActive ? 'تعطيل' : 'تفعيل'}
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => handleChangePassword(user.id)}
                        >
                          <Lock className="w-4 h-4" />
                          تغيير كلمة المرور
                        </Button>
                        
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
                          disabled={user.id === '1'} // Prevent deleting main admin
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
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-10 bg-gray-50 rounded-lg">
                <UserIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-600">لا يوجد مستخدمين</h3>
                <p className="text-gray-500 mt-1">لا يوجد مستخدمين في هذه القائمة</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* User edit/add dialog */}
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
                    onValueChange={(value: 'admin' | 'waiter' | 'screen' | 'drinks') => 
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
                      <SelectItem value="drinks">مشروبات</SelectItem>
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
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="isActive" 
                    checked={editingUser.isActive}
                    onCheckedChange={(checked) => 
                      setEditingUser({...editingUser, isActive: checked === true})
                    }
                  />
                  <Label htmlFor="isActive">حساب نشط</Label>
                </div>
                <p className="text-xs text-gray-500">المستخدمين النشطين فقط يمكنهم تسجيل الدخول</p>
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
      
      {/* Password change dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تغيير كلمة المرور</DialogTitle>
            <DialogDescription>
              {editingUser && `المستخدم: ${editingUser.name}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
              <Input 
                id="newPassword" 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
              <Input 
                id="confirmPassword" 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} 
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
              إلغاء
            </Button>
            <Button 
              className="bg-restaurant-primary hover:bg-restaurant-primary-dark"
              onClick={handleSavePassword}
            >
              حفظ كلمة المرور
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
