// Placeholder component - Material-UI dependencies removed for build compatibility
// Use the proper UI tabs component from @/components/ui/tabs instead

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TabsProps {
  defaultValue?: string;
  children: React.ReactNode;
}

export default function CustomTabs({ defaultValue = "tab1", children }: TabsProps) {
  return (
    <Tabs defaultValue={defaultValue} className="w-full">
      {children}
    </Tabs>
  );
}