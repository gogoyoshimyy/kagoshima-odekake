import prisma from '@/lib/prisma'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import MapLazy from '@/components/MapLazy'

export default async function EventDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const event = await prisma.event.findUnique({ where: { id } })

    if (!event) return <div>Event not found</div>

    return (
        <div className="min-h-screen bg-slate-50 p-4 pb-20">
            <div className="max-w-md mx-auto space-y-6">
                <header className="flex justify-between items-center">
                    <Button variant="outline" asChild>
                        <Link href="/">戻る</Link>
                    </Button>
                    <h1 className="font-bold text-lg truncate w-48">{event.title}</h1>
                    <Button variant="ghost" size="icon">?</Button>
                </header>

                <div className="aspect-video w-full bg-slate-200 rounded-xl overflow-hidden relative">
                    {event.imageUrl ? (
                        <img src={event.imageUrl} className="w-full h-full object-cover" />
                    ) : null}
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm space-y-4">
                    <h2 className="text-2xl font-bold">{event.title}</h2>
                    <div className="flex gap-2 text-sm text-slate-500">
                        <Badge variant="secondary">{format(new Date(event.startAt), 'yyyy-MM-dd HH:mm')}</Badge>
                        <Badge variant="outline">{event.priceText}</Badge>
                    </div>

                    <p className="text-slate-700 leading-relaxed">
                        {event.descriptionShort}
                    </p>

                    {event.bookingUrl && (
                        <Button className="w-full" asChild>
                            <a href={event.bookingUrl} target="_blank" rel="noopener noreferrer">公式サイトで予約・詳細</a>
                        </Button>
                    )}
                </div>

                {event.lat && event.lng && (
                    <div className="bg-white p-4 rounded-xl shadow-sm space-y-2">
                        <h3 className="font-bold">Access: {event.venueName}</h3>
                        <div className="h-64 w-full">
                            <MapLazy lat={event.lat} lng={event.lng} venue={event.venueName} />
                        </div>
                        <p className="text-xs text-slate-400">{event.address}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
