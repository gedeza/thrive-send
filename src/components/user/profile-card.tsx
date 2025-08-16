"use client"

import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Alert } from "../ui/alert";
import type { ProfileFormData } from '@/lib/validations/profile';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export interface ProfileCardProps {
  name: string;
  avatarUrl?: string;
  bio?: string;
  role?: string;
  company?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  className?: string;
  onFollow?: () => void;
  onEdit: (data: ProfileFormData) => Promise<void>;
  isUpdating?: boolean;
}

export function ProfileCard({
  name,
  avatarUrl,
  bio,
  role,
  company,
  location,
  website,
  socialLinks,
  onEdit,
  isUpdating = false,
  className
}: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    name,
    bio: bio || '',
    role: role || '',
    company: company || '',
    location: location || '',
    website: website || '',
    socialLinks: socialLinks || {},
  });

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    setFormData({
      name,
      bio: bio || '',
      role: role || '',
      company: company || '',
      location: location || '',
      website: website || '',
      socialLinks: socialLinks || {},
    });
  };

  const handleSave = async () => {
    try {
      await onEdit(formData);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  const handleChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSocialLinkChange = (platform: 'twitter' | 'linkedin' | 'github', value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value,
      },
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
      <div className="flex items-center space-x-4 mb-6">
        <Avatar className="h-16 w-16">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          {isEditing ? (
            <Input
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Your name"
              className="mb-2"
            />
          ) : (
            <h2 className="text-xl font-semibold text-neutral-text">{name}</h2>
          )}
          {role && !isEditing && (
            <p className="text-sm text-neutral-text-light">{role}</p>
          )}
        </div>
      </div>

      {error && (
        <Alert intent="error" style={{ marginBottom: '1rem' }}>
          <p>{error}</p>
        </Alert>
      )}

      <div className="space-y-4">
        {isEditing ? (
          <>
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-1">
                Bio
              </label>
              <Textarea
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Tell us about yourself"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-1">
                Role
              </label>
              <Input
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                placeholder="Your role"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-1">
                Company
              </label>
              <Input
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                placeholder="Your company"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-1">
                Location
              </label>
              <Input
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Your location"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-1">
                Website
              </label>
              <Input
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="Your website"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-1">
                Social Links
              </label>
              <div className="space-y-2">
                <Input
                  value={formData.socialLinks?.twitter || ''}
                  onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                  placeholder="Twitter username"
                />
                <Input
                  value={formData.socialLinks?.linkedin || ''}
                  onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                  placeholder="LinkedIn profile URL"
                />
                <Input
                  value={formData.socialLinks?.github || ''}
                  onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                  placeholder="GitHub username"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            {bio && (
              <p className="text-neutral-text-light">{bio}</p>
            )}
          </>
        )}
      </div>

      <div className="mt-6 flex justify-end space-x-2">
        {isEditing ? (
          <>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isUpdating}
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            onClick={handleEdit}
            disabled={isUpdating}
          >
            Edit Profile
          </Button>
        )}
      </div>
    </div>
  );
}
