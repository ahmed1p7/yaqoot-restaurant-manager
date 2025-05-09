
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface ImageUploaderProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
}

export const ImageUploader = ({ currentImage, onImageChange }: ImageUploaderProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImage);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("الرجاء اختيار ملف صورة صالح");
      return;
    }

    // Simulate upload (in a real app, this would upload to a server)
    setIsUploading(true);
    const reader = new FileReader();
    
    reader.onloadend = () => {
      // Process image
      setTimeout(() => {
        setPreviewUrl(reader.result as string);
        onImageChange(reader.result as string);
        setIsUploading(false);
        toast.success("تم رفع الصورة بنجاح");
      }, 1000); // Simulate network delay
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input
          type="file"
          accept="image/*"
          id="dish-image"
          className="hidden"
          onChange={handleFileChange}
        />
        <label
          htmlFor="dish-image"
          className="flex items-center gap-2 cursor-pointer"
        >
          <Button 
            type="button" 
            variant="outline" 
            disabled={isUploading}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {isUploading ? "جاري الرفع..." : "رفع صورة"}
          </Button>
        </label>
      </div>

      {previewUrl && (
        <div className="relative aspect-video w-full border rounded-md overflow-hidden bg-gray-50">
          <img
            src={previewUrl}
            alt="معاينة الصورة"
            className="w-full h-full object-contain"
          />
        </div>
      )}

      {!previewUrl && (
        <div className="aspect-video w-full border rounded-md bg-gray-50 flex items-center justify-center text-gray-400">
          لا توجد صورة
        </div>
      )}
    </div>
  );
};
