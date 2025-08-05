"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function NewEventPage() {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    start_time: "",
    format: "",
    location: "",
    short_description: "",
    description: "",
    signup_link: "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/admin/login")
      return
    }

    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

    if (!profile?.is_admin) {
      router.push("/admin/login")
      return
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `event-images/${fileName}`

      const { error: uploadError } = await supabase.storage.from("images").upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from("images").getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error("Error uploading image:", error)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      // Validation
      if (
        !formData.title ||
        !formData.date ||
        !formData.start_time ||
        !formData.short_description ||
        !formData.signup_link
      ) {
        throw new Error("Please fill in all required fields")
      }

      if (!formData.signup_link.startsWith("https://")) {
        throw new Error("Signup link must start with https://")
      }

      if (formData.short_description.length > 160) {
        throw new Error("Short description must be 160 characters or less")
      }

      // Check if date is in the past (warning only)
      const eventDate = new Date(formData.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (eventDate < today) {
        if (!confirm("This event date is in the past. Are you sure you want to continue?")) {
          setLoading(false)
          return
        }
      }

      // Upload image if provided
      let imageUrl = null
      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      // Create event
      const { error: insertError } = await supabase.from("events").insert({
        ...formData,
        image_url: imageUrl,
        created_by: user.id,
      })

      if (insertError) throw insertError

      setSuccess("Event created successfully!")
      setTimeout(() => {
        router.push("/admin")
      }, 1500)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/admin">
            <Button variant="outline" className="rounded-2xl bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Create New Event</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="rounded-2xl"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    className="rounded-2xl"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="start_time">Start Time *</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => handleInputChange("start_time", e.target.value)}
                    className="rounded-2xl"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="format">Format</Label>
                  <Select onValueChange={(value) => handleInputChange("format", value)}>
                    <SelectTrigger className="rounded-2xl">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="virtual">Virtual</SelectItem>
                      <SelectItem value="in_person">In Person</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  className="rounded-2xl"
                  placeholder="Enter location (if applicable)"
                />
              </div>

              <div>
                <Label htmlFor="short_description">Short Description * (max 160 characters)</Label>
                <Textarea
                  id="short_description"
                  value={formData.short_description}
                  onChange={(e) => handleInputChange("short_description", e.target.value)}
                  className="rounded-2xl"
                  maxLength={160}
                  required
                />
                <p className="text-sm text-slate-500 mt-1">{formData.short_description.length}/160 characters</p>
              </div>

              <div>
                <Label htmlFor="description">Full Description (Markdown supported)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="rounded-2xl min-h-[200px]"
                  placeholder="Enter detailed description using Markdown formatting..."
                />
              </div>

              <div>
                <Label htmlFor="image">Event Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="rounded-2xl"
                />
              </div>

              <div>
                <Label htmlFor="signup_link">Signup Link * (must start with https://)</Label>
                <Input
                  id="signup_link"
                  type="url"
                  value={formData.signup_link}
                  onChange={(e) => handleInputChange("signup_link", e.target.value)}
                  className="rounded-2xl"
                  placeholder="https://forms.google.com/..."
                  required
                />
              </div>

              {error && (
                <Alert className="rounded-2xl border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="rounded-2xl border-green-200 bg-green-50">
                  <AlertDescription className="text-green-700">{success}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 rounded-2xl"
                >
                  {loading ? "Creating Event..." : "Create Event"}
                </Button>
                <Link href="/admin">
                  <Button type="button" variant="outline" className="rounded-2xl bg-transparent">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
