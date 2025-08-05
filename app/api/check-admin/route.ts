import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      return NextResponse.json({ error: 'Session error: ' + sessionError.message })
    }

    if (!session?.user) {
      return NextResponse.json({ 
        loggedIn: false, 
        isAdmin: false, 
        message: 'No active session' 
      })
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin, email')
      .eq('id', session.user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ 
        loggedIn: true,
        isAdmin: false,
        error: 'Profile error: ' + profileError.message,
        userId: session.user.id
      })
    }

    return NextResponse.json({
      loggedIn: true,
      isAdmin: profile?.is_admin || false,
      email: profile?.email || session.user.email,
      userId: session.user.id
    })
  } catch (error: any) {
    return NextResponse.json({ error: 'Unexpected error: ' + error.message })
  }
}
