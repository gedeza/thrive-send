'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Menu, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';

// Category configuration for grouping navigation items
const CATEGORY_CONFIG = {
  account: {
    title: '👤 Account',
    description: 'Personal settings'
  },
  appearance: {
    title: '🎨 Appearance',
    description: 'Theme and display'
  },
  organization: {
    title: '🏢 Organization',
    description: 'Team and company'
  },
  integrations: {
    title: '🔗 Integrations',
    description: 'Apps and services'
  },
  advanced: {
    title: '⚙️ Advanced',
    description: 'Privacy and data'
  }
};

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: keyof typeof CATEGORY_CONFIG;
  permission?: string;
}

interface SettingsNavigationProps {
  sections: SettingsSection[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
}

interface NavigationItemProps {
  section: SettingsSection;
  isActive: boolean;
  onClick: () => void;
  isMobile?: boolean;
}

function NavigationItem({ section, isActive, onClick, isMobile = false }: NavigationItemProps) {
  const { state } = useSettings();
  
  // Show unsaved changes indicator
  const hasUnsavedChanges = state.hasUnsavedChanges && isActive;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200',
        'hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        isActive
          ? 'bg-primary/10 text-primary border border-primary/20'
          : 'text-muted-foreground hover:text-foreground',
        isMobile && 'py-3'
      )}
    >
      <span className="text-lg flex-shrink-0">{section.icon}</span>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            'font-medium truncate',
            isMobile && 'text-base'
          )}>
            {section.title}
          </span>
          
          {hasUnsavedChanges && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
              •
            </Badge>
          )}
        </div>
        
        {!isMobile && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {section.description}
          </p>
        )}
      </div>
      
      {isMobile && (
        <ChevronRight className="h-4 w-4 flex-shrink-0" />
      )}
    </button>
  );
}

interface CategorySectionProps {
  category: keyof typeof CATEGORY_CONFIG;
  sections: SettingsSection[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
  isMobile?: boolean;
}

function CategorySection({ 
  category, 
  sections, 
  activeSection, 
  onSectionChange, 
  isMobile = false 
}: CategorySectionProps) {
  const categoryConfig = CATEGORY_CONFIG[category];
  const categorySections = sections.filter(s => s.category === category);
  
  if (categorySections.length === 0) return null;
  
  return (
    <div className="space-y-2">
      {/* Category Header */}
      <div className={cn(
        'px-3 py-2',
        isMobile && 'border-b border-muted/50 py-3'
      )}>
        <h3 className={cn(
          'text-sm font-semibold text-foreground flex items-center gap-2',
          isMobile && 'text-base'
        )}>
          {categoryConfig.title}
        </h3>
        {!isMobile && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {categoryConfig.description}
          </p>
        )}
      </div>
      
      {/* Category Items */}
      <div className="space-y-1">
        {categorySections.map((section) => (
          <NavigationItem
            key={section.id}
            section={section}
            isActive={activeSection === section.id}
            onClick={() => onSectionChange(section.id)}
            isMobile={isMobile}
          />
        ))}
      </div>
    </div>
  );
}

export function SettingsNavigation({
  sections,
  activeSection,
  onSectionChange,
  isOpen,
  onToggle
}: SettingsNavigationProps) {
  const { state } = useSettings();
  
  // Group sections by category
  const categories = Object.keys(CATEGORY_CONFIG) as (keyof typeof CATEGORY_CONFIG)[];
  
  // Mobile Navigation Overlay
  const MobileNavigation = () => (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => onToggle(false)}
        />
      )}
      
      {/* Mobile Navigation Panel */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-80 bg-background border-r shadow-xl transform transition-transform duration-300 lg:hidden',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Settings</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggle(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Mobile Navigation Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-6">
              {categories.map((category) => (
                <CategorySection
                  key={category}
                  category={category}
                  sections={sections}
                  activeSection={activeSection}
                  onSectionChange={(sectionId) => {
                    onSectionChange(sectionId);
                    onToggle(false);
                  }}
                  isMobile
                />
              ))}
            </div>
          </div>
          
          {/* Mobile Footer */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {state.hasUnsavedChanges && (
                <>
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  <span>Unsaved changes</span>
                </>
              )}
              {state.saving && (
                <>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span>Saving...</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
  
  // Desktop Navigation
  const DesktopNavigation = () => (
    <Card className="hidden lg:block sticky top-4">
      <CardContent className="p-4">
        <div className="space-y-6">
          {/* Desktop Header */}
          <div className="border-b pb-4">
            <h2 className="font-semibold text-foreground mb-1">Settings</h2>
            <p className="text-xs text-muted-foreground">
              Configure your preferences
            </p>
            
            {/* Status Indicators */}
            <div className="flex items-center gap-4 mt-3">
              {state.hasUnsavedChanges && (
                <div className="flex items-center gap-1.5 text-xs text-amber-600">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                  Unsaved changes
                </div>
              )}
              {state.saving && (
                <div className="flex items-center gap-1.5 text-xs text-blue-600">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                  Saving...
                </div>
              )}
              {state.loading && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-pulse" />
                  Loading...
                </div>
              )}
            </div>
          </div>
          
          {/* Desktop Categories */}
          {categories.map((category) => (
            <CategorySection
              key={category}
              category={category}
              sections={sections}
              activeSection={activeSection}
              onSectionChange={onSectionChange}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
  
  // Mobile Toggle Button
  const MobileToggleButton = () => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onToggle(true)}
      className="lg:hidden mb-4"
    >
      <Menu className="h-4 w-4 mr-2" />
      Settings Menu
    </Button>
  );
  
  return (
    <>
      <MobileToggleButton />
      <DesktopNavigation />
      <MobileNavigation />
    </>
  );
}