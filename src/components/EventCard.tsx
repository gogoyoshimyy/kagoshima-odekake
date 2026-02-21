'use client'

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, JapaneseYen, Info } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ja } from "date-fns/locale"

interface EventProps {
    event: any
    dragHandlers?: any
}

export default function EventCard({ event, dragHandlers }: EventProps) {
    if (!event) return <div className="p-4 text-center">Loading...</div>

    return (
        <Card className="w-full h-full max-w-md mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden rounded-[2.5rem] relative bg-white/90 glass flex flex-col pointer-events-auto select-none border-none" {...dragHandlers}>
            {/* Detail Link */}
            <Link href={`/event/${event.id}`} className="absolute top-6 left-6 z-50">
                <Button variant="secondary" size="icon" className="h-14 w-14 rounded-full bg-white/60 backdrop-blur-xl shadow-xl hover:bg-white/80 transition-all active:scale-90 border-none group" onPointerDown={(e) => e.stopPropagation()}>
                    <Info className="w-7 h-7 text-slate-800 group-hover:text-primary transition-colors" />
                </Button>
            </Link>

            {/* Image Section */}
            <div className="relative h-[45%] w-full bg-slate-200 shrink-0">
                {event.imageUrl ? (
                    <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover pointer-events-none scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-gradient-to-br from-slate-100 to-slate-200">
                        No Image
                    </div>
                )}
                <div className="absolute top-6 right-6 flex gap-2 z-10">
                    {event.wildcard && <Badge variant="destructive" className="animate-pulse bg-gradient-to-r from-purple-500 to-pink-500 border-none px-3 py-1 shadow-md">✨ Serendipity</Badge>}
                    {event.isFree && <Badge className="bg-emerald-500 border-none px-3 py-1 shadow-md">無料</Badge>}
                </div>
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 pt-20">
                    <h2 className="text-white text-2xl font-black leading-tight tracking-tight drop-shadow-lg line-clamp-2 md:text-3xl">{event.title}</h2>
                    {event.curatorNote && (
                        <div className="mt-3 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-[10px] font-semibold flex gap-2 items-center w-fit">
                            <span>💡</span>
                            <span>{event.curatorNote}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Info Section */}
            <CardContent className="flex-1 p-5 flex flex-col gap-5 overflow-y-auto bg-white">
                <div className="grid grid-cols-2 gap-4 text-sm font-medium text-slate-600">
                    <div className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-rose-500" />
                        <span className="text-slate-900">
                            {typeof event.startAt === 'string'
                                ? event.startAt.split(' ')[0]
                                : format(new Date(event.startAt), 'M/d(E)', { locale: ja })}
                        </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-rose-500" />
                        <span className="text-slate-900">
                            {typeof event.startAt === 'string'
                                ? (event.startAt.includes(' ') ? event.startAt.split(' ')[1] : '')
                                : format(new Date(event.startAt), 'HH:mm')}
                        </span>
                    </div>
                    <div className="flex items-start gap-2.5 col-span-2">
                        <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span className="text-slate-900 leading-snug">
                            {event.venueName} <span className="text-slate-400 font-normal text-xs">({event.area})</span>
                        </span>
                    </div>
                    {event.priceText && (
                        <div className="flex items-center gap-2.5 col-span-2">
                            <JapaneseYen className="w-4 h-4 text-rose-500" />
                            <span className="text-slate-900 font-bold">{event.priceText}</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                    {event.distance !== undefined && (
                        <Badge variant="outline" className="border-blue-200 text-blue-600 bg-blue-50/50 px-2 py-0.5 text-[10px]">
                            現在地から {event.distance}km
                        </Badge>
                    )}
                    {event.indoor && <Badge variant="secondary" className="text-[10px]">屋内</Badge>}
                    {event.kidsOk && <Badge variant="secondary" className="text-[10px]">子連れOK</Badge>}
                </div>

                <div className="text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4 pb-12 italic">
                    {event.descriptionShort}
                </div>
            </CardContent>
        </Card>
    )
}
