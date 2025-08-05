import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Test if we can create a simple content entry
    const testKey = 'test-content-' + Date.now()
    const { data, error } = await supabase
      .from('site_content')
      .insert({
        key: testKey,
        content: 'Test content for real-time sync'
      })
      .select()

    if (error) {
      return NextResponse.json({ 
        error: 'Cannot create content: ' + error.message,
        hint: 'Database table may not exist'
      }, { status: 500 })
    }

    // Clean up test entry
    await supabase
      .from('site_content')
      .delete()
      .eq('key', testKey)

    return NextResponse.json({ 
      success: true, 
      message: 'Real-time sync is ready to work!',
      testData: data
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Test failed: ' + error.message 
    }, { status: 500 })
  }
}
