"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, Edit, Trash2, Calendar, Users, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/supabase"

type Event = Database["public"]["Tables"]["events"]["Row"]

export default function AdminDashboard() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchEvents()
  }, [])

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/admin/login")
      return
    }

    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

    if (!profile?.is_admin) {
      router.push("/admin/login")
      return
    }
  }

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase.from("events").select("*").order("date", { ascending: false })

      if (error) throw error
      setEvents(data || [])
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return

    try {
      const { error } = await supabase.from("events").delete().eq("id", eventId)

      if (error) throw error

      setEvents(events.filter((event) => event.id !== eventId))
    } catch (error: any) {
      setError(error.message)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b-2 border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <Link href="/admin/new">
                <Button className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 rounded-2xl">
                  <Plus className="w-4 h-4 mr-2" />
                  New Event
                </Button>
              </Link>
              <Button variant="outline" onClick={handleSignOut} className="rounded-2xl bg-transparent">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert className="mb-6 rounded-2xl border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6">
          {events.length === 0 ? (
            <Card className="rounded-2xl">
              <CardContent className="text-center py-12">
                <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">No events yet</h3>
                <p className="text-slate-600 mb-4">Create your first event to get started!</p>
                <Link href="/admin/new">
                  <Button className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 rounded-2xl">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            events.map((event) => {
              const eventDate = new Date(event.date)
              const isUpcoming = eventDate >= new Date()

              return (
                <Card key={event.id} className="rounded-2xl">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {eventDate.toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {event.signup_clicks} signups
                          </div>
                          <Badge variant={isUpcoming ? "default" : "secondary"}>
                            {isUpcoming ? "Upcoming" : "Past"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/edit/${event.id}`}>
                          <Button variant="outline" size="sm" className="rounded-2xl bg-transparent">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(event.id)}
                          className="rounded-2xl text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 text-sm line-clamp-2">{event.short_description}</p>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
