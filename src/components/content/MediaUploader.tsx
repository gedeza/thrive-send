import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { ImageIcon, FileIcon, X, Loader2, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageEditor } from './ImageEditor';

export type MediaFile = {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'video' | 'document';
  size: number;
  progress?: number;
  url?: string;
  thumbnailUrl?: string;
};

interface MediaUploaderProps {
  onUpload: (files: MediaFile[]) => void;
  onRemove: (fileId: string) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedFileTypes?: string[];
  className?: string;
}

const ACCEPTED_IMAGE_TYPES = {
  'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
};

const ACCEPTED_VIDEO_TYPES = {
  'video/*': ['.mp4', '.webm', '.mov']
};

const ACCEPTED_DOCUMENT_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
};

export function MediaUploader({
  onUpload,
  onRemove,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes = ['image/*', 'video/*', 'application/pdf'],
  className
}: MediaUploaderProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [editingImage, setEditingImage] = useState<MediaFile | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);
    try {
      const uploadPromises = acceptedFiles.map(async (file) => {
        // Create preview URL for images and videos
        let preview = '';
        if (file.type.startsWith('image/')) {
          preview = URL.createObjectURL(file);
        } else if (file.type.startsWith('video/')) {
          preview = URL.createObjectURL(file);
        }

        // Upload file if it's an image
        let url, thumbnailUrl;
        if (file.type.startsWith('image/')) {
          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Failed to upload file');
          }

          const data = await response.json();
          url = data.url;
          thumbnailUrl = data.thumbnailUrl;
        }

        const type = file.type.startsWith('image/') 
          ? 'image' as const
          : file.type.startsWith('video/') 
            ? 'video' as const
            : 'document' as const;

        return {
          id: Math.random().toString(36).substring(7),
          file,
          preview,
          type,
          size: file.size,
          url,
          thumbnailUrl
        } satisfies MediaFile;
      });

      const newFiles = await Promise.all(uploadPromises);
      setFiles(prev => [...prev, ...newFiles]);
      onUpload(newFiles);
      toast({
        title: 'Success',
        description: 'Files uploaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload files',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept: {
      ...ACCEPTED_IMAGE_TYPES,
      ...ACCEPTED_VIDEO_TYPES,
      ...ACCEPTED_DOCUMENT_TYPES
    }
  });

  const handleRemove = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    onRemove(fileId);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleEditImage = (file: MediaFile) => {
    setEditingImage(file);
  };

  const handleSaveEdit = (editedImage: string) => {
    if (editingImage) {
      const updatedFiles = files.map(file => 
        file.id === editingImage.id 
          ? { ...file, preview: editedImage, url: editedImage }
          : file
      );
      setFiles(updatedFiles);
      onUpload(updatedFiles);
    }
    setEditingImage(null);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
          'hover:border-primary hover:bg-primary/5'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
          <div className="text-sm text-muted-foreground">
            {isDragActive ? (
              <p>Drop the files here...</p>
            ) : (
              <p>Drag & drop files here, or click to select files</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Supported formats: Images, Videos, PDFs (max {formatFileSize(maxSize)})
          </p>
        </div>
      </div>

      {isUploading && (
        <div className="space-y-2">
          <Progress value={100} className="animate-pulse" />
          <p className="text-sm text-muted-foreground text-center">Processing files...</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {files.map((file) => (
          <div
            key={file.id}
            className="group relative aspect-square rounded-lg overflow-hidden bg-muted"
          >
            {file.type === 'image' && (
              <img
                src={file.preview}
                alt={file.file.name}
                className="w-full h-full object-cover"
              />
            )}
            {file.type === 'video' && (
              <video
                src={file.preview}
                className="w-full h-full object-cover"
                controls
              />
            )}
            {file.type === 'document' && (
              <div className="w-full h-full flex items-center justify-center">
                <FileIcon className="w-12 h-12 text-muted-foreground" />
              </div>
            )}

            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {file.type === 'image' && (
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => handleEditImage(file)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleRemove(file.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
              <p className="text-xs text-white truncate">{file.file.name}</p>
              <p className="text-xs text-white/80">{formatFileSize(file.size)}</p>
            </div>
          </div>
        ))}
      </div>

      {editingImage && (
        <ImageEditor
          image={editingImage.preview}
          onSave={handleSaveEdit}
          onCancel={() => setEditingImage(null)}
          isOpen={!!editingImage}
        />
      )}
    </div>
  );
} 