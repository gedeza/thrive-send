import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, X } from 'lucide-react';

interface ContentPreviewProps {
  title: string;
  content: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ContentPreview({ title, content, isOpen, onClose }: ContentPreviewProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Preview: {title}
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>

          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 