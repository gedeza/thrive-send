import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)", 
  "/api/webhook(.*)",
  "/api/public(.*)"
]);

// TEMPORARY: Development bypass for service-provider API and page testing
// TODO: Remove this in production - only for testing live data integration
const isDevServiceProviderAPI = createRouteMatcher([
  "/api/service-provider(.*)",
  "/service-provider(.*)",
  "/api/approvals(.*)",
  "/api/dashboard(.*)"
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req) && !isDevServiceProviderAPI(req)) {
    await auth.protect();
  }
});

// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
