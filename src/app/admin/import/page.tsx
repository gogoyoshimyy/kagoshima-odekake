'use client'

import { useState } from 'react'
import Papa from 'papaparse'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function AdminImport() {
    const [data, setData] = useState<any[]>([])
    const [importing, setImporting] = useState(false)

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                // Map CSV fields to schema
                const mapped = results.data.map((row: any) => ({
                    title: row.title,
                    startAt: row.date ? new Date(row.date) : new Date(), // Basic parsing
                    venueName: row.venue || 'Unknown',
                    descriptionShort: row.desc || '',
                    area: row.area || '',
                    status: 'DRAFT', // Default to draft
                    // Boolean flags from CSV "0"/"1" or "true"/"false"
                    kidsOk: row.kids === '1' || row.kids === 'true',
                    indoor: row.indoor === '1' || row.indoor === 'true',
                    priceText: row.price || 'Unknown'
                }))
                setData(mapped)
            }
        })
    }

    const doImport = async () => {
        setImporting(true)
        let count = 0
        for (const item of data) {
            try {
                await fetch('/api/admin/events', {
                    method: 'POST',
                    body: JSON.stringify(item)
                })
                count++
            } catch (e) {
                console.error(e)
            }
        }
        setImporting(false)
        toast.success(`Imported ${count} events`)
        setData([])
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Import CSV</h1>

            <div className="p-4 bg-white rounded shadow text-sm">
                <p className="font-bold mb-2">CSV Format Guide:</p>
                <p>Headers: title, date (YYYY-MM-DD HH:mm), venue, area, price, desc, kids (0/1), indoor (0/1)</p>
            </div>

            <div className="flex gap-4 items-center">
                <Input type="file" accept=".csv" onChange={handleFile} />
                <Button onClick={doImport} disabled={!data.length || importing}>
                    {importing ? 'Importing...' : 'Run Import'}
                </Button>
            </div>

            {data.length > 0 && (
                <div className="bg-white rounded shadow overflow-x-auto">
                    <table className="w-full text-xs text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-2">Title</th>
                                <th className="p-2">Date</th>
                                <th className="p-2">Venue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((d, i) => (
                                <tr key={i} className="border-b">
                                    <td className="p-2">{d.title}</td>
                                    <td className="p-2">{format(d.startAt, 'yyyy-MM-dd HH:mm')}</td>
                                    <td className="p-2">{d.venueName}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
