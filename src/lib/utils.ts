import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth radius in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c // Distance in km
  return Math.round(d * 10) / 10 // Round to 1 decimal place
}

// Google Calendar URL Generator
export function generateGoogleCalendarUrl(event: any): string {
  const formatDate = (dateString: string) => {
    return dateString.replace(/-|:|\.\d\d\d/g, "")
  }

  // Handle string dates safely
  let start: Date;
  try {
    start = new Date(event.startAt);
    // Check if date is valid
    if (isNaN(start.getTime())) {
      // If invalid, use current date as fallback
      start = new Date();
    }
  } catch (error) {
    start = new Date();
  }

  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000) // Assume 2 hours duration

  const startStr = formatDate(start.toISOString())
  const endStr = formatDate(end.toISOString())

  const details = `
    ${event.descriptionShort || ''}
    \n\n場所: ${event.venueName || ''}
    \nURL: ${typeof window !== 'undefined' ? window.location.href : 'https://kagoshima-odekakes.vercel.app/event/' + event.id}
  `.trim()

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startStr}/${endStr}`,
    details: details,
    location: event.venueName || '',
  })

  return `https://www.google.com/calendar/render?${params.toString()}`
}

// Simple Recommendation Logic
export function findRecommendations(currentEvent: any, allEvents: any[]): any[] {
  if (!currentEvent || !allEvents) return []

  const currentDate = new Date(currentEvent.startAt).toDateString()

  return allEvents
    .filter(e => e.id !== currentEvent.id) // Exclude current
    .map(e => {
      let score = 0
      // Same day bonus
      if (new Date(e.startAt).toDateString() === currentDate) score += 10
      // Same area bonus
      if (e.area === currentEvent.area) score += 5
      return { ...e, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3) // Top 3
}

export function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}
