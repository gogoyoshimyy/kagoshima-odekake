import { NextRequest, NextResponse } from 'next/server'
import { mockEvents } from '@/lib/mockEvents'

export async function GET(request: NextRequest) {
    try {
        // Return mock events for now
        return NextResponse.json(mockEvents)
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        console.log("[MOCK CREATE EVENT]", body)
        // Return a mock created event
        const newEvent = { ...body, id: `evt_mock_${Date.now()}` }
        return NextResponse.json(newEvent)
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
