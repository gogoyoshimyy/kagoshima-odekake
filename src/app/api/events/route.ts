import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin' // Using Firebase
import { mockEvents } from '@/lib/mockEvents' // Mock data import

// Simplified type for now
type LocalEvent = any;

// Mode weighting logic (same as before)
const cleanPrice = (price: string | null) => {
    if (!price) return 0
    if (price.toLowerCase().includes('free') || price.includes('無料')) return 0
    const match = price.match(/(\d+)/)
    return match ? parseInt(match[1]) : 1000
}

const scoreEvent = (event: any, mode: string | null) => {
    let score = 0

    if (event.wildcard) {
        if (Math.random() < 0.3) score += 50
    }

    // Simplified scoring for demo
    if (mode === 'housewife') {
        if (event.kidsOk) score += 20
        if (event.indoor) score += 10
        if (event.startAt && new Date(event.startAt).getHours() >= 10 && new Date(event.startAt).getHours() <= 16) score += 10
    }
    else if (mode === 'worker') {
        if (event.after18) score += 25
        if (event.nearStation) score += 15
        if (event.startAt && new Date(event.startAt).getHours() >= 17) score += 15
    }
    else if (mode === 'student') {
        if (event.isFree) score += 25
        if (cleanPrice(event.priceText) < 2000) score += 10
        if (event.photogenic) score += 15
    }
    else if (mode === 'tourist') {
        if (event.englishSupport) score += 15
        if (event.photogenic) score += 15
    }

    if (event.curatorNote) score += 5
    return score
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const mode = searchParams.get('mode')

    let events: any[] = [];

    try {
        if (!db) {
            console.warn('Firestore is not initialized. Using mock data.');
            // Use mock events if DB is not available
            events = [...mockEvents];
        } else {
            const snapshot = await db.collection('events')
                .where('status', '==', 'PUBLISHED')
                .get();

            if (snapshot.empty) {
                console.log('No events found in Firestore.');
            } else {
                events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            }
        }

        // Convert timestamp strings back to Date objects if needed for sorting, 
        // though our scoreEvent logic handles strings or Date objects loosely usually.
        // But let's be safe for sorting
        events = events.map(e => ({
            ...e,
            startAt: e.startAt ? new Date(e.startAt) : new Date()
        }));

    } catch (error) {
        console.error("Firestore unavailable or error:", error)
        // Fallback to mock data on error as well
        events = [...mockEvents];
    }

    // Calculate scores
    const scoredEvents = events.map(event => ({
        ...event,
        score: scoreEvent(event, mode)
    }))

    // Sort by score desc
    scoredEvents.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        return new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    })

    return NextResponse.json(scoredEvents)
}
