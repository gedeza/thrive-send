import React, { useState, useCallback } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface ImageEditorProps {
  image: string;
  onSave: (editedImage: string) => void;
  onCancel: () => void;
  isOpen: boolean;
}

const filters = {
  none: '',
  grayscale: 'grayscale(100%)',
  sepia: 'sepia(100%)',
  blur: 'blur(2px)',
  brightness: 'brightness(150%)',
  contrast: 'contrast(200%)',
  saturate: 'saturate(200%)',
  invert: 'invert(100%)',
} as const;

type FilterType = keyof typeof filters;

export function ImageEditor({ image, onSave, onCancel, isOpen }: ImageEditorProps) {
  const [cropper, setCropper] = useState<Cropper>();
  const [activeFilter, setActiveFilter] = useState<FilterType>('none');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  const handleSave = useCallback(() => {
    if (cropper) {
      const canvas = cropper.getCroppedCanvas();
      if (canvas) {
        onSave(canvas.toDataURL('image/webp', 0.9));
      }
    }
  }, [cropper, onSave]);

  const getFilterStyle = () => {
    const baseFilter = filters[activeFilter];
    const customFilters = [
      `brightness(${brightness}%)`,
      `contrast(${contrast}%)`,
      `saturate(${saturation}%)`,
    ].join(' ');

    return {
      filter: `${baseFilter} ${customFilters}`,
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit Image</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="aspect-square relative bg-muted rounded-lg overflow-hidden">
              <Cropper
                src={image}
                style={{ height: '100%', width: '100%' }}
                aspectRatio={1}
                guides={true}
                onInitialized={(instance) => setCropper(instance)}
              />
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Filters</h4>
                <div className="grid grid-cols-4 gap-2">
                  {Object.keys(filters).map((filter) => (
                    <Button
                      key={filter}
                      variant={activeFilter === filter ? 'default' : 'outline'}
                      className="w-full"
                      onClick={() => setActiveFilter(filter as FilterType)}
                    >
                      {filter}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Brightness</label>
                  <Slider
                    value={[brightness]}
                    onValueChange={([value]) => setBrightness(value)}
                    min={0}
                    max={200}
                    step={1}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Contrast</label>
                  <Slider
                    value={[contrast]}
                    onValueChange={([value]) => setContrast(value)}
                    min={0}
                    max={200}
                    step={1}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Saturation</label>
                  <Slider
                    value={[saturation]}
                    onValueChange={([value]) => setSaturation(value)}
                    min={0}
                    max={200}
                    step={1}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Preview</h4>
            <div className="aspect-square relative bg-muted rounded-lg overflow-hidden">
              <img
                src={image}
                alt="Preview"
                className="w-full h-full object-contain"
                style={getFilterStyle()}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 