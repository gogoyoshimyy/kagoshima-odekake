'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from 'framer-motion'
import { useSearchParams, useRouter } from 'next/navigation'
import EventCard from './EventCard'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Link from 'next/link'

import { calculateDistance } from '@/lib/utils'

export default function Deck() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const mode = searchParams.get('mode')
    // const transport = searchParams.get('transport')

    const [events, setEvents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

    // Animation controls
    const controls = useAnimation()
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const rotate = useTransform(x, [-200, 200], [-30, 30])
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5])

    // Tag style for swipe overlay
    const likeOpacity = useTransform(x, [50, 150], [0, 1])
    const nopeOpacity = useTransform(x, [-150, -50], [1, 0])

    useEffect(() => {
        // Fetch location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    })
                },
                (error) => {
                    console.log("Location access denied or error:", error)
                }
            )
        }

        const fetchEvents = async () => {
            try {
                const res = await fetch(`/api/events?mode=${mode || 'tourist'}`)
                const data = await res.json()
                if (Array.isArray(data)) {
                    setEvents(data)
                } else {
                    console.error("API returned non-array:", data)
                    setEvents([]) // Safe fallback
                }
            } catch (e) {
                console.error(e)
                toast.error("イベントの取得に失敗しました")
            } finally {
                setLoading(false)
            }
        }
        fetchEvents()
    }, [mode])

    const handleSwipe = async (direction: 'left' | 'right') => {
        if (currentIndex >= events.length) return
        const currentEvent = events[currentIndex]

        // Log intent
        let action = 'NOPE'
        if (direction === 'right') action = 'LIKE'

        // Save to local logic (simplified)
        // Like acts as Save now
        if (action === 'LIKE') {
            const saved = JSON.parse(localStorage.getItem('kes_saved') || '[]')
            if (!saved.find((e: any) => e.id === currentEvent.id)) {
                saved.push(currentEvent)
                localStorage.setItem('kes_saved', JSON.stringify(saved))
            }
            toast.success("いいね！")
        }

        // Attempt API log (fire and forget)
        fetch('/api/swipe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventId: currentEvent.id, action, anonId: 'demo-user' }) // TODO: real anonId
        })

        // Animation transition
        if (direction === 'right') await controls.start({ x: 500, opacity: 0, transition: { duration: 0.3 } })
        else if (direction === 'left') await controls.start({ x: -500, opacity: 0, transition: { duration: 0.3 } })

        // Reset and advance
        setCurrentIndex(prev => prev + 1)
        x.set(0)
        y.set(0)
        controls.set({ x: 0, y: 0, opacity: 1 })
    }

    const onDragEnd = (event: any, info: PanInfo) => {
        const threshold = 80 // Reduced threshold for mobile snappiness
        if (info.offset.x > threshold) handleSwipe('right')
        else if (info.offset.x < -threshold) handleSwipe('left')
        else controls.start({ x: 0, y: 0 })
    }

    if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>

    if (currentIndex >= events.length) {
        return (
            <div className="flex flex-col items-center justify-center h-screen p-6 text-center">
                <h2 className="text-2xl font-bold mb-4">現在掲載中のイベントは以上です</h2>
                <div className="flex gap-4">
                    <Button asChild>
                        <Link href="/saved">キープ一覧を見る</Link>
                    </Button>
                    <Button variant="outline" onClick={() => window.location.reload()}>
                        もう一度見る
                    </Button>
                </div>
            </div>
        )
    }

    const currentEvent = events[currentIndex]
    const nextEvent = events[currentIndex + 1]

    // Calculate distance if location available
    const enrichEvent = (event: any) => {
        if (!event) return event
        if (userLocation && event.lat && event.lng) {
            return {
                ...event,
                distance: calculateDistance(userLocation.lat, userLocation.lng, event.lat, event.lng)
            }
        }
        return event
    }

    const currentEventWithDist = enrichEvent(currentEvent)
    const nextEventWithDist = enrichEvent(nextEvent)

    return (
        <div className="h-[100dvh] w-full max-w-lg mx-auto relative pt-12 pb-24 px-4 perspective-2000 overflow-hidden flex flex-col">
            {/* Header / Title */}
            <div className="absolute top-0 left-0 w-full text-center z-30 pt-4">
                <h1 className="text-xl font-black italic tracking-tighter premium-text-gradient uppercase">Kagoshima Events</h1>
            </div>

            {/* Background Cards (Stack Effect) */}
            {nextEvent && (
                <div className="absolute top-0 left-0 w-full h-full p-2 scale-95 translate-y-4 opacity-50 z-0">
                    <EventCard event={nextEventWithDist} />
                </div>
            )}

            {/* Active Card */}
            <motion.div
                drag="x" // Restrict to horizontal axis
                dragDirectionLock // Ensure axis locking
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6} // Premium weighted feel
                onDragEnd={onDragEnd}
                animate={controls}
                style={{ x, y, rotate, touchAction: 'pan-y' }} // pan-y allows vertical scroll in card
                whileTap={{ scale: 1.02 }}
                className="w-full h-full p-2 absolute top-0 left-0 z-10 cursor-grab active:cursor-grabbing"
            >
                <EventCard event={currentEventWithDist} />

                {/* Swipe Overlays */}
                <motion.div style={{ opacity: likeOpacity }} className="absolute top-10 left-10 border-4 border-green-500 text-green-500 text-4xl font-bold p-2 rounded-lg transform -rotate-12 bg-white/80 pointer-events-none whitespace-nowrap z-50">
                    いいね！
                </motion.div>
                <motion.div style={{ opacity: nopeOpacity }} className="absolute top-10 right-10 border-4 border-red-500 text-red-500 text-4xl font-bold p-2 rounded-lg transform rotate-12 bg-white/80 pointer-events-none whitespace-nowrap z-50">
                    パス
                </motion.div>
            </motion.div>

            {/* Manual Buttons for Accessibility */}
            <div className="fixed bottom-8 left-0 w-full flex justify-center gap-8 z-50">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-16 w-16 rounded-full shadow-xl bg-white/90 backdrop-blur-md border-none text-slate-400 active:scale-90 hover:text-rose-500 transition-all"
                    onClick={() => handleSwipe('left')}
                >
                    <span className="text-2xl font-light">✕</span>
                </Button>
                <Button
                    className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-br from-rose-500 to-orange-400 border-none text-white active:scale-95 hover:scale-105 transition-all shadow-rose-200/50"
                    onClick={() => handleSwipe('right')}
                >
                    <span className="text-3xl text-white">♥</span>
                </Button>
            </div>

            {/* Link to Saved */}
            <div className="absolute top-4 right-4 z-30">
                <Link href="/saved">
                    <Button variant="outline" size="sm" className="bg-white/80 backdrop-blur">
                        一覧
                    </Button>
                </Link>
            </div>
        </div>
    )
}
