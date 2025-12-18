import React, { useState, useEffect } from 'react';
import { MenuItem, MenuPage, OrderItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  ChevronLeft, ChevronRight, Plus, Minus, ShoppingCart, 
  Edit, Trash2, Save, X, GripVertical, BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  onItemDelete?: (itemId: string) => void;
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
  onItemDelete
}) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'left' | 'right'>('right');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [editingPage, setEditingPage] = useState<MenuPage | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showAddPage, setShowAddPage] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');

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
      }, 400);
    }
  };

  const handleAddToCart = (item: MenuItem) => {
    if (onAddToCart) {
      onAddToCart(item, quantity);
      setSelectedItem(null);
      setQuantity(1);
    }
  };

  const handleQuickAdd = (item: MenuItem) => {
    if (onAddToCart) {
      onAddToCart(item, 1);
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

  if (!currentPage) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-cream rounded-3xl">
        <div className="text-center">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground">لا توجد صفحات في القائمة</p>
          {isAdmin && (
            <Button 
              onClick={() => setShowAddPage(true)}
              className="mt-4 sea-btn-primary"
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة صفحة جديدة
            </Button>
          )}
        </div>
      </div>
    );
  }

  const pageItems = getItemsForPage(currentPage);

  return (
    <div className="relative">
      {/* Booklet Container */}
      <div className="relative mx-auto max-w-4xl">
        {/* Book spine effect */}
        <div className="absolute left-1/2 top-0 bottom-0 w-4 -ml-2 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 z-10 shadow-lg" />
        
        {/* Page Container */}
        <div 
          className={cn(
            "relative min-h-[700px] bg-cream rounded-3xl shadow-2xl overflow-hidden transition-all duration-400",
            isFlipping && flipDirection === 'right' && "animate-page-flip-right",
            isFlipping && flipDirection === 'left' && "animate-page-flip-left"
          )}
          style={{ backgroundColor: currentPage.backgroundColor || '#F9F5F0' }}
        >
          {/* Page Header */}
          <div className="relative px-8 py-6 border-b-2 border-primary/20">
            <div className="flex items-center justify-between">
              {isAdmin && editingPage?.id === currentPage.id ? (
                <Input
                  value={editingPage.title}
                  onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                  className="text-3xl font-serif bg-transparent border-none focus:ring-0 max-w-xs"
                />
              ) : (
                <h2 className="text-4xl font-serif text-primary tracking-wide">
                  {currentPage.title}
                </h2>
              )}
              
              {isAdmin && (
                <div className="flex items-center gap-2">
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
                        className="text-destructive"
                        onClick={() => handleDeletePage(currentPage.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
            
            {/* Decorative line */}
            <div className="mt-4 h-0.5 bg-gradient-to-r from-transparent via-secondary to-transparent" />
          </div>

          {/* Menu Items */}
          <div className="p-8 space-y-4">
            {pageItems.map((item, index) => {
              const cartQuantity = getItemQuantityInCart(item.id);
              
              return (
                <div 
                  key={item.id}
                  className={cn(
                    "group relative flex items-start gap-4 p-4 rounded-xl transition-all duration-300",
                    "hover:bg-white/50 hover:shadow-lg cursor-pointer",
                    cartQuantity > 0 && "bg-primary/5 ring-2 ring-primary/20"
                  )}
                  onClick={() => !isAdmin && setSelectedItem(item)}
                >
                  {isAdmin && (
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                    </div>
                  )}
                  
                  {/* Item Image */}
                  {item.image && (
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-primary/20">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  
                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground leading-tight">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        {item.ingredients && (
                          <p className="text-xs text-muted-foreground/70 mt-1 italic">
                            {item.ingredients}
                          </p>
                        )}
                      </div>
                      
                      {/* Price */}
                      <div className="text-right flex-shrink-0">
                        <span className="text-2xl font-bold text-primary">
                          ${item.price}
                        </span>
                        {item.calories && (
                          <p className="text-xs text-muted-foreground mt-1">{item.calories} cal</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Cart Quantity or Quick Add */}
                    {!isAdmin && (
                      <div className="flex items-center justify-between mt-3">
                        {cartQuantity > 0 ? (
                          <div className="flex items-center gap-2">
                            <Badge className="bg-primary text-primary-foreground">
                              في السلة: {cartQuantity}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateQuantity?.(item.id, -1);
                                }}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateQuantity?.(item.id, 1);
                                }}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            className="sea-btn-primary opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickAdd(item);
                            }}
                          >
                            <Plus className="w-4 h-4 ml-1" />
                            إضافة
                          </Button>
                        )}
                        
                        <span className="text-xs text-muted-foreground">
                          انقر للتفاصيل
                        </span>
                      </div>
                    )}
                    
                    {/* Admin Actions */}
                    {isAdmin && (
                      <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          size="sm" 
                          variant="outline"
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
                          className="text-destructive border-destructive"
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
              <div className="text-center py-12">
                <p className="text-muted-foreground">لا توجد أصناف في هذه الصفحة</p>
              </div>
            )}
          </div>

          {/* Page Number */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <span className="text-sm text-muted-foreground font-serif">
              {currentPageIndex + 1} / {sortedPages.length}
            </span>
          </div>
        </div>

        {/* Navigation Buttons */}
        <Button
          variant="ghost"
          size="lg"
          className={cn(
            "absolute left-2 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full",
            "bg-white/90 shadow-xl hover:bg-white hover:scale-110 transition-all",
            currentPageIndex === 0 && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => handlePageFlip('prev')}
          disabled={currentPageIndex === 0 || isFlipping}
        >
          <ChevronRight className="w-8 h-8 text-primary" />
        </Button>
        
        <Button
          variant="ghost"
          size="lg"
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full",
            "bg-white/90 shadow-xl hover:bg-white hover:scale-110 transition-all",
            currentPageIndex === sortedPages.length - 1 && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => handlePageFlip('next')}
          disabled={currentPageIndex === sortedPages.length - 1 || isFlipping}
        >
          <ChevronLeft className="w-8 h-8 text-primary" />
        </Button>

        {/* Page Indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {sortedPages.map((page, index) => (
            <button
              key={page.id}
              className={cn(
                "w-3 h-3 rounded-full transition-all",
                index === currentPageIndex 
                  ? "bg-primary scale-125" 
                  : "bg-primary/30 hover:bg-primary/50"
              )}
              onClick={() => setCurrentPageIndex(index)}
            />
          ))}
          
          {isAdmin && (
            <button
              className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-all"
              onClick={() => setShowAddPage(true)}
            >
              <Plus className="w-4 h-4 text-primary" />
            </button>
          )}
        </div>
      </div>

      {/* Item Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedItem && (
            <>
              {selectedItem.image && (
                <div className="aspect-video rounded-xl overflow-hidden mb-4">
                  <img 
                    src={selectedItem.image} 
                    alt={selectedItem.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedItem.name}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {selectedItem.description && (
                  <p className="text-muted-foreground">{selectedItem.description}</p>
                )}
                
                {selectedItem.ingredients && (
                  <div>
                    <h4 className="font-semibold mb-1">المكونات:</h4>
                    <p className="text-sm text-muted-foreground">{selectedItem.ingredients}</p>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  {selectedItem.calories && (
                    <Badge variant="outline">{selectedItem.calories} سعرة</Badge>
                  )}
                  {selectedItem.volume && (
                    <Badge variant="outline">{selectedItem.volume}</Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-3xl font-bold text-primary">${selectedItem.price}</span>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-muted rounded-full p-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 rounded-full"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-bold">{quantity}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 rounded-full"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  className="w-full sea-btn-primary"
                  onClick={() => handleAddToCart(selectedItem)}
                >
                  <ShoppingCart className="w-4 h-4 ml-2" />
                  إضافة للسلة • ${(selectedItem.price * quantity).toFixed(2)}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Page Dialog */}
      <Dialog open={showAddPage} onOpenChange={setShowAddPage}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة صفحة جديدة</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Input
              placeholder="عنوان الصفحة (مثال: I Contorni)"
              value={newPageTitle}
              onChange={(e) => setNewPageTitle(e.target.value)}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPage(false)}>إلغاء</Button>
            <Button className="sea-btn-primary" onClick={handleCreatePage}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>تعديل الصنف</DialogTitle>
          </DialogHeader>
          
          {editingItem && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">الاسم</label>
                <Input
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">الوصف</label>
                <Input
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">السعر</label>
                <Input
                  type="number"
                  value={editingItem.price}
                  onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">المكونات</label>
                <Input
                  value={editingItem.ingredients || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, ingredients: e.target.value })}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>إلغاء</Button>
            <Button className="sea-btn-primary" onClick={handleSaveItem}>
              <Save className="w-4 h-4 ml-2" />
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
