import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { eventId, action, anonId } = body

        if (!eventId || !action) {
            return NextResponse.json({ error: 'Missing Required Fields' }, { status: 400 })
        }

        const log = await prisma.swipeLog.create({
            data: {
                eventId,
                action,
                anonId
            }
        })

        return NextResponse.json(log)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to log swipe' }, { status: 500 })
    }
}
