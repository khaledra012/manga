import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // صفحة تسجيل الدخول لا تحتاج حماية
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // تحقق من وجود الـ Admin Key في الكوكيز
  const adminKey = request.cookies.get('admin_key')?.value;

  if (!adminKey) {
    const loginUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
