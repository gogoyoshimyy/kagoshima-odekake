'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { toast } from 'sonner'

export default function AdminEvents() {
    const [events, setEvents] = useState<any[]>([])

    const fetchEvents = async () => {
        const res = await fetch('/api/admin/events')
        if (res.ok) setEvents(await res.json())
    }

    useEffect(() => {
        fetchEvents()
    }, [])

    const deleteEvent = async (id: string) => {
        if (!confirm('Are you sure?')) return
        await fetch(`/api/admin/events/${id}`, { method: 'DELETE' })
        toast.success('Deleted')
        fetchEvents()
    }

    const toggleStatus = async (event: any) => {
        const newStatus = event.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
        await fetch(`/api/admin/events/${event.id}`, {
            method: 'PUT',
            body: JSON.stringify({ status: newStatus })
        })
        toast.success('Status Updated')
        fetchEvents()
    }

    const toggleWildcard = async (event: any) => {
        await fetch(`/api/admin/events/${event.id}`, {
            method: 'PUT',
            body: JSON.stringify({ wildcard: !event.wildcard })
        })
        toast.success('Wildcard Updated')
        fetchEvents()
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Events</h1>
                <Button>+ New Event</Button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="bg-slate-100 text-xs uppercase font-medium">
                        <tr>
                            <th className="px-4 py-3">Title</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Mode Tags</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {events.map((e) => (
                            <tr key={e.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3 font-medium text-slate-900">
                                    {e.title}
                                    {e.wildcard && <span className="ml-2 text-yellow-500">★</span>}
                                </td>
                                <td className="px-4 py-3">{format(new Date(e.startAt), 'yyyy-MM-dd HH:mm')}</td>
                                <td className="px-4 py-3 space-x-1">
                                    {e.indoor && <Badge variant="outline" className="text-xs">Indoor</Badge>}
                                    {e.kidsOk && <Badge variant="outline" className="text-xs">Kids</Badge>}
                                    {e.after18 && <Badge variant="outline" className="text-xs">Night</Badge>}
                                </td>
                                <td className="px-4 py-3">
                                    <Badge variant={e.status === 'PUBLISHED' ? 'default' : 'secondary'} className="cursor-pointer" onClick={() => toggleStatus(e)}>
                                        {e.status}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => {
                                        window.location.href = `/admin/events/${e.id}`
                                    }}>Edit</Button>
                                    <Button size="sm" variant="outline" onClick={() => toggleWildcard(e)}>Wild</Button>
                                    <Button size="sm" variant="destructive" onClick={() => deleteEvent(e.id)}>Del</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
