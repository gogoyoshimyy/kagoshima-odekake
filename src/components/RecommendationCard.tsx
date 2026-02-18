import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, MapPin } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ja } from "date-fns/locale"

interface RecommendationCardProps {
    event: any
}

export default function RecommendationCard({ event }: RecommendationCardProps) {
    return (
        <Link href={`/event/${event.id}`} className="block">
            <Card className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex">
                    <div className="w-1/3 h-24 bg-slate-200 relative shrink-0">
                        {event.imageUrl ? (
                            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Image</div>
                        )}
                        {event.score > 0 && (
                            <div className="absolute top-0 left-0 bg-yellow-400 text-xs font-bold px-1 py-0.5">
                                おすすめ
                            </div>
                        )}
                    </div>
                    <CardContent className="flex-1 p-3 flex flex-col justify-between">
                        <h3 className="font-bold text-sm line-clamp-2">{event.title}</h3>
                        <div className="text-xs text-slate-500 space-y-1">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>
                                    {typeof event.startAt === 'string'
                                        ? event.startAt
                                        : format(new Date(event.startAt), 'M/d(E) HH:mm', { locale: ja })}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{event.area}</span>
                            </div>
                        </div>
                    </CardContent>
                </div>
            </Card>
        </Link>
    )
}
