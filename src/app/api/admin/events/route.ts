import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const events = await prisma.event.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100
        })
        return NextResponse.json(events)
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        // Validation omitted for MVP speed
        const event = await prisma.event.create({
            data: body
        })
        return NextResponse.json(event)
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
