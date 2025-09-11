'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Save, RefreshCw, X, HelpCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSettings } from '@/contexts/SettingsContext';
import { SettingsNavigation } from './SettingsNavigation';
import { cn } from '@/lib/utils';

// Lazy load setting components for better performance
const UserProfileSettings = React.lazy(() => import('./sections/UserProfileSettings'));
const AccountPreferences = React.lazy(() => import('./sections/AccountPreferences'));
const SecuritySettings = React.lazy(() => import('./sections/SecuritySettings'));
const ThemeAppearanceSettings = React.lazy(() => import('./sections/ThemeAppearanceSettings'));
const OrganizationSettings = React.lazy(() => import('./sections/OrganizationSettings'));
const MemberManagement = React.lazy(() => import('./sections/MemberManagement'));
const IntegrationSettings = React.lazy(() => import('./sections/IntegrationSettings'));
const NotificationSettings = React.lazy(() => import('./sections/NotificationSettings'));
const AISettings = React.lazy(() => import('./sections/AISettings'));
const DataPrivacySettings = React.lazy(() => import('./sections/DataPrivacySettings'));
const BillingSettings = React.lazy(() => import('./sections/BillingSettings'));

// Settings section configuration
interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  component: React.ComponentType;
  permission?: string;
  category: 'account' | 'appearance' | 'organization' | 'integrations' | 'advanced';
}

