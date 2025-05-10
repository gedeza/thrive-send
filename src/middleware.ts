import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware({
  publicRoutes: [
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/webhook(.*)',
    '/api/public(.*)'
  ],
});

export const config = {
  matcher: [
    // Apply to all pages except static files and API routes
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.\\w+$).*)',
    '/',
    '/(api|trpc)(.*)'
  ],
};
