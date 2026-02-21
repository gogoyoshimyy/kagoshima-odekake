'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from 'framer-motion'
import { useSearchParams, useRouter } from 'next/navigation'
import EventCard from './EventCard'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Link from 'next/link'

import { calculateDistance } from '@/lib/utils'
import InterestSlider from './InterestSlider'

export default function Deck() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const mode = searchParams.get('mode')
    // const transport = searchParams.get('transport')

    const [events, setEvents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
    const [interest, setInterest] = useState(50)
    const [isModified, setIsModified] = useState(false)

    // Animation controls
    const controls = useAnimation()

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

    const handleAction = async (type: 'skip' | 'save') => {
        if (currentIndex >= events.length) return
        const currentEvent = events[currentIndex]

        // Visual feedback
        if (type === 'save') {
            await controls.start({
                x: 500,
                opacity: 0,
                scale: 0.8,
                transition: { duration: 0.4, ease: "easeOut" }
            })
            // Save to local logic
            const saved = JSON.parse(localStorage.getItem('kes_saved') || '[]')
            if (!saved.find((e: any) => e.id === currentEvent.id)) {
                saved.push({ ...currentEvent, interest, savedAt: new Date().toISOString() })
                localStorage.setItem('kes_saved', JSON.stringify(saved))
            }
            toast.success(`${interest}%の興味で保存しました`)
        } else {
            // Skip action
            await controls.start({
                x: -500,
                opacity: 0,
                scale: 0.8,
                transition: { duration: 0.4, ease: "easeOut" }
            })
        }

        // Attempt API log (fire and forget)
        fetch('/api/swipe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventId: currentEvent.id,
                action: type === 'save' ? 'LIKE' : 'NOPE',
                interest: type === 'save' ? interest : 0,
                anonId: 'demo-user'
            })
        })

        // Reset and advance
        setCurrentIndex(prev => prev + 1)
        setInterest(50)
        setIsModified(false)
        controls.set({ x: 0, opacity: 1, scale: 1 })
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

            {/* Active Card Container */}
            <div className="flex-1 relative mb-8">
                {/* Background Cards (Stack Effect) */}
                {nextEvent && (
                    <div className="absolute inset-0 p-2 scale-95 translate-y-4 opacity-50 z-0">
                        <EventCard event={nextEventWithDist} />
                    </div>
                )}

                {/* Active Card */}
                <motion.div
                    animate={controls}
                    style={{ scale: 1, opacity: 1 }}
                    className="absolute inset-0 p-2 z-10"
                >
                    <EventCard event={currentEventWithDist} />
                </motion.div>
            </div>

            {/* Interaction Layer */}
            <div className="mt-auto px-2 space-y-8 z-30 pb-6">
                <InterestSlider
                    value={interest}
                    onChange={(val) => {
                        setInterest(val)
                        setIsModified(true)
                    }}
                />

                <div className="flex justify-between gap-4">
                    <Button
                        variant="outline"
                        size="lg"
                        className="flex-1 h-14 rounded-2xl border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-all active:scale-95 text-base"
                        onClick={() => handleAction('skip')}
                    >
                        興味がない
                    </Button>
                    <Button
                        size="lg"
                        disabled={!isModified}
                        className={`flex-[1.5] h-14 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 text-lg ${isModified
                                ? 'bg-gradient-to-r from-rose-500 to-orange-400 shadow-rose-200'
                                : 'bg-slate-200 text-slate-400 shadow-none'
                            }`}
                        onClick={() => handleAction('save')}
                    >
                        保存する
                    </Button>
                </div>
            </div>

            {/* Link to Saved */}
            <div className="absolute top-4 right-4 z-30">
                <Link href="/saved">
                    <Button variant="outline" size="sm" className="bg-white/80 backdrop-blur rounded-full px-4 border-slate-200 text-slate-600 font-bold">
                        保存済み
                    </Button>
                </Link>
            </div>
        </div>
    )
}
