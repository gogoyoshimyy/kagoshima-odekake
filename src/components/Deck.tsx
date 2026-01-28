'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from 'framer-motion'
import { useSearchParams, useRouter } from 'next/navigation'
import EventCard from './EventCard'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Link from 'next/link'

export default function Deck() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const mode = searchParams.get('mode')
    // const transport = searchParams.get('transport')

    const [events, setEvents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)

    // Animation controls
    const controls = useAnimation()
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const rotate = useTransform(x, [-200, 200], [-30, 30])
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5])

    // Tag style for swipe overlay
    const likeOpacity = useTransform(x, [50, 150], [0, 1])
    const nopeOpacity = useTransform(x, [-150, -50], [1, 0])
    const saveOpacity = useTransform(y, [-150, -50], [1, 0])

    useEffect(() => {
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

    const handleSwipe = async (direction: 'left' | 'right' | 'up') => {
        if (currentIndex >= events.length) return
        const currentEvent = events[currentIndex]

        // Log intent
        let action = 'NOPE'
        if (direction === 'right') action = 'LIKE'
        if (direction === 'up') action = 'SAVE'

        // Save to local logic (simplified)
        if (action === 'SAVE' || action === 'LIKE') {
            const saved = JSON.parse(localStorage.getItem('kes_saved') || '[]')
            if (!saved.find((e: any) => e.id === currentEvent.id)) {
                saved.push(currentEvent)
                localStorage.setItem('kes_saved', JSON.stringify(saved))
            }
            if (action === 'SAVE') toast.success("保存しました！")
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
        else if (direction === 'up') await controls.start({ y: -500, opacity: 0, transition: { duration: 0.3 } })

        // Reset and advance
        setCurrentIndex(prev => prev + 1)
        x.set(0)
        y.set(0)
        controls.set({ x: 0, y: 0, opacity: 1 })
    }

    const onDragEnd = (event: any, info: PanInfo) => {
        const threshold = 100
        if (info.offset.x > threshold) handleSwipe('right')
        else if (info.offset.x < -threshold) handleSwipe('left')
        else if (info.offset.y < -threshold) handleSwipe('up')
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

    return (
        <div className="h-[90vh] w-full max-w-md mx-auto relative mt-4 perspective-1000">

            {/* Background Cards (Stack Effect) */}
            {nextEvent && (
                <div className="absolute top-0 left-0 w-full h-full p-2 scale-95 translate-y-4 opacity-50 z-0">
                    <EventCard event={nextEvent} />
                </div>
            )}

            {/* Active Card */}
            <motion.div
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.6} // Rubber band effect
                onDragEnd={onDragEnd}
                animate={controls}
                style={{ x, y, rotate }}
                className="w-full h-full p-2 absolute top-0 left-0 z-10 cursor-grab active:cursor-grabbing"
            >
                <EventCard event={currentEvent} />

                {/* Swipe Overlays */}
                <motion.div style={{ opacity: likeOpacity }} className="absolute top-10 left-10 border-4 border-green-500 text-green-500 text-4xl font-bold p-2 rounded-lg transform -rotate-12 bg-white/80 pointer-events-none whitespace-nowrap z-50">
                    いいね！
                </motion.div>
                <motion.div style={{ opacity: nopeOpacity }} className="absolute top-10 right-10 border-4 border-red-500 text-red-500 text-4xl font-bold p-2 rounded-lg transform rotate-12 bg-white/80 pointer-events-none whitespace-nowrap z-50">
                    パス
                </motion.div>
                <motion.div style={{ opacity: saveOpacity }} className="absolute bottom-40 left-1/2 -translate-x-1/2 border-4 border-blue-500 text-blue-500 text-4xl font-bold p-2 rounded-lg bg-white/80 pointer-events-none whitespace-nowrap z-50">
                    キープ
                </motion.div>
            </motion.div>

            {/* Manual Buttons for Accessibilty */}
            <div className="absolute -bottom-16 left-0 w-full flex justify-center gap-4 z-20">
                <Button variant="destructive" size="icon" className="h-14 w-14 rounded-full shadow-lg" onClick={() => handleSwipe('left')}>✕</Button>
                <Button className="h-14 w-14 rounded-full shadow-lg bg-blue-500 hover:bg-blue-600" onClick={() => handleSwipe('up')}>⭐</Button>
                <Button className="h-14 w-14 rounded-full shadow-lg bg-green-500 hover:bg-green-600" onClick={() => handleSwipe('right')}>♥</Button>
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
