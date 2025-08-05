import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test table access with a simple select
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .limit(5)
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        statusCode: error.code === 'PGRST301' ? 406 : 500
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Table access working',
      rowCount: data?.length || 0,
      data: data
    })
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
      type: 'Connection Error'
    }, { status: 500 })
  }
}
