
import React, { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, User, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PeopleCountSliderProps {
  currentCount: number;
  onChange: (count: number) => void;
  max?: number;
}

export const PeopleCountSlider: React.FC<PeopleCountSliderProps> = ({
  currentCount,
  onChange,
  max = 100
}) => {
  const [count, setCount] = useState<number>(currentCount || 0);
  
  // Update local state if prop changes
  useEffect(() => {
    setCount(currentCount);
  }, [currentCount]);
  
  const handleIncrement = () => {
    const newCount = Math.min(count + 1, max);
    setCount(newCount);
    onChange(newCount);
  };
  
  const handleDecrement = () => {
    const newCount = Math.max(count - 1, 0);
    setCount(newCount);
    onChange(newCount);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCount = Math.max(0, Math.min(max, parseInt(e.target.value) || 0));
    setCount(newCount);
    onChange(newCount);
  };
  
  // Quick selection buttons for common counts
  const quickCounts = [1, 2, 4, 6, 8];
  
  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-center">
        {count > 0 ? (
          <div className="flex flex-col items-center">
            <div className="relative">
              {count <= 4 ? (
                <div className="flex">
                  {[...Array(count)].map((_, i) => (
                    <User key={i} className="h-8 w-8 text-primary" />
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Users className="h-10 w-10 text-primary" />
                  <Badge variant="secondary" className="text-lg h-8 min-w-8">
                    {count}
                  </Badge>
                </div>
              )}
            </div>
            <p className="text-sm mt-1 text-muted-foreground">
              {count === 1 ? "شخص واحد" : `${count} أشخاص`}
            </p>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <Users className="h-12 w-12 mx-auto opacity-30" />
            <p className="mt-1">حدد عدد الأشخاص</p>
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {quickCounts.map(quickCount => (
          <Button
            key={quickCount}
            variant={count === quickCount ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setCount(quickCount);
              onChange(quickCount);
            }}
            className="min-w-12"
          >
            {quickCount}
          </Button>
        ))}
      </div>
      
      <div className="flex items-center gap-2 w-full">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={handleDecrement}
          disabled={count <= 0}
        >
          <Minus className="h-3 w-3" />
        </Button>
        
        <div className="flex-1 relative">
          <Input
            type="number"
            value={count}
            onChange={handleInputChange}
            className="text-center px-8 py-1 h-8"
            min={0}
            max={max}
          />
          <Slider
            value={[count]}
            min={0}
            max={max}
            step={1}
            onValueChange={(value) => {
              const newCount = value[0];
              setCount(newCount);
              onChange(newCount);
            }}
            className="absolute left-0 right-0 bottom-0 top-0 opacity-0 cursor-pointer"
          />
        </div>
        
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={handleIncrement}
          disabled={count >= max}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
