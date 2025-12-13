
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SearchInput = ({ 
  value, 
  onChange, 
  placeholder = "بحث...",
  className,
  size = 'md'
}: SearchInputProps) => {
  const sizeClasses = {
    sm: 'h-10',
    md: 'h-12',
    lg: 'h-14 text-lg'
  };
  
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "pr-12 pl-10 sea-input",
          sizeClasses[size]
        )}
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8"
          onClick={() => onChange('')}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};
