"use client"

import type React from "react"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface EventSearchProps {
  onSearch: (query: string) => void
  onToggleFilter: (filter: "upcoming" | "past") => void
  currentFilter: "upcoming" | "past"
}

export function EventSearch({ onSearch, onToggleFilter, currentFilter }: EventSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#8a427a' }} />
        <Input
          type="text"
          placeholder="Search events by title or description..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            onSearch(e.target.value)
          }}
          className="pl-10 py-3 rounded-lg border-2"
          style={{ borderColor: '#8cbcb6' }}
        />
      </form>

      <div className="flex gap-2">
        <Button
          variant={currentFilter === "upcoming" ? "default" : "outline"}
          onClick={() => onToggleFilter("upcoming")}
          className="rounded-lg"
          style={currentFilter === "upcoming" ? 
            { backgroundColor: '#8a427a', color: 'white' } : 
            { borderColor: '#8a427a', color: '#8a427a', backgroundColor: 'transparent' }
          }
        >
          Upcoming Events
        </Button>
        <Button
          variant={currentFilter === "past" ? "default" : "outline"}
          onClick={() => onToggleFilter("past")}
          className="rounded-lg"
          style={currentFilter === "past" ? 
            { backgroundColor: '#8a427a', color: 'white' } : 
            { borderColor: '#8a427a', color: '#8a427a', backgroundColor: 'transparent' }
          }
        >
          Past Events
        </Button>
      </div>
    </div>
  )
}
