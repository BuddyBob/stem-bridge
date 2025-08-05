"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { EventCard } from "@/components/event-card"
import { EventSearch } from "@/components/event-search"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/supabase"

type Event = Database["public"]["Tables"]["events"]["Row"]

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"upcoming" | "past">("upcoming")

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    filterEvents()
  }, [events, searchQuery, filter])

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase.from("events").select("*").order("date", { ascending: false })

      if (error) {
        throw error
      }
      
      setEvents(data || [])
    } catch (error) {
      // Set an empty array so the loading state ends
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const filterEvents = () => {
    let filtered = events

    // Filter by upcoming/past
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    filtered = filtered.filter((event) => {
      const eventDate = new Date(event.date)
      eventDate.setHours(0, 0, 0, 0)

      if (filter === "upcoming") {
        return eventDate >= today
      } else {
        return eventDate < today
      }
    })

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.short_description.toLowerCase().includes(query) ||
          (event.description && event.description.toLowerCase().includes(query)),
      )
    }

    // Sort upcoming events by date ascending, past events by date descending
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()

      if (filter === "upcoming") {
        return dateA - dateB
      } else {
        return dateB - dateA
      }
    })

    setFilteredEvents(filtered)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleToggleFilter = (newFilter: "upcoming" | "past") => {
    setFilter(newFilter)
  }

  if (loading) {
    return (
      <div className="min-h-screen py-12" style={{ backgroundColor: '#e1cfe7' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#8a427a' }}></div>
            <p className="mt-4" style={{ color: '#8a427a' }}>Loading events...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <section className="relative h-64 md:h-80">
        <div className="absolute inset-0">
          <Image
            src="/stem.jpeg"
            alt="STEM Events"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(138, 66, 122, 0.7)' }}></div>
        </div>
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">STEM Events</h1>
            <p className="text-xl max-w-2xl mx-auto px-4">
              Discover amazing learning opportunities designed by students, for students
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="py-12" style={{ backgroundColor: '#e1cfe7' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-8">
          <EventSearch onSearch={handleSearch} onToggleFilter={handleToggleFilter} currentFilter={filter} />
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: '#8a427a' }}>No events found</h3>
            <p style={{ color: '#8a427a' }}>
              {searchQuery.trim()
                ? `No events match "${searchQuery}". Try a different search term.`
                : `No ${filter} events available right now. Check back soon!`}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
