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
    return (
        <Card className="w-full h-full max-w-md mx-auto shadow-2xl overflow-hidden rounded-3xl relative bg-white flex flex-col pointer-events-auto select-none" {...dragHandlers}>
            {/* Detail Link */}
            <Link href={`/event/${event.id}`} className="absolute top-4 left-4 z-50">
                <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full bg-white/70 backdrop-blur shadow-sm hover:bg-white" onPointerDown={(e) => e.stopPropagation()}>
                    <Info className="w-5 h-5 text-slate-700" />
                </Button>
            </Link>

            {/* Image Section */}
            <div className="relative h-[45%] w-full bg-slate-200 shrink-0">
                {event.imageUrl ? (
                    <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover pointer-events-none"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                        No Image
                    </div>
                )}
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                    {event.wildcard && <Badge variant="destructive" className="animate-pulse">✨ Secrendipity</Badge>}
                    {event.isFree && <Badge className="bg-green-500">無料</Badge>}
                </div>
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
                    <h2 className="text-white text-2xl font-bold leading-tight">{event.title}</h2>
                    {event.curatorNote && (
                        <div className="mt-2 text-yellow-200 text-sm font-medium flex gap-1 items-start">
                            <span className="shrink-0">💡</span>
                            <span>{event.curatorNote}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Info Section */}
            <CardContent className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
                <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{format(new Date(event.startAt), 'M/d(E)', { locale: ja })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>{format(new Date(event.startAt), 'HH:mm')}</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="truncate">{event.venueName} ({event.area})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <JapaneseYen className="w-4 h-4 text-primary" />
                        <span>{event.priceText}</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-1">
                    {event.indoor && <Badge variant="secondary">屋内</Badge>}
                    {event.kidsOk && <Badge variant="secondary">子連れOK</Badge>}
                    {event.parking && <Badge variant="secondary">Pあり</Badge>}
                    {event.after18 && <Badge variant="secondary">夜OK</Badge>}
                </div>

                <div className="text-sm text-slate-600 line-clamp-3">
                    {event.descriptionShort}
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0 shrink-0 text-center text-xs text-muted-foreground flex justify-center gap-8">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full border-2 border-red-400 text-red-400 flex items-center justify-center mb-1 bg-red-50">✕</div>
                    <span>パス</span>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full border-2 border-blue-400 text-blue-400 flex items-center justify-center mb-1 bg-blue-50">保存</div>
                    <span>キープ</span>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full border-2 border-green-400 text-green-400 flex items-center justify-center mb-1 bg-green-50">♥</div>
                    <span>いいね</span>
                </div>
            </CardFooter>
        </Card>
    )
}
