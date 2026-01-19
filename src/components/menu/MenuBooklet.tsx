import React, { useState } from 'react';
import { MenuItem, MenuPage, OrderItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ChevronLeft, ChevronRight, Plus, Minus, 
  Edit, Trash2, Save, X, BookOpen, ImagePlus, UtensilsCrossed
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageUploader } from './ImageUploader';

interface MenuBookletProps {
  menuItems: MenuItem[];
  menuPages: MenuPage[];
  isAdmin: boolean;
  currentOrderItems?: OrderItem[];
  onAddToCart?: (item: MenuItem, quantity: number) => void;
  onUpdateQuantity?: (menuItemId: string, delta: number) => void;
  onPageUpdate?: (page: MenuPage) => void;
  onPageCreate?: (page: Omit<MenuPage, 'id'>) => void;
  onPageDelete?: (pageId: string) => void;
  onItemUpdate?: (item: MenuItem) => void;
  onItemCreate?: (item: Omit<MenuItem, 'id'>) => void;
  onItemDelete?: (itemId: string) => void;
  onAddItemToPage?: (pageId: string, itemId: string) => void;
}

export const MenuBooklet: React.FC<MenuBookletProps> = ({
  menuItems,
  menuPages,
  isAdmin,
  currentOrderItems = [],
  onAddToCart,
  onUpdateQuantity,
  onPageUpdate,
  onPageCreate,
  onPageDelete,
  onItemUpdate,
  onItemCreate,
  onItemDelete,
  onAddItemToPage
}) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'left' | 'right'>('right');
  const [editingPage, setEditingPage] = useState<MenuPage | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showAddPage, setShowAddPage] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 0,
    category: 'main_dishes',
    isAvailable: true,
    departmentId: '1',
    image: ''
  });

  const sortedPages = [...menuPages].sort((a, b) => a.order - b.order);
  const currentPage = sortedPages[currentPageIndex];

  const getItemsForPage = (page: MenuPage) => {
    return page.items
      .map(itemId => menuItems.find(item => item.id === itemId))
      .filter(Boolean) as MenuItem[];
  };

  const getItemQuantityInCart = (menuItemId: string) => {
    const item = currentOrderItems.find(i => i.menuItemId === menuItemId);
    return item?.quantity || 0;
  };

  const handlePageFlip = (direction: 'prev' | 'next') => {
    if (isFlipping) return;
    
    const newIndex = direction === 'next' 
      ? Math.min(currentPageIndex + 1, sortedPages.length - 1)
      : Math.max(currentPageIndex - 1, 0);
    
    if (newIndex !== currentPageIndex) {
      setIsFlipping(true);
      setFlipDirection(direction === 'next' ? 'right' : 'left');
      
      setTimeout(() => {
        setCurrentPageIndex(newIndex);
        setIsFlipping(false);
      }, 300);
    }
  };

  const handleSavePage = () => {
    if (editingPage && onPageUpdate) {
      onPageUpdate(editingPage);
      setEditingPage(null);
    }
  };

  const handleCreatePage = () => {
    if (newPageTitle && onPageCreate) {
      onPageCreate({
        title: newPageTitle,
        order: sortedPages.length + 1,
        items: []
      });
      setNewPageTitle('');
      setShowAddPage(false);
    }
  };

  const handleDeletePage = (pageId: string) => {
    if (onPageDelete) {
      onPageDelete(pageId);
      if (currentPageIndex >= sortedPages.length - 1) {
        setCurrentPageIndex(Math.max(0, currentPageIndex - 1));
      }
    }
  };

  const handleSaveItem = () => {
    if (editingItem && onItemUpdate) {
      onItemUpdate(editingItem);
      setEditingItem(null);
    }
  };

  const handleCreateItem = () => {
    if (newItem.name && newItem.price && onItemCreate && currentPage) {
      const item = {
        ...newItem,
        name: newItem.name!,
        price: newItem.price!,
        category: newItem.category || 'main_dishes',
        isAvailable: true,
        departmentId: newItem.departmentId || '1'
      } as Omit<MenuItem, 'id'>;
      
      onItemCreate(item);
      setNewItem({
        name: '',
        description: '',
        price: 0,
        category: 'main_dishes',
        isAvailable: true,
        departmentId: '1',
        image: ''
      });
      setShowAddItem(false);
    }
  };

  const handleQuickQuantityChange = (item: MenuItem, delta: number) => {
    const currentQty = getItemQuantityInCart(item.id);
    
    if (currentQty === 0 && delta > 0) {
      onAddToCart?.(item, 1);
    } else if (currentQty > 0) {
      onUpdateQuantity?.(item.id, delta);
    }
  };

  if (!currentPage && sortedPages.length === 0) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-cream rounded-3xl border-2 border-dashed border-primary/20">
        <div className="text-center p-8">
          <BookOpen className="w-20 h-20 mx-auto text-primary/30 mb-6" />
          <p className="text-2xl font-serif text-muted-foreground mb-4">لا توجد صفحات في القائمة</p>
          {isAdmin && (
            <Button 
              onClick={() => setShowAddPage(true)}
              className="sea-btn-primary text-lg px-8 py-6"
            >
              <Plus className="w-5 h-5 ml-2" />
              إضافة صفحة جديدة
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (!currentPage) return null;

  const pageItems = getItemsForPage(currentPage);

  return (
    <div className="relative">
      {/* Booklet Container */}
      <div className="relative mx-auto max-w-4xl">
        {/* Page Container */}
        <div 
          className={cn(
            "relative bg-cream rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 border border-primary/10",
            isFlipping && flipDirection === 'right' && "animate-page-flip-right",
            isFlipping && flipDirection === 'left' && "animate-page-flip-left"
          )}
          style={{ backgroundColor: currentPage.backgroundColor || '#F9F5F0' }}
        >
          {/* Page Header */}
          <div className="relative px-4 sm:px-8 py-4 sm:py-6 border-b-2 border-primary/10 bg-gradient-to-l from-primary/5 to-transparent">
            <div className="flex items-center justify-between gap-2">
              {isAdmin && editingPage?.id === currentPage.id ? (
                <Input
                  value={editingPage.title}
                  onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                  className="text-xl sm:text-2xl font-serif bg-white/80 border-primary/20 max-w-[200px] sm:max-w-xs"
                />
              ) : (
                <h2 className="text-2xl sm:text-4xl font-serif text-primary tracking-wide">
                  {currentPage.title}
                </h2>
              )}
              
              {isAdmin && (
                <div className="flex items-center gap-1 sm:gap-2">
                  {editingPage?.id === currentPage.id ? (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => setEditingPage(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                      <Button size="sm" className="sea-btn-primary" onClick={handleSavePage}>
                        <Save className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => setEditingPage(currentPage)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeletePage(currentPage.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        className="sea-btn-primary"
                        onClick={() => setShowAddItem(true)}
                      >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline mr-1">طبق</span>
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-4 sm:p-6 space-y-3 min-h-[400px] max-h-[60vh] overflow-y-auto">
            {pageItems.map((item) => {
              const cartQuantity = getItemQuantityInCart(item.id);
              
              return (
                <div 
                  key={item.id}
                  className={cn(
                    "group relative flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl transition-all duration-200",
                    "bg-white/60 hover:bg-white hover:shadow-lg border border-transparent hover:border-primary/10",
                    cartQuantity > 0 && "bg-primary/5 border-primary/20 shadow-md"
                  )}
                >
                  {/* Item Image */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                    {item.image && item.image !== '/placeholder.svg' ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                        <UtensilsCrossed className="w-6 h-6 sm:w-8 sm:h-8 text-primary/30" />
                      </div>
                    )}
                  </div>
                  
                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-foreground leading-tight truncate">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                      
                      {/* Price */}
                      <span className="text-lg sm:text-xl font-bold text-primary whitespace-nowrap">
                        ${item.price}
                      </span>
                    </div>
                    
                    {/* Quantity Controls - Waiter View */}
                    {!isAdmin && (
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant={cartQuantity > 0 ? "default" : "outline"}
                            className={cn(
                              "h-9 w-9 p-0 rounded-full transition-all",
                              cartQuantity > 0 && "sea-btn-primary"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickQuantityChange(item, -1);
                            }}
                            disabled={cartQuantity === 0}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          
                          <span className={cn(
                            "w-10 text-center font-bold text-lg transition-all",
                            cartQuantity > 0 ? "text-primary" : "text-muted-foreground"
                          )}>
                            {cartQuantity}
                          </span>
                          
                          <Button
                            size="sm"
                            className="h-9 w-9 p-0 rounded-full sea-btn-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickQuantityChange(item, 1);
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {cartQuantity > 0 && (
                          <Badge className="bg-primary/10 text-primary border-primary/20">
                            ${(item.price * cartQuantity).toFixed(2)}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {/* Admin Actions */}
                    {isAdmin && (
                      <div className="flex items-center gap-2 mt-3">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-8 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingItem(item);
                          }}
                        >
                          <Edit className="w-3 h-3 ml-1" />
                          تعديل
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            onItemDelete?.(item.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3 ml-1" />
                          حذف
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {pageItems.length === 0 && (
              <div className="text-center py-16">
                <UtensilsCrossed className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-lg text-muted-foreground">لا توجد أصناف في هذه الصفحة</p>
                {isAdmin && (
                  <Button 
                    className="mt-4 sea-btn-primary"
                    onClick={() => setShowAddItem(true)}
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة طبق
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Page Number */}
          <div className="py-3 border-t border-primary/10 bg-white/50">
            <div className="text-center">
              <span className="text-sm text-muted-foreground font-serif">
                صفحة {currentPageIndex + 1} من {sortedPages.length}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <Button
          variant="ghost"
          size="lg"
          className={cn(
            "absolute left-0 sm:-left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full",
            "bg-white shadow-lg hover:bg-primary hover:text-primary-foreground transition-all",
            currentPageIndex === 0 && "opacity-30 cursor-not-allowed"
          )}
          onClick={() => handlePageFlip('prev')}
          disabled={currentPageIndex === 0 || isFlipping}
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </Button>
        
        <Button
          variant="ghost"
          size="lg"
          className={cn(
            "absolute right-0 sm:-right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full",
            "bg-white shadow-lg hover:bg-primary hover:text-primary-foreground transition-all",
            currentPageIndex === sortedPages.length - 1 && "opacity-30 cursor-not-allowed"
          )}
          onClick={() => handlePageFlip('next')}
          disabled={currentPageIndex === sortedPages.length - 1 || isFlipping}
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </Button>

        {/* Page Indicators */}
        <div className="flex justify-center gap-2 mt-4 flex-wrap">
          {sortedPages.map((page, index) => (
            <button
              key={page.id}
              className={cn(
                "h-2 rounded-full transition-all",
                index === currentPageIndex 
                  ? "bg-primary w-8" 
                  : "bg-primary/30 hover:bg-primary/50 w-2"
              )}
              onClick={() => setCurrentPageIndex(index)}
            />
          ))}
          
          {isAdmin && (
            <button
              className="w-6 h-6 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-all"
              onClick={() => setShowAddPage(true)}
            >
              <Plus className="w-3 h-3 text-primary" />
            </button>
          )}
        </div>
      </div>

      {/* Add Page Dialog */}
      <Dialog open={showAddPage} onOpenChange={setShowAddPage}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">إضافة صفحة جديدة</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">عنوان الصفحة</label>
              <Input
                placeholder="مثال: الأطباق الرئيسية"
                value={newPageTitle}
                onChange={(e) => setNewPageTitle(e.target.value)}
                className="text-lg"
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowAddPage(false)}>إلغاء</Button>
            <Button className="sea-btn-primary" onClick={handleCreatePage} disabled={!newPageTitle}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة الصفحة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">إضافة طبق جديد</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">اسم الطبق *</label>
              <Input
                placeholder="مثال: مشاوي مشكلة"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">الوصف</label>
              <Textarea
                placeholder="وصف قصير للطبق..."
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                rows={2}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">السعر *</label>
              <Input
                type="number"
                placeholder="0.00"
                value={newItem.price || ''}
                onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">صورة الطبق</label>
              <ImageUploader
                currentImage={newItem.image}
                onImageChange={(url) => setNewItem({ ...newItem, image: url })}
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowAddItem(false)}>إلغاء</Button>
            <Button 
              className="sea-btn-primary" 
              onClick={handleCreateItem}
              disabled={!newItem.name || !newItem.price}
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة الطبق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">تعديل الطبق</DialogTitle>
          </DialogHeader>
          
          {editingItem && (
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">اسم الطبق</label>
                <Input
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">الوصف</label>
                <Textarea
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  rows={2}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">السعر</label>
                <Input
                  type="number"
                  value={editingItem.price}
                  onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">المكونات</label>
                <Textarea
                  value={editingItem.ingredients || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, ingredients: e.target.value })}
                  rows={2}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">صورة الطبق</label>
                <ImageUploader
                  currentImage={editingItem.image}
                  onImageChange={(url) => setEditingItem({ ...editingItem, image: url })}
                />
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditingItem(null)}>إلغاء</Button>
            <Button className="sea-btn-primary" onClick={handleSaveItem}>
              <Save className="w-4 h-4 ml-2" />
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
