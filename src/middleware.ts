import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (request.nextUrl.pathname === '/admin') return NextResponse.next()

        // Check cookie
        const session = request.cookies.get('kes_admin_session')
        if (!session) {
            return NextResponse.redirect(new URL('/admin', request.url))
        }
    }
    return NextResponse.next()
}

export const config = {
    matcher: '/admin/:path*',
}
