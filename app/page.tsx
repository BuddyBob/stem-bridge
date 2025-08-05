import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Search, ExternalLink, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EventCard } from "@/components/event-card"
import { EditableContent } from "@/components/editable-content"
import { supabase } from "@/lib/supabase"

async function getUpcomingEvents() {
  const today = new Date().toISOString().split("T")[0]

  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .gte("date", today)
    .order("date", { ascending: true })
    .limit(4)

  if (error) {
    console.error("Error fetching events:", error)
    return []
  }

  return events || []
}

export default async function HomePage() {
  const upcomingEvents = await getUpcomingEvents()

  return (
    <div className="min-h-screen">
      {/* Banner Section */}
      <section className="w-full">
        <div className="relative w-full h-64 md:h-80 lg:h-96">
          <Image
            src="/banner.jpg"
            alt="STEM Bridge Banner"
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>

      {/* Hero Section */}
      <section className="py-20" style={{ backgroundColor: '#e1cfe7' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">        <div className="text-center">
          <EditableContent
            contentKey="hero-title"
            className="text-5xl md:text-6xl font-bold mb-6"
            style={{ color: '#8a427a' }}
          >
            Students Helping{" "}
            <span style={{ color: '#2c6d0d' }}>
              Students
            </span>
          </EditableContent>
          <EditableContent
            contentKey="hero-description"
            className="text-xl mb-8 max-w-3xl mx-auto"
            style={{ color: '#8a427a' }}
          >
            Join our community of young innovators! Discover hands-on STEM workshops, coding bootcamps, and robotics
            adventures designed by students, for students.
          </EditableContent>
            <Link href="/events">
              <Button
                size="lg"
                className="text-white font-semibold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                style={{ backgroundColor: '#8cbcb6' }}
              >
                Explore Events
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Virtual Learning Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <EditableContent
                contentKey="virtual-learning-title"
                className="text-4xl font-bold mb-6"
                style={{ color: '#8a427a' }}
              >
                Learn From Anywhere
              </EditableContent>
              <EditableContent
                contentKey="virtual-learning-description"
                className="text-xl mb-6"
                style={{ color: '#2c6d0d' }}
              >
                Join students from around the world in our interactive virtual workshops. No matter where you are, 
                you can be part of our growing STEM community.
              </EditableContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#8cbcb6' }}></div>
                  <span style={{ color: '#8a427a' }}>Interactive live sessions with real-time Q&A</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#8cbcb6' }}></div>
                  <span style={{ color: '#8a427a' }}>Small group breakout rooms for hands-on practice</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#8cbcb6' }}></div>
                  <span style={{ color: '#8a427a' }}>Connect with peers and build lasting friendships</span>
                </div>
              </div>
            </div>
            <div className="relative h-96 rounded-lg overflow-hidden shadow-xl">
              <Image
                src="/studentzoom.jpg"
                alt="Students learning together online"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20" style={{ backgroundColor: '#8a427a' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-xl text-white">Getting started is easy! Follow these simple steps.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 rounded-lg flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform"
                   style={{ backgroundColor: '#8cbcb6' }}>
                <Search className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">1. Find</h3>
              <p className="text-white">
                Browse our upcoming STEM events and workshops. Filter by topic, format, or date to find what interests
                you most.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 rounded-lg flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform"
                   style={{ backgroundColor: '#2c6d0d' }}>
                <ExternalLink className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">2. Sign Up</h3>
              <p className="text-white">
                Click "Sign Up" to register through our partner platforms. We use trusted services like Google Forms and
                Calendly.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 rounded-lg flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform"
                   style={{ backgroundColor: '#8cbcb6' }}>
                <Calendar className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">3. Attend</h3>
              <p className="text-white">
                Join us for an amazing learning experience! Meet other students and dive into hands-on STEM activities.
              </p>
            </div>
          </div>

          {/* Add photo showcase */}
          <div className="mt-16 grid md:grid-cols-2 gap-8">
            <div className="relative h-64 rounded-lg overflow-hidden">
              <Image
                src="/AMERICANED_MC2_026.jpg"
                alt="Students learning together"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative h-64 rounded-lg overflow-hidden">
              <Image
                src="/stem.jpeg"
                alt="STEM activities"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <section className="py-20" style={{ backgroundColor: '#e1cfe7' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4" style={{ color: '#8a427a' }}>Upcoming Events</h2>
              <p className="text-xl" style={{ color: '#2c6d0d' }}>Don't miss out on these exciting learning opportunities!</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            <div className="text-center">
              <Link href="/events">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 rounded-lg bg-transparent hover:bg-purple-50"
                  style={{ 
                    borderColor: '#8a427a', 
                    color: '#8a427a' 
                  }}
                >
                  View All Events
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Student Success Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-96 rounded-lg overflow-hidden shadow-xl">
              <Image
                src="/AMERICANED_MC2_026.jpg"
                alt="Students engaged in learning"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <EditableContent
                contentKey="empowering-title"
                className="text-4xl font-bold mb-6"
                style={{ color: '#8a427a' }}
              >
                Empowering the Next Generation
              </EditableContent>
              <EditableContent
                contentKey="empowering-description"
                className="text-xl mb-6"
                style={{ color: '#2c6d0d' }}
              >
                Our student-led workshops create an environment where young minds can explore, 
                experiment, and excel in STEM fields. We believe in learning by doing.
              </EditableContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#e1cfe7' }}>
                  <EditableContent
                    contentKey="students-reached-number"
                    className="text-3xl font-bold"
                    style={{ color: '#8a427a' }}
                  >
                    500+
                  </EditableContent>
                  <EditableContent
                    contentKey="students-reached-label"
                    className="text-sm"
                    style={{ color: '#2c6d0d' }}
                  >
                    Students Reached
                  </EditableContent>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#e1cfe7' }}>
                  <EditableContent
                    contentKey="workshops-hosted-number"
                    className="text-3xl font-bold"
                    style={{ color: '#8a427a' }}
                  >
                    50+
                  </EditableContent>
                  <EditableContent
                    contentKey="workshops-hosted-label"
                    className="text-sm"
                    style={{ color: '#2c6d0d' }}
                  >
                    Workshops Hosted
                  </EditableContent>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
