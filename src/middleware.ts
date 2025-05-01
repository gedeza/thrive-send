// This is a sample update for middleware.ts if it exists
// Make sure any redirects point to the correct dashboard path

import { authMiddleware } from "@clerk/nextjs";
 
export default authMiddleware({
  // Make sure the publicRoutes array includes all your public routes
  publicRoutes: ["/", "/api/.*", "/about", "/pricing"],
  
  // Update this if needed to point to the correct dashboard
  afterAuth(auth, req) {
    if (auth.userId && req.url === "/") {
      return Response.redirect(new URL("/dashboard", req.url));
    }
  }
});
 
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};