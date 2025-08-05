import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create admin client for database operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST() {
  try {
    // Check if there are any admin users
    const { data: adminUsers, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('is_admin', true)
      .limit(1)

    if (adminError) {
      return NextResponse.json({ error: 'Error checking admin users: ' + adminError.message }, { status: 500 })
    }

    if (!adminUsers || adminUsers.length === 0) {
      return NextResponse.json({ 
        error: 'No admin users found. Please create an admin user first by going to /admin/login and signing up with the invite code.' 
      }, { status: 400 })
    }

    const adminUserId = adminUsers[0].id

    // Check if events already exist
    const { data: existingEvents, error: eventsError } = await supabaseAdmin
      .from('events')
      .select('id')
      .limit(1)

    if (eventsError) {
      return NextResponse.json({ error: 'Error checking existing events: ' + eventsError.message }, { status: 500 })
    }

    if (existingEvents && existingEvents.length > 0) {
      return NextResponse.json({ message: 'Events already exist in the database' })
    }

    // Insert sample events
    const sampleEvents = [
      {
        title: 'Introduction to Robotics',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        start_time: '14:00:00',
        format: 'in_person' as const,
        location: 'Community Center Room 101',
        short_description: 'Learn the basics of robotics and build your first robot! Perfect for beginners aged 8-14.',
        description: 'Join us for an exciting hands-on workshop where students will learn basic robotics concepts, build a simple robot, and program it to complete challenges.',
        signup_link: 'https://forms.google.com/robotics-intro',
        created_by: adminUserId
      },
      {
        title: 'Python Programming Bootcamp',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
        start_time: '10:00:00',
        format: 'virtual' as const,
        location: null,
        short_description: 'A comprehensive 3-day Python programming course for complete beginners.',
        description: 'Learn Python programming from scratch with hands-on projects and real-world applications.',
        signup_link: 'https://calendly.com/python-bootcamp',
        created_by: adminUserId
      },
      {
        title: 'Web Development Workshop',
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 21 days from now
        start_time: '13:00:00',
        format: 'hybrid' as const,
        location: 'Tech Hub Downtown',
        short_description: 'Create your first website using HTML, CSS, and JavaScript.',
        description: 'Build and deploy your own website while learning modern web development techniques.',
        signup_link: 'https://eventbrite.com/web-dev-workshop',
        created_by: adminUserId
      }
    ]

    const { data: insertedEvents, error: insertError } = await supabaseAdmin
      .from('events')
      .insert(sampleEvents)
      .select()

    if (insertError) {
      return NextResponse.json({ error: 'Error inserting events: ' + insertError.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully created ${insertedEvents?.length || 0} sample events`,
      events: insertedEvents 
    })
  } catch (error: any) {
    return NextResponse.json({ error: 'Unexpected error: ' + error.message }, { status: 500 })
  }
}
