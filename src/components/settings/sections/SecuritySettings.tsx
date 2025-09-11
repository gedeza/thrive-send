'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Key, 
  Smartphone, 
  Monitor, 
  AlertTriangle,
  Check,
  X,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Calendar,
  MapPin,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Password change form schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type PasswordFormData = z.infer<typeof passwordSchema>;

// Mock session data - in production this would come from API
interface SessionData {
  id: string;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

const mockSessions: SessionData[] = [
  {
    id: '1',
    device: 'MacBook Pro',
    browser: 'Chrome 120.0',
    location: 'New York, NY',
    ipAddress: '192.168.1.100',
    lastActive: new Date().toISOString(),
    isCurrent: true
  },
  {
    id: '2',
    device: 'iPhone 15',
    browser: 'Safari Mobile',
    location: 'New York, NY',
    ipAddress: '192.168.1.101',
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isCurrent: false
  },
  {
    id: '3',
    device: 'Windows PC',
    browser: 'Edge 119.0',
    location: 'San Francisco, CA',
    ipAddress: '10.0.0.50',
    lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isCurrent: false
  }
];

// Two-factor setup component
function TwoFactorSetup({ enabled, onToggle, disabled }: { 
  enabled: boolean; 
  onToggle: (enabled: boolean) => void; 
  disabled: boolean;
}) {
  const [showQR, setShowQR] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'toggle' | 'setup' | 'verify' | 'backup'>('toggle');

  const handleEnable2FA = () => {
    setStep('setup');
    setShowQR(true);
    // In production, generate QR code and backup codes
    setBackupCodes([
      'ABC123DEF456',
      'GHI789JKL012',
      'MNO345PQR678',
      'STU901VWX234',
      'YZA567BCD890'
    ]);
  };

  const handleVerify = () => {
    if (verificationCode === '123456') { // Mock verification
      setStep('backup');
    } else {
      alert('Invalid verification code. Try 123456 for demo.');
    }
  };

  const handleComplete = () => {
    onToggle(true);
    setStep('toggle');
    setShowQR(false);
  };

  const handleDisable = () => {
    onToggle(false);
    setStep('toggle');
  };

  if (step === 'setup') {
    return (
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Set up Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-xs text-muted-foreground text-center">
                QR Code would appear here<br/>
                (Scan with authenticator app)
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep('toggle')}>
              Cancel
            </Button>
            <Button onClick={() => setStep('verify')}>
              I've Scanned the Code
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'verify') {
    return (
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle>Verify Your Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Enter verification code from your app</Label>
            <Input
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="text-center text-lg tracking-widest"
            />
            <p className="text-xs text-muted-foreground">
              Demo: Enter "123456" to verify
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep('setup')}>
              Back
            </Button>
            <Button onClick={handleVerify}>
              Verify & Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'backup') {
    return (
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            Save Your Backup Codes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Save these backup codes in a secure location. You can use them to access your account if you lose your authenticator device.
            </AlertDescription>
          </Alert>
          
          <div className="bg-muted p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-sm">
              {backupCodes.map((code, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-background rounded">
                  <span>{code}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(code)}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigator.clipboard.writeText(backupCodes.join('\n'))}>
              <Copy className="h-4 w-4 mr-2" />
              Copy All Codes
            </Button>
            <Button onClick={handleComplete}>
              I've Saved the Codes
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label className="text-base">Two-factor authentication</Label>
        <p className="text-sm text-muted-foreground">
          Add an extra layer of security to your account
        </p>
        {enabled && (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <Check className="h-3 w-3 mr-1" />
            Enabled
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2">
        {enabled && (
          <Button variant="outline" size="sm" onClick={handleDisable} disabled={disabled}>
            Disable
          </Button>
        )}
        <Switch
          checked={enabled}
          onCheckedChange={enabled ? handleDisable : handleEnable2FA}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

// Session item component
function SessionItem({ session, onRevoke }: { 
  session: SessionData; 
  onRevoke: (sessionId: string) => void;
}) {
  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes('iphone') || device.toLowerCase().includes('android')) {
      return <Smartphone className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Active now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  return (
    <div className={cn(
      'p-4 border rounded-lg',
      session.isCurrent && 'border-green-200 bg-green-50'
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {getDeviceIcon(session.device)}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{session.device}</span>
              {session.isCurrent && (
                <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                  Current session
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{session.browser}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {session.location}
              </div>
              <div className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {session.ipAddress}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatLastActive(session.lastActive)}
              </div>
            </div>
          </div>
        </div>
        
        {!session.isCurrent && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRevoke(session.id)}
            className="text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4 mr-1" />
            Revoke
          </Button>
        )}
      </div>
    </div>
  );
}

// Main component
export default function SecuritySettings() {
  const { user, isLoaded } = useUser();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions, setSessions] = useState<SessionData[]>(mockSessions);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changePasswordStatus, setChangePasswordStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const { register, handleSubmit, formState: { errors }, reset } = form;

  // Load 2FA status from user metadata
  useEffect(() => {
    if (isLoaded && user) {
      setTwoFactorEnabled(user.publicMetadata?.twoFactorEnabled as boolean || false);
    }
  }, [isLoaded, user]);

  const onSubmitPasswordChange = async (data: PasswordFormData) => {
    setChangePasswordStatus('saving');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In production, call password change API
      console.log('Password change data:', data);
      
      setChangePasswordStatus('success');
      reset();
      
      setTimeout(() => setChangePasswordStatus('idle'), 3000);
    } catch (_error) {
      console.error("", _error);
      setChangePasswordStatus('error');
      setTimeout(() => setChangePasswordStatus('idle'), 5000);
    }
  };

  const handleToggle2FA = async (enabled: boolean) => {
    try {
      if (user) {
        await user.update({
          publicMetadata: {
            ...user.publicMetadata,
            twoFactorEnabled: enabled
          }
        });
        setTwoFactorEnabled(enabled);
      }
    } catch (_error) {
      console.error("", _error);
    }
  };

  const handleRevokeSession = (sessionId: string) => {
    setSessions(sessions.filter(s => s.id !== sessionId));
  };

  const handleRevokeAllSessions = () => {
    setSessions(sessions.filter(s => s.isCurrent));
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading security settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmitPasswordChange)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  {...register('currentPassword')}
                  placeholder="Enter your current password"
                  disabled={changePasswordStatus === 'saving'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.currentPassword && (
                <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    {...register('newPassword')}
                    placeholder="Enter new password"
                    disabled={changePasswordStatus === 'saving'}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-destructive">{errors.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword')}
                    placeholder="Confirm new password"
                    disabled={changePasswordStatus === 'saving'}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2">
                {changePasswordStatus === 'success' && (
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="h-4 w-4" />
                    <span className="text-sm">Password updated successfully</span>
                  </div>
                )}
                {changePasswordStatus === 'error' && (
                  <div className="flex items-center gap-2 text-red-600">
                    <X className="h-4 w-4" />
                    <span className="text-sm">Failed to update password</span>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={changePasswordStatus === 'saving'}
                className="min-w-[140px]"
              >
                {changePasswordStatus === 'saving' ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TwoFactorSetup
            enabled={twoFactorEnabled}
            onToggle={handleToggle2FA}
            disabled={changePasswordStatus === 'saving'}
          />
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Active Sessions
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRevokeAllSessions}
              disabled={sessions.length <= 1}
            >
              Revoke All Other Sessions
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            These are the devices and browsers currently signed into your account.
          </p>
          
          <div className="space-y-3">
            {sessions.map((session) => (
              <SessionItem
                key={session.id}
                session={session}
                onRevoke={handleRevokeSession}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Security Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <div className={cn(
                'w-2 h-2 rounded-full mt-2',
                twoFactorEnabled ? 'bg-green-500' : 'bg-amber-500'
              )} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Two-factor authentication</span>
                  {twoFactorEnabled ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <Check className="h-3 w-3 mr-1" />
                      Enabled
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      Recommended
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {twoFactorEnabled 
                    ? 'Your account is protected with 2FA' 
                    : 'Enable 2FA to add an extra layer of security to your account'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Strong password</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <Check className="h-3 w-3 mr-1" />
                    Good
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your password meets our security requirements
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Recent activity</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <Check className="h-3 w-3 mr-1" />
                    Normal
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  No suspicious activity detected on your account
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}