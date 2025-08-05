"use client"

import { useState } from "react"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

interface SignUpButtonProps {
  eventId: string
  signupLink: string
  className?: string
}

export function SignUpButton({ eventId, signupLink, className }: SignUpButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignUp = async () => {
    setIsLoading(true)

    try {
      // Increment the signup counter
      await supabase.rpc("increment_signup_clicks", { event_id: eventId })

      // Open the external signup link
      window.open(signupLink, "_blank", "noopener,noreferrer")
    } catch (error) {
      console.error("Error tracking signup:", error)
      // Still open the link even if tracking fails
      window.open(signupLink, "_blank", "noopener,noreferrer")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleSignUp}
      disabled={isLoading}
      size="lg"
      className={`bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-semibold py-3 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 ${className}`}
    >
      <ExternalLink className="w-5 h-5 mr-2" />
      {isLoading ? "Opening..." : "Sign Up Now"}
    </Button>
  )
}
