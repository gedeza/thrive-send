"use client"

import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Alert, AlertDescription } from "../ui/alert";

export interface ProfileCardProps {
  name: string;
  avatarUrl?: string;
  bio?: string;
  role?: string;
  className?: string;
  onFollow?: () => void;
  onEdit?: (data: { name: string; bio?: string }) => void | Promise<void>;
}

export function ProfileCard({
  name: initialName,
  avatarUrl,
  bio: initialBio,
  role,
  className,
  onFollow,
  onEdit
}: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio || '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setName(initialName);
    setBio(initialBio || '');
    setError(null);
  };

  const handleSave = async () => {
    if (!onEdit) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = onEdit({ name, bio });
      
      // Handle both synchronous and Promise-based onEdit
      if (result instanceof Promise) {
        await result;
      }
      
      setIsEditing(false);
    } catch (err) {
      console.error("Profile update error:", err);
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div 
      data-testid="profile-card" 
      className={cn("bg-card rounded-lg border border-border overflow-hidden", className)}
    >
      <div className="bg-primary/10 h-24 relative"></div>
      
      <div className="px-4 pb-4">
        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertDescription data-testid="profile-card-error">{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-col items-center -mt-12">
          <div className="h-24 w-24 rounded-full border-4 border-background overflow-hidden bg-background flex items-center justify-center">
            {avatarUrl ? (
              <img 
                data-testid="profile-card-avatar"
                src={avatarUrl} 
                alt={`${initialName}'s avatar`} 
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-12 w-12 text-muted-foreground" />
            )}
          </div>
          
          {isEditing ? (
            <div className="w-full mt-4 space-y-3">
              <Input
                data-testid="profile-card-name-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="text-center"
              />
              
              <Textarea
                data-testid="profile-card-bio-input"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Bio"
                className="resize-none text-center"
                rows={3}
              />
              
              <div className="flex gap-2 w-full">
                <Button 
                  data-testid="profile-card-save" 
                  className="flex-1" 
                  size="sm"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save'}
                </Button>
                <Button 
                  data-testid="profile-card-cancel" 
                  className="flex-1" 
                  variant="outline" 
                  size="sm"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h3 data-testid="profile-card-name" className="text-lg font-semibold mt-2">{name}</h3>
              
              {role && (
                <p className="text-sm text-muted-foreground">{role}</p>
              )}
              
              {bio && (
                <p data-testid="profile-card-bio" className="text-sm text-center mt-2">{bio}</p>
              )}
              
              <div className="flex gap-2 mt-4 w-full">
                <Button className="flex-1" variant="outline" size="sm">
                  Message
                </Button>
                {onFollow && (
                  <Button 
                    data-testid="profile-card-follow" 
                    className="flex-1" 
                    size="sm"
                    onClick={onFollow}
                  >
                    Follow
                  </Button>
                )}
                {!onFollow && !onEdit && (
                  <Button className="flex-1" size="sm">
                    Follow
                  </Button>
                )}
                {onEdit && (
                  <Button 
                    data-testid="profile-card-edit" 
                    className="flex-1" 
                    size="sm"
                    variant={onFollow ? "outline" : "default"}
                    onClick={handleEdit}
                  >
                    Edit
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
