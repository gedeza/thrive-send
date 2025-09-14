"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Palette, 
  Sun, 
  Moon, 
  Monitor,
  Eye, 
  Accessibility
} from 'lucide-react';

export default function ThemeAppearanceSettings() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme & Appearance
          </CardTitle>
          <CardDescription>
            Customize the visual appearance of your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border text-center">
              <Sun className="h-8 w-8 mx-auto mb-2" />
              <div className="font-medium">Light</div>
              <Badge variant="outline" className="mt-2">Active</Badge>
            </div>
            
            <div className="p-4 rounded-lg border text-center opacity-60">
              <Moon className="h-8 w-8 mx-auto mb-2" />
              <div className="font-medium">Dark</div>
            </div>
            
            <div className="p-4 rounded-lg border text-center opacity-60">
              <Monitor className="h-8 w-8 mx-auto mb-2" />
              <div className="font-medium">System</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Accessibility className="h-5 w-5" />
            Accessibility Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">High contrast mode</Label>
              <p className="text-sm text-muted-foreground">
                Increases contrast for better readability
              </p>
            </div>
            <Switch />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Reduce motion</Label>
              <p className="text-sm text-muted-foreground">
                Reduces animations and transitions
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}