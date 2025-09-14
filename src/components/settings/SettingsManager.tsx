"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings,
  User,
  Building2
} from 'lucide-react';

export function SettingsManager() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings Manager
          </CardTitle>
          <CardDescription>
            Manage your account and organization settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-5 w-5" />
                <h3 className="font-medium">User Settings</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Manage your personal preferences
              </p>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
            
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-5 w-5" />
                <h3 className="font-medium">Organization Settings</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Manage organization preferences
              </p>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}