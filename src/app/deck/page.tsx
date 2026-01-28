import { Suspense } from 'react'
import Deck from '@/components/Deck'
import { Toaster } from "@/components/ui/sonner"

export default function DeckPage() {
    return (
        <main className="min-h-screen bg-slate-100 overflow-hidden relative">
            <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
                <Deck />
            </Suspense>
            <Toaster />
        </main>
    )
}