const SETTINGS_SECTIONS: SettingsSection[] = [
  // Account Category
  {
    id: 'profile',
    title: 'Profile',
    description: 'Manage your personal information and contact details',
    icon: '👤',
    component: UserProfileSettings,
    category: 'account'
  },
  {
    id: 'preferences',
    title: 'Preferences',
    description: 'Configure your notification and privacy preferences',
    icon: '⚙️',
    component: AccountPreferences,
    category: 'account'
  },
  {
    id: 'security',
    title: 'Security',
    description: 'Manage your password, 2FA, and security settings',
    icon: '🔒',
    component: SecuritySettings,
    category: 'account'
  },
  // Appearance Category
  {
    id: 'theme',
    title: 'Theme & Appearance',
    description: 'Customize colors, theme, and accessibility options',
    icon: '🎨',
    component: ThemeAppearanceSettings,
    category: 'appearance'
  },
  // Organization Category
  {
    id: 'organization',
    title: 'Organization',
    description: 'Manage organization settings and branding',
    icon: '🏢',
    component: OrganizationSettings,
    permission: 'manage_organization',
    category: 'organization'
  },
  {
    id: 'members',
    title: 'Members',
    description: 'Invite and manage team members',
    icon: '👥',
    component: MemberManagement,
    permission: 'manage_organization',
    category: 'organization'
  },
  {
    id: 'billing',
    title: 'Billing',
    description: 'Manage subscription and payment methods',
    icon: '💳',
    component: BillingSettings,
    permission: 'manage_organization',
    category: 'organization'
  },
  // Integrations Category
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'Connect social platforms and external services',
    icon: '🔗',
    component: IntegrationSettings,
    permission: 'manage_integrations',
    category: 'integrations'
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Configure email, push, and digest preferences',
    icon: '🔔',
    component: NotificationSettings,
    category: 'integrations'
  },
  {
    id: 'ai',
    title: 'AI & Automation',
    description: 'Configure AI providers and automation settings',
    icon: '🤖',
    component: AISettings,
    permission: 'manage_integrations',
    category: 'integrations'
  },
  // Advanced Category
  {
    id: 'privacy',
    title: 'Privacy & Data',
    description: 'Control your data privacy and export options',
    icon: '🛡️',
    component: DataPrivacySettings,
    category: 'advanced'
  }
];\n\n// Loading component for lazy-loaded sections\nfunction SettingsLoading() {\n  return (\n    <div className=\"flex items-center justify-center h-64\">\n      <div className=\"flex flex-col items-center gap-4\">\n        <RefreshCw className=\"h-8 w-8 animate-spin text-muted-foreground\" />\n        <p className=\"text-sm text-muted-foreground\">Loading settings...</p>\n      </div>\n    </div>\n  );\n}\n\n// Warning dialog for unsaved changes\ninterface UnsavedChangesDialogProps {\n  show: boolean;\n  onSave: () => void;\n  onDiscard: () => void;\n  onCancel: () => void;\n}\n\nfunction UnsavedChangesDialog({ show, onSave, onDiscard, onCancel }: UnsavedChangesDialogProps) {\n  if (!show) return null;\n\n  return (\n    <div className=\"fixed inset-0 bg-black/50 flex items-center justify-center z-50\">\n      <Card className=\"w-full max-w-md mx-4\">\n        <CardContent className=\"p-6\">\n          <div className=\"flex items-start gap-4\">\n            <AlertCircle className=\"h-6 w-6 text-amber-500 mt-0.5\" />\n            <div className=\"flex-1\">\n              <h3 className=\"font-semibold mb-2\">Unsaved Changes</h3>\n              <p className=\"text-sm text-muted-foreground mb-4\">\n                You have unsaved changes that will be lost if you continue. Would you like to save them first?\n              </p>\n              <div className=\"flex gap-2 justify-end\">\n                <Button variant=\"outline\" size=\"sm\" onClick={onCancel}>\n                  Cancel\n                </Button>\n                <Button variant=\"outline\" size=\"sm\" onClick={onDiscard}>\n                  Discard\n                </Button>\n                <Button size=\"sm\" onClick={onSave}>\n                  Save Changes\n                </Button>\n              </div>\n            </div>\n          </div>\n        </CardContent>\n      </Card>\n    </div>\n  );\n}\n\n// Main Settings Manager Component\ninterface SettingsManagerProps {\n  className?: string;\n}\n\nfunction SettingsManagerContent({ className }: SettingsManagerProps) {\n  const router = useRouter();\n  const searchParams = useSearchParams();\n  const { \n    state, \n    setActiveSection, \n    saveUserSettings, \n    saveOrganizationSettings, \n    refreshSettings, \n    resetError,\n    hasPermission \n  } = useSettings();\n  \n  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);\n  const [pendingSection, setPendingSection] = useState<string | null>(null);\n  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);\n\n  // Get current section from URL or default to profile\n  const currentSection = searchParams?.get('section') || state.activeSection;\n  \n  // Filter sections based on permissions\n  const availableSections = SETTINGS_SECTIONS.filter(section => \n    !section.permission || hasPermission(section.permission)\n  );\n  \n  // Find current section config\n  const currentSectionConfig = availableSections.find(s => s.id === currentSection) || availableSections[0];\n  \n  // Update active section when URL changes\n  useEffect(() => {\n    if (currentSection !== state.activeSection) {\n      if (state.hasUnsavedChanges) {\n        setPendingSection(currentSection);\n        setShowUnsavedDialog(true);\n      } else {\n        setActiveSection(currentSection);\n      }\n    }\n  }, [currentSection, state.activeSection, state.hasUnsavedChanges, setActiveSection]);\n\n  // Handle section navigation\n  const handleSectionChange = (sectionId: string) => {\n    if (state.hasUnsavedChanges) {\n      setPendingSection(sectionId);\n      setShowUnsavedDialog(true);\n    } else {\n      router.push(`/settings?section=${sectionId}`);\n      setIsMobileNavOpen(false);\n    }\n  };\n\n  // Handle saving changes\n  const handleSave = async () => {\n    try {\n      if (state.userSettings) {\n        await saveUserSettings();\n      }\n      if (state.organizationSettings) {\n        await saveOrganizationSettings();\n      }\n      \n      // If we have a pending section, navigate to it\n      if (pendingSection) {\n        router.push(`/settings?section=${pendingSection}`);\n        setPendingSection(null);\n      }\n      \n      setShowUnsavedDialog(false);\n    } catch (_error) {\n      console.error("", _error);\n    }\n  };\n\n  // Handle discarding changes\n  const handleDiscard = () => {\n    refreshSettings();\n    \n    if (pendingSection) {\n      router.push(`/settings?section=${pendingSection}`);\n      setPendingSection(null);\n    }\n    \n    setShowUnsavedDialog(false);\n  };\n\n  // Handle canceling navigation\n  const handleCancel = () => {\n    setPendingSection(null);\n    setShowUnsavedDialog(false);\n  };\n\n  // Handle refresh\n  const handleRefresh = () => {\n    refreshSettings();\n  };\n\n  // Handle help\n  const handleHelp = () => {\n    window.open('/help/settings', '_blank');\n  };\n\n  // Render current section component\n  const renderCurrentSection = () => {\n    if (!currentSectionConfig) {\n      return (\n        <div className=\"flex items-center justify-center h-64\">\n          <div className=\"text-center\">\n            <AlertCircle className=\"h-12 w-12 text-muted-foreground mx-auto mb-4\" />\n            <h3 className=\"font-semibold mb-2\">Section Not Found</h3>\n            <p className=\"text-sm text-muted-foreground\">The requested settings section could not be found.</p>\n          </div>\n        </div>\n      );\n    }\n\n    const Component = currentSectionConfig.component;\n    return <Component />;\n  };\n\n  return (\n    <div className={cn(\"min-h-screen bg-background\", className)}>\n      {/* Header */}\n      <div className=\"border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60\">\n        <div className=\"container mx-auto px-4 py-4\">\n          <div className=\"flex items-center justify-between\">\n            <div className=\"flex items-center gap-4\">\n              <div>\n                <h1 className=\"text-2xl font-bold\">Settings</h1>\n                <p className=\"text-sm text-muted-foreground\">\n                  Manage your account and organization preferences\n                </p>\n              </div>\n            </div>\n            \n            <div className=\"flex items-center gap-2\">\n              <Button\n                variant=\"outline\"\n                size=\"sm\"\n                onClick={handleHelp}\n                className=\"hidden sm:flex\"\n              >\n                <HelpCircle className=\"h-4 w-4 mr-2\" />\n                Help\n              </Button>\n              \n              <Button\n                variant=\"outline\"\n                size=\"sm\"\n                onClick={handleRefresh}\n                disabled={state.loading}\n              >\n                <RefreshCw className={cn(\"h-4 w-4 mr-2\", state.loading && \"animate-spin\")} />\n                Refresh\n              </Button>\n              \n              {state.hasUnsavedChanges && (\n                <Button\n                  size=\"sm\"\n                  onClick={handleSave}\n                  disabled={state.saving}\n                >\n                  <Save className=\"h-4 w-4 mr-2\" />\n                  {state.saving ? 'Saving...' : 'Save Changes'}\n                </Button>\n              )}\n            </div>\n          </div>\n        </div>\n      </div>\n\n      {/* Error Alert */}\n      {state.error && (\n        <div className=\"container mx-auto px-4 py-4\">\n          <Alert variant=\"destructive\">\n            <AlertCircle className=\"h-4 w-4\" />\n            <AlertDescription className=\"flex items-center justify-between\">\n              {state.error}\n              <Button\n                variant=\"ghost\"\n                size=\"sm\"\n                onClick={resetError}\n                className=\"h-6 w-6 p-0\"\n              >\n                <X className=\"h-4 w-4\" />\n              </Button>\n            </AlertDescription>\n          </Alert>\n        </div>\n      )}\n\n      {/* Main Content */}\n      <div className=\"container mx-auto px-4 py-6\">\n        <div className=\"flex flex-col lg:flex-row gap-6\">\n          {/* Navigation Sidebar */}\n          <div className=\"lg:w-64 flex-shrink-0\">\n            <SettingsNavigation\n              sections={availableSections}\n              activeSection={currentSection}\n              onSectionChange={handleSectionChange}\n              isOpen={isMobileNavOpen}\n              onToggle={setIsMobileNavOpen}\n            />\n          </div>\n\n          {/* Main Content Area */}\n          <div className=\"flex-1 min-w-0\">\n            <Card>\n              <CardContent className=\"p-6\">\n                {/* Section Header */}\n                <div className=\"mb-6\">\n                  <div className=\"flex items-center gap-3 mb-2\">\n                    <span className=\"text-2xl\">{currentSectionConfig?.icon}</span>\n                    <h2 className=\"text-xl font-semibold\">{currentSectionConfig?.title}</h2>\n                  </div>\n                  <p className=\"text-sm text-muted-foreground\">\n                    {currentSectionConfig?.description}\n                  </p>\n                </div>\n\n                {/* Section Content */}\n                <Suspense fallback={<SettingsLoading />}>\n                  {renderCurrentSection()}\n                </Suspense>\n              </CardContent>\n            </Card>\n          </div>\n        </div>\n      </div>\n\n      {/* Unsaved Changes Dialog */}\n      <UnsavedChangesDialog\n        show={showUnsavedDialog}\n        onSave={handleSave}\n        onDiscard={handleDiscard}\n        onCancel={handleCancel}\n      />\n    </div>\n  );\n}\n\n// Wrapper component to handle suspense boundary\nexport function SettingsManager(props: SettingsManagerProps) {\n  return (\n    <Suspense fallback={<SettingsLoading />}>\n      <SettingsManagerContent {...props} />\n    </Suspense>\n  );\n}