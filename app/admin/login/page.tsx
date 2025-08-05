"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { Rocket } from "lucide-react"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [showInviteCode, setShowInviteCode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (isSignUp) {
        // Sign up new user - bypass email confirmation
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        })

        if (signUpError) throw signUpError

        if (data.user) {
          // Skip email confirmation and go directly to invite code
          setShowInviteCode(true)
          setLoading(false)
          return
        }
      } else {
        // Sign in existing user
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) throw signInError

        // Check if user is admin
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", (await supabase.auth.getUser()).data.user?.id)
          .single()

        if (!profile?.is_admin) {
          throw new Error("Access denied. Admin privileges required.")
        }

        router.push("/admin")
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInviteCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Server-side verification of invite code
      const response = await fetch("/api/admin/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          inviteCode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify admin code")
      }

      // Now try to sign in the user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        throw new Error("Admin status updated, but sign-in failed. Please try signing in again.")
      }

      router.push("/admin")
    } catch (error: any) {
      console.error("Invite code error:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (showInviteCode) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md rounded-2xl">
          <CardHeader className="text-center">
            <div className="bg-gradient-to-br from-indigo-500 to-cyan-500 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Enter Admin Code</CardTitle>
            <CardDescription>Enter the admin invite code to complete your registration</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInviteCode} className="space-y-4">
              <div>
                <Label htmlFor="inviteCode">Admin Invite Code</Label>
                <Input
                  id="inviteCode"
                  type="password"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  required
                  className="rounded-2xl"
                />
              </div>

              {error && (
                <Alert className="rounded-2xl border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 rounded-2xl"
              >
                {loading ? "Verifying..." : "Complete Registration"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md rounded-2xl">
        <CardHeader className="text-center">
          <div className="bg-gradient-to-br from-indigo-500 to-cyan-500 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl">{isSignUp ? "Create Admin Account" : "Admin Login"}</CardTitle>
          <CardDescription>
            {isSignUp ? "Sign up to manage STEM For All events" : "Sign in to access the admin dashboard"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-2xl"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-2xl"
              />
            </div>

            {error && (
              <Alert className="rounded-2xl border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 rounded-2xl"
            >
              {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
            </Button>

            <Button type="button" variant="ghost" onClick={() => setIsSignUp(!isSignUp)} className="w-full rounded-2xl">
              {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
