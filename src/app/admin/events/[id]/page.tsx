'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner'

export default function EditEvent() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string
    const [loading, setLoading] = useState(true)
    const [msg, setMsg] = useState('')

    const [formData, setFormData] = useState({
        title: '',
        startAt: '',
        area: '',
        venueName: '',
        imageUrl: '',
        descriptionShort: '',
        sourceUrl: ''
    })

    useEffect(() => {
        const fetchEvent = async () => {
            const res = await fetch(`/api/admin/events/${id}`)
            if (res.ok) {
                const data = await res.json()
                setFormData({
                    title: data.title || '',
                    startAt: data.startAt || '',
                    area: data.area || '',
                    venueName: data.venueName || '',
                    imageUrl: data.imageUrl || '',
                    descriptionShort: data.descriptionShort || '',
                    sourceUrl: data.sourceUrl || ''
                })
            } else {
                setMsg('Event not found')
            }
            setLoading(false)
        }
        fetchEvent()
    }, [id])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMsg('Saving...')

        try {
            const res = await fetch(`/api/admin/events/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                toast.success('Event updated successfully')
                router.push('/admin/events')
            } else {
                toast.error('Failed to update event')
                setMsg('Error saving')
            }
        } catch (error) {
            console.error(error)
            setMsg('Error saving')
        }
    }

    if (loading) return <div className="p-8">Loading...</div>
    if (msg === 'Event not found') return <div className="p-8">Event not found</div>

    return (
        <div className="max-w-2xl mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Edit Event: {formData.title}</h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
                <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="startAt">Start Date (String or Date)</Label>
                        <Input id="startAt" name="startAt" value={formData.startAt} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="area">Area</Label>
                        <Input id="area" name="area" value={formData.area} onChange={handleChange} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="venueName">Venue Name</Label>
                    <Input id="venueName" name="venueName" value={formData.venueName} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} />
                    {formData.imageUrl && <img src={formData.imageUrl} alt="Preview" className="h-32 object-cover rounded mt-2" />}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="descriptionShort">Description</Label>
                    <Textarea id="descriptionShort" name="descriptionShort" value={formData.descriptionShort} onChange={handleChange} rows={4} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="sourceUrl">Source URL</Label>
                    <Input id="sourceUrl" name="sourceUrl" value={formData.sourceUrl} onChange={handleChange} />
                </div>

                <div className="flex gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit">Save Changes</Button>
                </div>
            </form>
        </div>
    )
}
