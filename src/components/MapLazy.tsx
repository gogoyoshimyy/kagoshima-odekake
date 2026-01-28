'use client'

import dynamic from 'next/dynamic'

const Map = dynamic(() => import('./Map'), {
    ssr: false,
    loading: () => <div className="h-64 w-full bg-slate-200 animate-pulse rounded-lg">Loading Map...</div>
})

export default function MapLazy(props: { lat: number, lng: number, venue: string }) {
    return <Map {...props} />
}
