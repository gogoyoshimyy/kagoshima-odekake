'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Trash, Calendar, MapPin, Share2 } from "lucide-react"

export default function SavedPage() {
    const [savedEvents, setSavedEvents] = useState<any[]>([])

    useEffect(() => {
        try {
            const raw = localStorage.getItem('kes_saved')
            if (!raw) return
            const saved = JSON.parse(raw)
            if (Array.isArray(saved)) {
                // Filter out invalid items (null, undefined, missing id)
                const validEvents = saved.filter((e: any) => e && e.id)
                setSavedEvents(validEvents)
                // Optional: clean up LS if dirty
                if (validEvents.length !== saved.length) {
                    localStorage.setItem('kes_saved', JSON.stringify(validEvents))
                }
            }
        } catch (e) {
            console.error("Failed to parse saved events", e)
            localStorage.setItem('kes_saved', '[]') // Reset if corrupt
        }
    }, [])

    const removeEvent = (id: string, e: any) => {
        e.preventDefault()
        e.stopPropagation()
        const filtered = savedEvents.filter(e => e.id !== id)
        setSavedEvents(filtered)
        localStorage.setItem('kes_saved', JSON.stringify(filtered))
    }

    const shareEvent = (event: any, e: any) => {
        e.preventDefault()
        e.stopPropagation()
        const text = `鹿児島のイベント: ${event.title}`;
        if (navigator.share) {
            navigator.share({
                title: event.title,
                text: text,
                url: window.location.origin // TODO: deep link
            })
        } else {
            // Fallback to clipboard
            navigator.clipboard.writeText(`${text} ${window.location.origin}`)
            alert("リンクをコピーしました")
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4">
            <header className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold">キープしたイベント ({savedEvents.length})</h1>
                <Button asChild variant="outline">
                    <Link href="/">戻る</Link>
                </Button>
            </header>

            {savedEvents.length === 0 ? (
                <div className="text-center text-slate-500 mt-20">
                    <p>まだキープしたイベントはありません。</p>
                    <Button asChild className="mt-4">
                        <Link href="/">イベントを探す</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...savedEvents].sort((a, b) => (b.interest || 0) - (a.interest || 0)).map(event => (
                        <Link key={event.id} href={`/event/${event.id}`}>
                            <Card className="flex flex-row overflow-hidden h-36 hover:border-primary transition-colors cursor-pointer group relative">
                                <div className="w-28 h-full bg-slate-200 shrink-0 relative">
                                    {event.imageUrl ? (
                                        <img src={event.imageUrl} className="w-full h-full object-cover" />
                                    ) : null}
                                    {event.interest !== undefined && (
                                        <div className="absolute top-1 left-1 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-black text-rose-500 shadow-sm border border-rose-100 italic">
                                            {event.interest}%
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 p-3 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-bold text-sm line-clamp-2 md:text-base group-hover:text-primary">{event.title}</h3>
                                        <div className="text-xs text-slate-500 mt-1 flex flex-col gap-1">
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-400" /> {format(new Date(event.startAt), 'M/d', { locale: ja })}</span>
                                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {event.area}</span>
                                        </div>
                                    </div>

                                    {/* Interest Sparkline/Bar */}
                                    <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-rose-500 to-orange-400"
                                            style={{ width: `${event.interest || 0}%` }}
                                        />
                                    </div>

                                    <div className="flex justify-end gap-2 mt-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-200 z-10" onClick={(e) => removeEvent(event.id, e)}>
                                            <Trash className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-200 z-10" onClick={(e) => shareEvent(event, e)}>
                                            <Share2 className="w-3.5 h-3.5 text-slate-400 hover:text-blue-500" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
