import { notFound } from "next/navigation"
import { Calendar, Clock, MapPin, Monitor, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { SignUpButton } from "@/components/signup-button"
import { supabase } from "@/lib/supabase"
import ReactMarkdown from "react-markdown"

interface EventPageProps {
  params: {
    id: string
  }
}

async function getEvent(id: string) {
  const { data: event, error } = await supabase.from("events").select("*").eq("id", id).single()

  if (error || !event) {
    return null
  }

  return event
}

export default async function EventPage({ params }: EventPageProps) {
  const event = await getEvent(params.id)

  if (!event) {
    notFound()
  }

  const eventDate = new Date(event.date)
  const isUpcoming = eventDate >= new Date()

  const formatIcon = {
    virtual: Monitor,
    in_person: MapPin,
    hybrid: Users,
  }

  const FormatIcon = event.format ? formatIcon[event.format] : null

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          {event.image_url && (
            <div className="h-64 bg-gradient-to-r from-indigo-500 to-cyan-500">
              <img
                src={event.image_url || "/placeholder.svg"}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            <div className="flex items-start justify-between gap-6 mb-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-slate-800 mb-4">{event.title}</h1>

                <div className="flex flex-wrap items-center gap-4 text-slate-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span className="font-medium">
                      {eventDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>
                      {new Date(`2000-01-01T${event.start_time}`).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>
                  </div>

                  {event.format && FormatIcon && (
                    <div className="flex items-center gap-2">
                      <FormatIcon className="w-5 h-5" />
                      <span className="capitalize">{event.format.replace("_", " ")}</span>
                    </div>
                  )}
                </div>

                {event.location && (
                  <div className="flex items-center gap-2 text-slate-600 mb-4">
                    <MapPin className="w-5 h-5" />
                    <span>{event.location}</span>
                  </div>
                )}

                <Badge
                  variant={isUpcoming ? "default" : "secondary"}
                  className={`mb-6 ${isUpcoming ? "bg-emerald-100 text-emerald-700" : ""}`}
                >
                  {isUpcoming ? "Upcoming Event" : "Past Event"}
                </Badge>
              </div>
            </div>

            <div className="prose prose-lg max-w-none mb-8">
              <p className="text-xl text-slate-700 font-medium mb-6">{event.short_description}</p>

              {event.description && (
                <div className="text-slate-600">
                  <ReactMarkdown>{event.description}</ReactMarkdown>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 pt-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex-1">
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> Signups happen on our partner platforms. We don't collect personal
                    information - your privacy is protected!
                  </p>
                </div>

                {isUpcoming && <SignUpButton eventId={event.id} signupLink={event.signup_link} />}
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-slate-500">{event.signup_clicks} students have signed up for this event</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
