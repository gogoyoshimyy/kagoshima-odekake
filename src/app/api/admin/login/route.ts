import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    const body = await request.json()
    const { password } = body

    const correct = process.env.ADMIN_PASSWORD || 'admin123'

    if (password === correct) {
        const response = NextResponse.json({ success: true })
        response.cookies.set('kes_admin_session', 'true', {
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 // 1 day
        })
        return response
    }

    return NextResponse.json({ success: false }, { status: 401 })
}
