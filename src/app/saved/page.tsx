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
        const saved = JSON.parse(localStorage.getItem('kes_saved') || '[]')
        setSavedEvents(saved)
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
                    {savedEvents.map(event => (
                        <Link key={event.id} href={`/event/${event.id}`}>
                            <Card className="flex flex-row overflow-hidden h-32 hover:border-primary transition-colors cursor-pointer group">
                                <div className="w-24 h-full bg-slate-200 shrink-0">
                                    {event.imageUrl ? (
                                        <img src={event.imageUrl} className="w-full h-full object-cover" />
                                    ) : null}
                                </div>
                                <div className="flex-1 p-3 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-bold text-sm line-clamp-2 md:text-base group-hover:text-primary">{event.title}</h3>
                                        <div className="text-xs text-slate-500 mt-1 flex gap-2">
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(new Date(event.startAt), 'M/d', { locale: ja })}</span>
                                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.area}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-200 z-10" onClick={(e) => removeEvent(event.id, e)}>
                                            <Trash className="w-4 h-4 text-red-400" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-200 z-10" onClick={(e) => shareEvent(event, e)}>
                                            <Share2 className="w-4 h-4 text-blue-400" />
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
