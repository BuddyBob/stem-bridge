import Link from "next/link"
import { Clock, MapPin, Monitor, Users } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Database } from "@/lib/supabase"

type Event = Database["public"]["Tables"]["events"]["Row"]

interface EventCardProps {
  event: Event
}

export function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.date)
  const isUpcoming = eventDate >= new Date()

  const formatIcon = {
    virtual: Monitor,
    in_person: MapPin,
    hybrid: Users,
  }

  const FormatIcon = event.format ? formatIcon[event.format] : null

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 rounded-lg border-2" 
            style={{ borderColor: '#8cbcb6' }}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="text-white p-4 rounded-lg min-w-[80px] text-center" 
                 style={{ backgroundColor: '#8a427a' }}>
              <div className="text-2xl font-bold">{eventDate.getDate()}</div>
              <div className="text-sm opacity-90">{eventDate.toLocaleDateString("en-US", { month: "short" })}</div>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg group-hover:transition-colors line-clamp-2"
                  style={{ color: '#8a427a' }}>
                {event.title}
              </h3>
              <div className="flex items-center gap-4 mt-2 text-sm" style={{ color: '#2c6d0d' }}>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(`2000-01-01T${event.start_time}`).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </div>
                {event.format && FormatIcon && (
                  <div className="flex items-center gap-1">
                    <FormatIcon className="w-4 h-4" />
                    <span className="capitalize">{event.format.replace("_", " ")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm line-clamp-3 mb-3" style={{ color: '#8a427a' }}>{event.short_description}</p>
          {event.location && (
            <div className="flex items-center gap-1 text-sm mb-2" style={{ color: '#2c6d0d' }}>
              <MapPin className="w-4 h-4" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <Badge
              variant={isUpcoming ? "default" : "secondary"}
              className={isUpcoming ? "" : ""}
              style={isUpcoming ? 
                { backgroundColor: '#8cbcb6', color: 'white' } : 
                { backgroundColor: '#e1cfe7', color: '#8a427a' }
              }
            >
              {isUpcoming ? "Upcoming" : "Past Event"}
            </Badge>
            <span className="text-xs" style={{ color: '#8cbcb6' }}>{event.signup_clicks} signups</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
