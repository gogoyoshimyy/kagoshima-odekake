"use client"

import React, { useRef, useState, useEffect } from "react"
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion"

interface InterestSliderProps {
    value: number
    onChange: (value: number) => void
    disabled?: boolean
}

export default function InterestSlider({ value, onChange, disabled = false }: InterestSliderProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)

    // Motion values for smooth animation
    const x = useMotionValue(0)
    const springX = useSpring(x, { stiffness: 300, damping: 30 })

    // Map percentage to background color
    const backgroundColor = useTransform(
        x,
        [0, 100],
        ["#cbd5e1", "#f43f5e"] // Slate-300 to Rose-500
    )

    const handleDrag = (event: any, info: any) => {
        if (disabled) return
        const container = containerRef.current
        if (!container) return

        const rect = container.getBoundingClientRect()
        const width = rect.width
        const newX = Math.max(0, Math.min(width, info.point.x - rect.left))
        const percent = Math.round((newX / width) * 100)

        x.set(percent)
        onChange(percent)
    }

    // Sync external value to internal motion value
    useEffect(() => {
        if (!isDragging) {
            x.set(value)
        }
    }, [value, isDragging, x])

    return (
        <div className="w-full space-y-4">
            <div className="flex justify-between items-end px-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Interest Level</span>
                <motion.span
                    className="text-3xl font-black italic premium-text-gradient"
                    style={{ scale: useTransform(x, [0, 100], [1, 1.2]) }}
                >
                    {Math.round(value)}%
                </motion.span>
            </div>

            <div
                ref={containerRef}
                className="relative h-12 w-full bg-slate-100 rounded-full cursor-pointer touch-none overflow-hidden border-2 border-slate-200/50"
                onClick={(e) => {
                    const rect = containerRef.current?.getBoundingClientRect()
                    if (rect) {
                        const clickX = e.clientX - rect.left
                        const percent = Math.round((clickX / rect.width) * 100)
                        onChange(percent)
                    }
                }}
            >
                {/* Track Background Gradient Fill */}
                <motion.div
                    className="absolute inset-0 origin-left"
                    style={{
                        scaleX: useTransform(x, [0, 100], [0, 1]),
                        background: "linear-gradient(90deg, #f43f5e, #fb923c)" // Rose to Orange
                    }}
                />

                {/* Thumb / Handle */}
                <motion.div
                    drag="x"
                    dragConstraints={containerRef}
                    dragElastic={0}
                    dragMomentum={false}
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={() => setIsDragging(false)}
                    onDrag={(e, info) => {
                        const rect = containerRef.current?.getBoundingClientRect()
                        if (rect) {
                            const newX = Math.max(0, Math.min(rect.width, info.point.x - rect.left))
                            onChange(Math.round((newX / rect.width) * 100))
                        }
                    }}
                    style={{ x: useTransform(x, [0, 100], ["0%", "92%"]) }} // Adjust for thumb width
                    className="absolute inset-y-1 left-1 w-12 h-10 bg-white rounded-full shadow-lg z-10 flex items-center justify-center cursor-grab active:cursor-grabbing border-2 border-white"
                >
                    <div className="flex gap-0.5">
                        <div className="w-0.5 h-3 bg-slate-300 rounded-full" />
                        <div className="w-0.5 h-3 bg-slate-300 rounded-full" />
                        <div className="w-0.5 h-3 bg-slate-300 rounded-full" />
                    </div>
                </motion.div>
            </div>

            <div className="flex justify-between px-2 text-[10px] font-bold text-slate-400 uppercase">
                <span>Not at all</span>
                <span>Definitely going</span>
            </div>
        </div>
    )
}
