import { mockEvents } from '@/lib/mockEvents'
import { generateGoogleCalendarUrl, findRecommendations } from '@/lib/utils'
import RecommendationCard from '@/components/RecommendationCard'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import MapLazy from '@/components/MapLazy'
import { CalendarPlus } from 'lucide-react'
import { db } from '@/lib/firebase-admin'

export default async function EventDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    let event: any = null;

    // Try to fetch from Firestore first
    if (db) {
        try {
            const doc = await db.collection('events').doc(id).get();
            if (doc.exists) {
                event = { id: doc.id, ...doc.data() };
            }
        } catch (error) {
            console.error('Error fetching event from Firestore:', error);
        }
    }

    // Fallback to mock data if not found in Firestore
    if (!event) {
        event = mockEvents.find(e => e.id === id) || null;
    }

    if (!event) return <div>Event not found</div>

    const googleCalendarUrl = generateGoogleCalendarUrl(event)

    // For recommendations, try to get from Firestore first
    let allEvents = [];
    if (db) {
        try {
            const snapshot = await db.collection('events').where('status', '==', 'PUBLISHED').get();
            allEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error fetching events for recommendations:', error);
            allEvents = mockEvents;
        }
    } else {
        allEvents = mockEvents;
    }

    const recommendations = findRecommendations(event, allEvents)

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
                        <Badge variant="secondary">
                            {typeof event.startAt === 'string'
                                ? event.startAt
                                : format(new Date(event.startAt), 'yyyy-MM-dd HH:mm')}
                        </Badge>
                        <Badge variant="outline">{event.priceText || '¥'}</Badge>
                    </div>

                    <p className="text-slate-700 leading-relaxed">
                        {event.descriptionShort}
                    </p>

                    <div className="flex gap-2">
                        {event.bookingUrl && (
                            <Button className="flex-1" asChild>
                                <a href={event.bookingUrl} target="_blank" rel="noopener noreferrer">予約・詳細</a>
                            </Button>
                        )}
                        {event.sourceUrl && (
                            <Button className="flex-1" asChild>
                                <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer">詳細を見る</a>
                            </Button>
                        )}
                        <Button variant="outline" className="flex-1 gap-2" asChild>
                            <a href={googleCalendarUrl} target="_blank" rel="noopener noreferrer">
                                <CalendarPlus className="w-4 h-4" /> カレンダー登録
                            </a>
                        </Button>
                    </div>
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

                {/* Recommendations Section */}
                {recommendations.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-slate-200">
                        <h3 className="font-bold text-lg">こちらもおすすめ</h3>
                        <div className="grid gap-3">
                            {recommendations.map((recEvent: any) => (
                                <RecommendationCard key={recEvent.id} event={recEvent} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
