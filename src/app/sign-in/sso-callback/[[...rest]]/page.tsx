'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useClerk } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';

export default function SSOCallbackPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { handleRedirectCallback } = useClerk();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const handleCallback = async () => {
      try {
        // Handle the SSO callback
        await handleRedirectCallback();
        
        // Redirect based on authentication state
        if (isSignedIn) {
          // User is signed in, redirect to dashboard
          router.push('/dashboard');
        } else {
          // If somehow not signed in, redirect to sign-in
          router.push('/sign-in');
        }
      } catch (error) {
        console.error('SSO callback error:', error);
        // On error, redirect to sign-in with error parameter
        router.push('/sign-in?error=sso_callback_failed');
      }
    };

    handleCallback();
  }, [isLoaded, isSignedIn, handleRedirectCallback, router]);

  // Show loading state while processing
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <h2 className="text-xl font-semibold">Completing sign-in...</h2>
        <p className="text-muted-foreground">
          Please wait while we complete your authentication.
        </p>
      </div>
    </div>
  );
}