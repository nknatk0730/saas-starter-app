import { clerkClient, clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const publicRoutes = ['/', '/api/webhook/register', '/signup', '/signin'];

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();

  if (!publicRoutes && !userId) {
    return NextResponse.redirect(new URL('/signin', request.nextUrl));
  }
  const client = await clerkClient();

  if (userId) {
    try {
      const user = await client.users.getUser(userId);
      const role = user.publicMetadata.role as string | undefined;
  
      // admin role redirection
      if (role === 'admin' && request.nextUrl.pathname === '/dashboard') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.nextUrl));
      }
  
      // prevent non admin user to access the admin routes
  
      if (role !== 'admin' && request.nextUrl.pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
      }
  
      // redirect auth user trying to access public routes
      if (publicRoutes.includes(request.nextUrl.pathname)) {
        return NextResponse.redirect(
          new URL(
            role === "admin" ? "/admin/dashboard" : "/dashboard",
            request.nextUrl
          ),
        );
      }
    } catch (error) {
      console.error(error);
      return NextResponse.redirect(new URL("/error", request.nextUrl));
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}