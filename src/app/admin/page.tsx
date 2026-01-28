'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from 'sonner'

export default function AdminLogin() {
    const router = useRouter()
    const [password, setPassword] = useState('')

    const handleLogin = async () => {
        const res = await fetch('/api/admin/login', {
            method: 'POST',
            body: JSON.stringify({ password })
        })
        if (res.ok) {
            toast.success("Login Successful")
            router.push('/admin/events')
        } else {
            toast.error("Invalid Password")
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100">
            <Card className="w-80">
                <CardHeader>
                    <CardTitle>Admin Access</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button className="w-full" onClick={handleLogin}>
                        Login
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
