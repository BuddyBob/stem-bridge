import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const { email, inviteCode } = await request.json()

    // Verify invite code server-side
    if (inviteCode !== process.env.ADMIN_INVITE_CODE) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 400 }
      )
    }

    // Find the user by email using admin privileges
    const { data: users, error: usersError } = await supabaseServer.auth.admin.listUsers()
    
    if (usersError) {
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      )
    }
    
    const user = users.users.find(u => u.email === email)
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Create admin profile (upsert to handle existing profiles)
    const { error: profileError } = await supabaseServer
      .from("profiles")
      .upsert({ 
        id: user.id, 
        is_admin: true,
        created_at: new Date().toISOString()
      })

    if (profileError) {
      return NextResponse.json(
        { error: "Failed to create admin profile" },
        { status: 500 }
      )
    }

    // Manually confirm the user's email to bypass confirmation
    const { error: confirmError } = await supabaseServer.auth.admin.updateUserById(
      user.id,
      { email_confirm: true }
    )

    if (confirmError) {
      console.error("Failed to confirm email:", confirmError)
      // Don't fail the request for this - admin status is still updated
    }

    return NextResponse.json(
      { message: "Admin status updated successfully", userId: user.id },
      { status: 200 }
    )

  } catch (error) {
    console.error("Admin verification error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
