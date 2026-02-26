import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')

  // Se tentar acessar dashboard sem token, redirecionar para login
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Se estiver logado e tentar acessar login ou cadastro, redirecionar para dashboard
  if (request.nextUrl.pathname === '/cadastro' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // Se estiver logado e tentar acessar página de login (?login=true), redirecionar para dashboard
  if (request.nextUrl.pathname === '/' && token && request.nextUrl.searchParams.get('login') === 'true') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/', '/cadastro'],
}
