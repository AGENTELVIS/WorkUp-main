import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';


const isProtectedRoute = createRouteMatcher([
  '/home/post-jobs(.*)',
  '/home/applied-jobs(.*)',
  '/home/my-jobs(.*)',
  '/home/job-page/[id]/apply(.*)',  // if you separate apply route
  '/home/saved-jobs(.*)'
]);
const isPublicRoute = createRouteMatcher(['/sign-up(.*)','/sign-in(.*)'])

export default clerkMiddleware(async(auth,req)=>{
  if(isProtectedRoute(req)) await auth.protect()
  

});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};