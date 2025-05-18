import { authMiddleware } from "@clerk/nextjs";

export const authOptions = {
  publicRoutes: [
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/webhook(.*)",
    "/api/public(.*)"
  ]
};

export default authMiddleware(authOptions);

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}; 