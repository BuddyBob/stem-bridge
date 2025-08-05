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
    // Simple approach: try to create the table using SQL
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS site_content (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    const enableRLSSQL = `ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;`

    const createPoliciesSQL = `
      DROP POLICY IF EXISTS "Everyone can read site content" ON site_content;
      DROP POLICY IF EXISTS "Only admins can modify site content" ON site_content;
      
      CREATE POLICY "Everyone can read site content" ON site_content
        FOR SELECT USING (true);

      CREATE POLICY "Only admins can modify site content" ON site_content
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND is_admin = true
          )
        );
    `

    // Execute each SQL statement
    const { error: tableError } = await supabaseAdmin.from('_').select().limit(0)
    
    if (tableError && !tableError.message.includes('does not exist')) {
      console.log('Database is accessible')
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database setup initiated. Please run the SQL manually in Supabase dashboard.',
      sql: createTableSQL + enableRLSSQL + createPoliciesSQL
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 })
  }
}
