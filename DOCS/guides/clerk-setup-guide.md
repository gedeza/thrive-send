# Clerk Authentication Setup Guide

This guide will help you set up Clerk authentication for your ThriveSend application.

## 1. Create a Clerk Account

1. Go to [clerk.com](https://clerk.com/) and sign up for an account
2. Create a new application from the Clerk dashboard
3. Choose "Next.js" as your framework

## 2. Get Your API Keys

1. In your Clerk dashboard, navigate to "API Keys"
2. Copy your "Publishable Key" that starts with `pk_test_` or `pk_live_`
3. Copy your "Secret Key" that starts with `sk_test_` or `sk_live_`

## 3. Configure Your Environment Variables

Create or update your `.env.local` file with the following variables:

```ini
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-actual-publishable-key
CLERK_SECRET_KEY=sk_test_your-actual-secret-key

# Clerk Route Configuration
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

## 4. Configure Middleware

Make sure your middleware.ts file is properly configured:

```typescript
import { clerkMiddleware } from '@clerk/nextjs/server';
 
export default clerkMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/webhook(.*)',
    '/api/public(.*)'
  ]
});
 
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

## 5. Restart Your Development Server

After making these changes, restart your development server:

```bash
pnpm dev
```

## 6. Testing Authentication

1. Visit your application at http://localhost:3000
2. Click "Sign Up" to create a test account
3. Verify the authentication flow works correctly

## 7. Customizing Authentication UI

Clerk provides various ways to customize the authentication UI:

- Use Clerk components with custom CSS
- Use the Clerk SDK to build custom authentication forms
- Use Clerk's appearance API to change the look and feel

For more details, refer to [Clerk's documentation](https://clerk.com/docs).