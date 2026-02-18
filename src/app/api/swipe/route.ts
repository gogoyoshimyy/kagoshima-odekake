import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { eventId, action, anonId } = body

        if (!eventId || !action) {
            return NextResponse.json({ error: 'Missing Required Fields' }, { status: 400 })
        }

        if (db) {
            const docRef = await db.collection('swipes').add({
                eventId,
                action,
                anonId,
                createdAt: new Date()
            })
            return NextResponse.json({ id: docRef.id, ...body })
        } else {
            console.log(`[MOCK SWIPE] Event: ${eventId}, Action: ${action}, User: ${anonId}`)
            return NextResponse.json({ id: 'mock-id-' + Date.now(), ...body })
        }

    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to log swipe' }, { status: 500 })
    }
}
