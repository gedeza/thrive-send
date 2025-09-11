"use client";

import React from 'react';
import { Image, Video, FileText, File } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaFile {
  id?: string;
  url?: string;
  thumbnailUrl?: string;
  type?: string;
  filename?: string;
  altText?: string;
  caption?: string;
}

interface MediaPreviewProps {
  media?: any; // Can be JSON string, array, or MediaFile[]
  mediaItems?: MediaFile[]; // For relational media items
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  maxItems?: number;
  showCount?: boolean;
}

// Helper function to parse media data safely
function parseMediaData(media: any): MediaFile[] {
  if (!media) return [];
  
  try {
    // If it's already an array, return it
    if (Array.isArray(media)) {
      return media.filter(item => item && (item.url || item.filename));
    }
    
    // If it's a string (JSON), try to parse it
    if (typeof media === 'string') {
      const parsed = JSON.parse(media);
      return Array.isArray(parsed) ? parsed.filter(item => item && (item.url || item.filename)) : [];
    }
    
    // If it's a single object, wrap it in array
    if (typeof media === 'object' && media.url) {
      return [media];
    }
    
    return [];
  } catch (_error) {
    console.warn('Failed to parse media data:', error);
    return [];
  }
}

// Helper function to get media type from URL or filename
function getMediaType(item: MediaFile): 'image' | 'video' | 'document' | 'unknown' {
  const url = item.url || item.filename || '';
  const type = item.type || '';
  
  if (type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(url)) {
    return 'image';
  }
  
  if (type.startsWith('video/') || /\.(mp4|avi|mov|wmv|flv|webm|mkv)$/i.test(url)) {
    return 'video';
  }
  
  if (type.includes('document') || type.includes('pdf') || /\.(pdf|doc|docx|txt|rtf)$/i.test(url)) {
    return 'document';
  }
  
  return 'unknown';
}

// Helper function to get icon for media type
function getMediaIcon(type: 'image' | 'video' | 'document' | 'unknown', size: string) {
  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5';
  
  switch (type) {
    case 'image':
      return <Image className={iconSize} />;
    case 'video':
      return <Video className={iconSize} />;
    case 'document':
      return <FileText className={iconSize} />;
    default:
      return <File className={iconSize} />;
  }
}

export function MediaPreview({ 
  media, 
  mediaItems, 
  className, 
  size = 'md', 
  maxItems = 3,
  showCount = true 
}: MediaPreviewProps) {
  // Combine both media sources
  const parsedMedia = parseMediaData(media);
  const allMediaItems = [...parsedMedia, ...(mediaItems || [])];
  
  if (allMediaItems.length === 0) {
    return null;
  }

  const displayItems = allMediaItems.slice(0, maxItems);
  const remainingCount = allMediaItems.length - maxItems;

  const containerClasses = {
    sm: 'gap-1',
    md: 'gap-1.5',
    lg: 'gap-2'
  };

  const thumbnailClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  const iconContainerClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-10 w-10'
  };

  return (
    <div className={cn('flex items-center', containerClasses[size], className)}>
      {displayItems.map((item, index) => {
        const mediaType = getMediaType(item);
        const imageUrl = item.thumbnailUrl || item.url;
        
        return (
          <div
            key={item.id || index}
            className={cn(
              'rounded-md overflow-hidden bg-gray-100 border flex-shrink-0',
              thumbnailClasses[size]
            )}
          >
            {mediaType === 'image' && imageUrl ? (
              <img
                src={imageUrl}
                alt={item.altText || item.caption || `Media ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to icon if image fails to load
                  const target = e.target as HTMLImageElement;
                  const container = target.parentElement;
                  if (container) {
                    container.innerHTML = '';
                    const iconWrapper = document.createElement('div');
                    iconWrapper.className = 'w-full h-full flex items-center justify-center text-gray-400';
                    container.appendChild(iconWrapper);
                  }
                }}
              />
            ) : (
              <div className={cn(
                'w-full h-full flex items-center justify-center text-gray-400',
                iconContainerClasses[size]
              )}>
                {getMediaIcon(mediaType, size)}
              </div>
            )}
          </div>
        );
      })}
      
      {remainingCount > 0 && showCount && (
        <div className={cn(
          'rounded-md bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-medium border flex-shrink-0',
          thumbnailClasses[size]
        )}>
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

export default MediaPreview;