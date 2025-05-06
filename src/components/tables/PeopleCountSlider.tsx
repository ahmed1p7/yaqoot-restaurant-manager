
import React, { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";

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
  
  return (
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
  );
};
