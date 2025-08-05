import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test basic connection
    const { data, error, count } = await supabase
      .from('events')
      .select('*', { count: 'exact' })
    
    if (error) {
      return NextResponse.json({ 
        error: error.message, 
        code: error.code,
        details: error.details,
        hint: error.hint
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      eventCount: count,
      events: data?.slice(0, 3) || [], // Return first 3 events for testing
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Unexpected error',
      message: error.message 
    }, { status: 500 })
  }
}
