'use client'

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Toaster } from "@/components/ui/sonner"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    // Don't show nav on login
    if (pathname === '/admin') return <>{children}<Toaster /></>

    const nav = [
        { label: 'Events', href: '/admin/events' },
        { label: 'Import CSV', href: '/admin/import' },
    ]

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="bg-white border-b px-4 py-3 flex justify-between items-center">
                <div className="font-bold text-lg">KES Admin</div>
                <div className="flex gap-4">
                    {nav.map(n => (
                        <Link key={n.href} href={n.href} className={`text-sm font-medium ${pathname === n.href ? 'text-primary' : 'text-slate-500 hover:text-slate-900'}`}>{n.label}</Link>
                    ))}
                    <Button variant="ghost" size="sm" onClick={() => {
                        document.cookie = 'kes_admin_session=; Max-Age=0; path=/;'
                        window.location.href = '/admin'
                    }}>Logout</Button>
                </div>
            </nav>
            <main className="p-6 max-w-5xl mx-auto">
                {children}
            </main>
            <Toaster />
        </div>
    )
}
