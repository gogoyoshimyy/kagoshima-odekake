import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 503 })

        const doc = await db.collection('events').doc(id).get()
        if (!doc.exists) return NextResponse.json({ error: 'Not Found' }, { status: 404 })

        return NextResponse.json({ id: doc.id, ...doc.data() })
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const body = await request.json()

        if (!db) {
            console.warn('[MOCK UPDATE] DB unavailable', id, body)
            return NextResponse.json({ ...body, id })
        }

        await db.collection('events').doc(id).update(body)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params

        if (!db) {
            console.warn('[MOCK DELETE] DB unavailable', id)
            return NextResponse.json({ success: true })
        }

        await db.collection('events').doc(id).delete()
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
