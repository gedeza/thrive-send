'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from '@/components/ui/use-toast'
import { useBeforeUnload } from '@/hooks/use-before-unload'
import { useNavigationWarning } from '@/hooks/use-navigation-warning'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Save, AlertTriangle, Shield } from 'lucide-react'

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Settings Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                An error occurred while loading the settings. Please refresh the page or try again later.
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                className="text-custom-white"
              >
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Schemas for different settings sections
const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  timezone: z.string().min(1, 'Timezone is required'),
  language: z.string().min(1, 'Language is required'),
})

const emailSchema = z.object({
  marketingEmails: z.boolean(),
  productUpdates: z.boolean(),
  weeklyDigest: z.boolean(),
  campaignNotifications: z.boolean(),
  collaborationAlerts: z.boolean(),
})

const campaignDefaultsSchema = z.object({
  defaultTimezone: z.string(),
  defaultSendTime: z.string(),
  defaultFromName: z.string().min(1, 'From name is required'),
  defaultFromEmail: z.string().email('Invalid email address'),
  autoSaveInterval: z.number().min(1).max(60),
  enableAutoScheduling: z.boolean(),
})

const contentLibrarySchema = z.object({
  autoTagging: z.boolean(),
  contentApprovalRequired: z.boolean(),
  defaultContentType: z.string(),
  maxFileSize: z.number().min(1).max(100),
  allowedFileTypes: z.array(z.string()),
  enableVersionControl: z.boolean(),
})

const securitySchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  enableTwoFactor: z.boolean(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// Types
type ProfileFormData = z.infer<typeof profileSchema>
type EmailFormData = z.infer<typeof emailSchema>
type CampaignDefaultsFormData = z.infer<typeof campaignDefaultsSchema>
type ContentLibraryFormData = z.infer<typeof contentLibrarySchema>
type SecurityFormData = z.infer<typeof securitySchema>

interface SettingsManagerProps {
  defaultTab?: string
  onSettingsChange?: (section: string, data: any) => void
  className?: string
}

interface LoadingState {
  profile: boolean
  email: boolean
  campaign: boolean
  content: boolean
  security: boolean
  global: boolean
}

interface ErrorState {
  profile: string | null
  email: string | null
  campaign: string | null
  content: string | null
  security: string | null
  global: string | null
}

// API functions
const saveProfileSettings = async (data: ProfileFormData): Promise<void> => {
  const response = await fetch('/api/settings/profile', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to save profile settings')
  }
}

const saveEmailSettings = async (data: EmailFormData): Promise<void> => {
  const response = await fetch('/api/settings/email', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to save email settings')
  }
}

const saveCampaignSettings = async (data: CampaignDefaultsFormData): Promise<void> => {
  const response = await fetch('/api/settings/campaign-defaults', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to save campaign settings')
  }
}

const saveContentSettings = async (data: ContentLibraryFormData): Promise<void> => {
  const response = await fetch('/api/settings/content-library', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to save content settings')
  }
}

const saveSecuritySettings = async (data: SecurityFormData): Promise<void> => {
  const response = await fetch('/api/settings/security', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to save security settings')
  }
}

// Data fetching functions
const fetchProfileSettings = async (): Promise<ProfileFormData> => {
  const response = await fetch('/api/settings/profile')
  if (!response.ok) {
    throw new Error('Failed to fetch profile settings')
  }
  return response.json()
}

const fetchEmailSettings = async (): Promise<EmailFormData> => {
  const response = await fetch('/api/settings/email')
  if (!response.ok) {
    throw new Error('Failed to fetch email settings')
  }
  return response.json()
}

const fetchCampaignSettings = async (): Promise<CampaignDefaultsFormData> => {
  const response = await fetch('/api/settings/campaign-defaults')
  if (!response.ok) {
    throw new Error('Failed to fetch campaign settings')
  }
  return response.json()
}

const fetchContentSettings = async (): Promise<ContentLibraryFormData> => {
  const response = await fetch('/api/settings/content-library')
  if (!response.ok) {
    throw new Error('Failed to fetch content settings')
  }
  return response.json()
}

export function SettingsManager({ 
  defaultTab = 'profile', 
  onSettingsChange,
  className = '' 
}: SettingsManagerProps) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  
  // State management
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [loading, setLoading] = useState<LoadingState>({
    profile: false,
    email: false,
    campaign: false,
    content: false,
    security: false,
    global: false
  })
  const [errors, setErrors] = useState<ErrorState>({
    profile: null,
    email: null,
    campaign: null,
    content: null,
    security: null,
    global: null
  })

  // Form instances
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.emailAddresses?.[0]?.emailAddress || '',
      bio: '',
      timezone: 'UTC',
      language: 'en',
    }
  })

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      marketingEmails: true,
      productUpdates: true,
      weeklyDigest: false,
      campaignNotifications: true,
      collaborationAlerts: true,
    }
  })

  const campaignForm = useForm<CampaignDefaultsFormData>({
    resolver: zodResolver(campaignDefaultsSchema),
    defaultValues: {
      defaultTimezone: 'UTC',
      defaultSendTime: '09:00',
      defaultFromName: '',
      defaultFromEmail: '',
      autoSaveInterval: 5,
      enableAutoScheduling: false,
    }
  })

  const contentForm = useForm<ContentLibraryFormData>({
    resolver: zodResolver(contentLibrarySchema),
    defaultValues: {
      autoTagging: true,
      contentApprovalRequired: false,
      defaultContentType: 'post',
      maxFileSize: 10,
      allowedFileTypes: ['jpg', 'png', 'gif', 'mp4'],
      enableVersionControl: true,
    }
  })

  const securityForm = useForm<SecurityFormData>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      enableTwoFactor: false,
    }
  })

  // Track overall dirty state
  const isDirty = useMemo(() => {
    return [
      profileForm.formState.isDirty,
      emailForm.formState.isDirty,
      campaignForm.formState.isDirty,
      contentForm.formState.isDirty,
      securityForm.formState.isDirty
    ].some(Boolean)
  }, [
    profileForm.formState.isDirty,
    emailForm.formState.isDirty,
    campaignForm.formState.isDirty,
    contentForm.formState.isDirty,
    securityForm.formState.isDirty
  ])

  // Navigation warning for unsaved changes
  useBeforeUnload(isDirty)
  useNavigationWarning(isDirty)

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      if (!isLoaded || !user) return

      setLoading(prev => ({ ...prev, global: true }))
      
      try {
        // Load all settings in parallel
        const [profileData, emailData, campaignData, contentData] = await Promise.all([
          fetchProfileSettings().catch(() => null),
          fetchEmailSettings().catch(() => null),
          fetchCampaignSettings().catch(() => null),
          fetchContentSettings().catch(() => null),
        ])

        // Reset forms with fetched data
        if (profileData) {
          profileForm.reset(profileData)
        }
        if (emailData) {
          emailForm.reset(emailData)
        }
        if (campaignData) {
          campaignForm.reset(campaignData)
        }
        if (contentData) {
          contentForm.reset(contentData)
        }
      } catch (error) {
        console.error('Error loading initial settings:', error)
        handleError('global', 'Failed to load settings')
      } finally {
        setLoading(prev => ({ ...prev, global: false }))
      }
    }

    loadInitialData()
  }, [isLoaded, user, profileForm, emailForm, campaignForm, contentForm, handleError])

  // Error handling utility
  const handleError = useCallback((section: keyof ErrorState, error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    setErrors(prev => ({ ...prev, [section]: errorMessage }))
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive',
    })
  }, [])

  // Clear error utility
  const clearError = useCallback((section: keyof ErrorState) => {
    setErrors(prev => ({ ...prev, [section]: null }))
  }, [])

  // Submit handlers
  const handleProfileSubmit = useCallback(async (data: ProfileFormData) => {
    setLoading(prev => ({ ...prev, profile: true }))
    clearError('profile')
    
    try {
      await saveProfileSettings(data)
      
      // Update Clerk user data
      if (user) {
        await user.update({
          firstName: data.firstName,
          lastName: data.lastName,
        })
      }
      
      profileForm.reset(data)
      onSettingsChange?.('profile', data)
      
      toast({
        title: 'Success',
        description: 'Profile settings saved successfully',
      })
    } catch (error) {
      handleError('profile', error)
    } finally {
      setLoading(prev => ({ ...prev, profile: false }))
    }
  }, [user, profileForm, onSettingsChange, handleError, clearError])

  const handleEmailSubmit = useCallback(async (data: EmailFormData) => {
    setLoading(prev => ({ ...prev, email: true }))
    clearError('email')
    
    try {
      await saveEmailSettings(data)
      emailForm.reset(data)
      onSettingsChange?.('email', data)
      
      toast({
        title: 'Success',
        description: 'Email preferences saved successfully',
      })
    } catch (error) {
      handleError('email', error)
    } finally {
      setLoading(prev => ({ ...prev, email: false }))
    }
  }, [emailForm, onSettingsChange, handleError, clearError])

  const handleCampaignSubmit = useCallback(async (data: CampaignDefaultsFormData) => {
    setLoading(prev => ({ ...prev, campaign: true }))
    clearError('campaign')
    
    try {
      await saveCampaignSettings(data)
      campaignForm.reset(data)
      onSettingsChange?.('campaign', data)
      
      toast({
        title: 'Success',
        description: 'Campaign defaults saved successfully',
      })
    } catch (error) {
      handleError('campaign', error)
    } finally {
      setLoading(prev => ({ ...prev, campaign: false }))
    }
  }, [campaignForm, onSettingsChange, handleError, clearError])

  const handleContentSubmit = useCallback(async (data: ContentLibraryFormData) => {
    setLoading(prev => ({ ...prev, content: true }))
    clearError('content')
    
    try {
      await saveContentSettings(data)
      contentForm.reset(data)
      onSettingsChange?.('content', data)
      
      toast({
        title: 'Success',
        description: 'Content library settings saved successfully',
      })
    } catch (error) {
      handleError('content', error)
    } finally {
      setLoading(prev => ({ ...prev, content: false }))
    }
  }, [contentForm, onSettingsChange, handleError, clearError])

  const handleSecuritySubmit = useCallback(async (data: SecurityFormData) => {
    setLoading(prev => ({ ...prev, security: true }))
    clearError('security')
    
    try {
      await saveSecuritySettings(data)
      securityForm.reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        enableTwoFactor: data.enableTwoFactor,
      })
      onSettingsChange?.('security', data)
      
      toast({
        title: 'Success',
        description: 'Security settings updated successfully',
      })
    } catch (error) {
      handleError('security', error)
    } finally {
      setLoading(prev => ({ ...prev, security: false }))
    }
  }, [securityForm, onSettingsChange, handleError, clearError])

  // Memoized components for performance
  const ProfileSettings = useMemo(() => (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update your personal information and preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                {...profileForm.register('firstName')}
                error={profileForm.formState.errors.firstName?.message}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                {...profileForm.register('lastName')}
                error={profileForm.formState.errors.lastName?.message}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              {...profileForm.register('email')}
              error={profileForm.formState.errors.email?.message}
            />
          </div>
          
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              {...profileForm.register('bio')}
              placeholder="Tell us about yourself..."
              error={profileForm.formState.errors.bio?.message}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={profileForm.watch('timezone')}
                onValueChange={(value) => profileForm.setValue('timezone', value, { shouldDirty: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="language">Language</Label>
              <Select
                value={profileForm.watch('language')}
                onValueChange={(value) => profileForm.setValue('language', value, { shouldDirty: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {errors.profile && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertTriangle className="h-4 w-4" />
              {errors.profile}
            </div>
          )}
          
          <Button 
            type="submit" 
            disabled={loading.profile || !profileForm.formState.isDirty}
            className="text-custom-white"
          >
            {loading.profile ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Profile
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  ), [profileForm, handleProfileSubmit, loading.profile, errors.profile])

  const EmailSettings = useMemo(() => (
    <Card>
      <CardHeader>
        <CardTitle>Email Preferences</CardTitle>
        <CardDescription>
          Manage your email notification preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="marketingEmails">Marketing Emails</Label>
                <p className="text-sm text-gray-500">Receive updates about new features and promotions</p>
              </div>
              <Switch
                id="marketingEmails"
                checked={emailForm.watch('marketingEmails')}
                onCheckedChange={(checked) => emailForm.setValue('marketingEmails', checked, { shouldDirty: true })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="productUpdates">Product Updates</Label>
                <p className="text-sm text-gray-500">Get notified about product updates and releases</p>
              </div>
              <Switch
                id="productUpdates"
                checked={emailForm.watch('productUpdates')}
                onCheckedChange={(checked) => emailForm.setValue('productUpdates', checked, { shouldDirty: true })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="weeklyDigest">Weekly Digest</Label>
                <p className="text-sm text-gray-500">Receive a weekly summary of your activity</p>
              </div>
              <Switch
                id="weeklyDigest"
                checked={emailForm.watch('weeklyDigest')}
                onCheckedChange={(checked) => emailForm.setValue('weeklyDigest', checked, { shouldDirty: true })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="campaignNotifications">Campaign Notifications</Label>
                <p className="text-sm text-gray-500">Get notified about campaign status changes</p>
              </div>
              <Switch
                id="campaignNotifications"
                checked={emailForm.watch('campaignNotifications')}
                onCheckedChange={(checked) => emailForm.setValue('campaignNotifications', checked, { shouldDirty: true })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="collaborationAlerts">Collaboration Alerts</Label>
                <p className="text-sm text-gray-500">Receive notifications when team members mention you</p>
              </div>
              <Switch
                id="collaborationAlerts"
                checked={emailForm.watch('collaborationAlerts')}
                onCheckedChange={(checked) => emailForm.setValue('collaborationAlerts', checked, { shouldDirty: true })}
              />
            </div>
          </div>
          
          {errors.email && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertTriangle className="h-4 w-4" />
              {errors.email}
            </div>
          )}
          
          <Button 
            type="submit" 
            disabled={loading.email || !emailForm.formState.isDirty}
            className="text-custom-white"
          >
            {loading.email ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Preferences
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  ), [emailForm, handleEmailSubmit, loading.email, errors.email])

  const CampaignSettings = useMemo(() => (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Defaults</CardTitle>
        <CardDescription>
          Set default values for new campaigns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={campaignForm.handleSubmit(handleCampaignSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="defaultTimezone">Default Timezone</Label>
              <Select
                value={campaignForm.watch('defaultTimezone')}
                onValueChange={(value) => campaignForm.setValue('defaultTimezone', value, { shouldDirty: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="defaultSendTime">Default Send Time</Label>
              <Input
                id="defaultSendTime"
                type="time"
                {...campaignForm.register('defaultSendTime')}
                error={campaignForm.formState.errors.defaultSendTime?.message}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="defaultFromName">Default From Name</Label>
              <Input
                id="defaultFromName"
                {...campaignForm.register('defaultFromName')}
                placeholder="Your Company Name"
                error={campaignForm.formState.errors.defaultFromName?.message}
              />
            </div>
            
            <div>
              <Label htmlFor="defaultFromEmail">Default From Email</Label>
              <Input
                id="defaultFromEmail"
                type="email"
                {...campaignForm.register('defaultFromEmail')}
                placeholder="noreply@yourcompany.com"
                error={campaignForm.formState.errors.defaultFromEmail?.message}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="autoSaveInterval">Auto-save Interval (minutes)</Label>
            <Input
              id="autoSaveInterval"
              type="number"
              min="1"
              max="60"
              {...campaignForm.register('autoSaveInterval', { valueAsNumber: true })}
              error={campaignForm.formState.errors.autoSaveInterval?.message}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enableAutoScheduling">Enable Auto-scheduling</Label>
              <p className="text-sm text-gray-500">Automatically schedule campaigns based on optimal send times</p>
            </div>
            <Switch
              id="enableAutoScheduling"
              checked={campaignForm.watch('enableAutoScheduling')}
              onCheckedChange={(checked) => campaignForm.setValue('enableAutoScheduling', checked, { shouldDirty: true })}
            />
          </div>
          
          {errors.campaign && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertTriangle className="h-4 w-4" />
              {errors.campaign}
            </div>
          )}
          
          <Button 
            type="submit" 
            disabled={loading.campaign || !campaignForm.formState.isDirty}
            className="text-custom-white"
          >
            {loading.campaign ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Defaults
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  ), [campaignForm, handleCampaignSubmit, loading.campaign, errors.campaign])

  const ContentSettings = useMemo(() => (
    <Card>
      <CardHeader>
        <CardTitle>Content Library</CardTitle>
        <CardDescription>
          Configure content management settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={contentForm.handleSubmit(handleContentSubmit)} className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoTagging">Auto-tagging</Label>
                <p className="text-sm text-gray-500">Automatically tag content based on AI analysis</p>
              </div>
              <Switch
                id="autoTagging"
                checked={contentForm.watch('autoTagging')}
                onCheckedChange={(checked) => contentForm.setValue('autoTagging', checked, { shouldDirty: true })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="contentApprovalRequired">Content Approval Required</Label>
                <p className="text-sm text-gray-500">Require approval before content can be published</p>
              </div>
              <Switch
                id="contentApprovalRequired"
                checked={contentForm.watch('contentApprovalRequired')}
                onCheckedChange={(checked) => contentForm.setValue('contentApprovalRequired', checked, { shouldDirty: true })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableVersionControl">Enable Version Control</Label>
                <p className="text-sm text-gray-500">Keep track of content changes and revisions</p>
              </div>
              <Switch
                id="enableVersionControl"
                checked={contentForm.watch('enableVersionControl')}
                onCheckedChange={(checked) => contentForm.setValue('enableVersionControl', checked, { shouldDirty: true })}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="defaultContentType">Default Content Type</Label>
              <Select
                value={contentForm.watch('defaultContentType')}
                onValueChange={(value) => contentForm.setValue('defaultContentType', value, { shouldDirty: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="post">Social Media Post</SelectItem>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
              <Input
                id="maxFileSize"
                type="number"
                min="1"
                max="100"
                {...contentForm.register('maxFileSize', { valueAsNumber: true })}
                error={contentForm.formState.errors.maxFileSize?.message}
              />
            </div>
          </div>
          
          {errors.content && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertTriangle className="h-4 w-4" />
              {errors.content}
            </div>
          )}
          
          <Button 
            type="submit" 
            disabled={loading.content || !contentForm.formState.isDirty}
            className="text-custom-white"
          >
            {loading.content ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  ), [contentForm, handleContentSubmit, loading.content, errors.content])

  const SecuritySettings = useMemo(() => (
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>
          Manage your account security and password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={securityForm.handleSubmit(handleSecuritySubmit)} className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              {...securityForm.register('currentPassword')}
              error={securityForm.formState.errors.currentPassword?.message}
            />
          </div>
          
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              {...securityForm.register('newPassword')}
              error={securityForm.formState.errors.newPassword?.message}
            />
          </div>
          
          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...securityForm.register('confirmPassword')}
              error={securityForm.formState.errors.confirmPassword?.message}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enableTwoFactor" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Two-Factor Authentication
              </Label>
              <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
            </div>
            <Switch
              id="enableTwoFactor"
              checked={securityForm.watch('enableTwoFactor')}
              onCheckedChange={(checked) => securityForm.setValue('enableTwoFactor', checked, { shouldDirty: true })}
            />
          </div>
          
          {errors.security && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertTriangle className="h-4 w-4" />
              {errors.security}
            </div>
          )}
          
          <Button 
            type="submit" 
            disabled={loading.security || !securityForm.formState.isDirty}
            className="text-custom-white"
          >
            {loading.security ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Security
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  ), [securityForm, handleSecuritySubmit, loading.security, errors.security])

  // Loading state
  if (!isLoaded || loading.global) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className={`space-y-6 ${className}`}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="campaign">Campaign</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-4">
            {ProfileSettings}
          </TabsContent>
          
          <TabsContent value="email" className="space-y-4">
            {EmailSettings}
          </TabsContent>
          
          <TabsContent value="campaign" className="space-y-4">
            {CampaignSettings}
          </TabsContent>
          
          <TabsContent value="content" className="space-y-4">
            {ContentSettings}
          </TabsContent>
          
          <TabsContent value="security" className="space-y-4">
            {SecuritySettings}
          </TabsContent>
        </Tabs>
        
        {isDirty && (
          <div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">You have unsaved changes</span>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}

export default SettingsManager