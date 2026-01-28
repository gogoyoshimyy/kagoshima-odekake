import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Event } from '@prisma/client'

// Mode weighting logic
const cleanPrice = (price: string | null) => {
    if (!price) return 0
    if (price.toLowerCase().includes('free') || price.includes('無料')) return 0
    const match = price.match(/(\d+)/)
    return match ? parseInt(match[1]) : 1000 // Default to something if unclear
}

const scoreEvent = (event: Event, mode: string | null) => {
    let score = 0

    // Base Score (Freshness) - boost events happening sooner
    // Note: For MVP mock data, we just randomize slightly or base on date
    // Real logic: proximity to today gives higher score

    if (event.wildcard) {
        // Wildcards get random boost to serve as serendipity
        if (Math.random() < 0.3) score += 50
    }

    if (mode === 'housewife') {
        if (event.kidsOk) score += 20
        if (event.indoor) score += 10
        if (event.strollerOk) score += 10
        if (event.nursingRoom || event.diaperChanging) score += 15
        if (event.parking) score += 10
        if (event.isFree || cleanPrice(event.priceText) < 1000) score += 15
        if (event.durationMin && event.durationMin < 120) score += 5
        // Daytime preference
        const hour = event.startAt.getHours()
        if (hour >= 10 && hour <= 16) score += 10
    }
    else if (mode === 'worker') {
        if (event.after18) score += 25
        if (event.nearStation) score += 15
        if (event.durationMin && event.durationMin <= 90) score += 10
        if (event.foodDrink) score += 15
        if (event.weekdayNight) score += 20
        // Evening preference
        const hour = event.startAt.getHours()
        if (hour >= 17) score += 15
    }
    else if (mode === 'student') {
        if (event.isFree) score += 25
        if (cleanPrice(event.priceText) < 2000) score += 10
        if (event.social) score += 20
        if (event.photogenic) score += 15
        if (event.discount) score += 15
    }
    else if (mode === 'tourist') {
        if (event.area === 'Tenmonkan' || event.area === 'Chuo Station') score += 10 // Central
        if (event.englishSupport) score += 15
        if (event.photogenic) score += 15
        // Today/Tomorrow preference? (For MVP just random + manual curated lists)
    }

    // Curator Note Boost
    if (event.curatorNote) score += 5

    return score
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const mode = searchParams.get('mode')
    // const transport = searchParams.get('transport') 

    try {
        const events = await prisma.event.findMany({
            where: {
                status: 'PUBLISHED'
            },
            orderBy: {
                startAt: 'asc'
            }
        })

        // Calculate scores
        const scoredEvents = events.map(event => ({
            ...event,
            score: scoreEvent(event, mode)
        }))

        // Sort by score desc, then date asc
        scoredEvents.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score
            // Secondary sort: wildcards mixed in?
            // Or just startAt
            return new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
        })

        return NextResponse.json(scoredEvents)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
    }
}
