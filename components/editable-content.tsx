'use client'

import React, { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Edit, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EditableContentProps {
  contentKey: string
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export function EditableContent({ contentKey, children, className, style }: EditableContentProps) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminCheckComplete, setAdminCheckComplete] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState("")
  const [originalContent, setOriginalContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    checkAdminStatus()
    loadContent()
    
    // Set up real-time subscription for content changes
    const subscription = supabase
      .channel(`content-${contentKey}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'site_content',
          filter: `key=eq.${contentKey}`
        }, 
        (payload) => {
          console.log('Real-time content update:', payload)
          if (payload.new && typeof payload.new === 'object' && 'content' in payload.new) {
            const newContent = (payload.new as any).content
            setSyncing(true)
            setContent(newContent)
            setOriginalContent(newContent)
            // Clear syncing indicator after a short delay
            setTimeout(() => setSyncing(false), 1000)
          }
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [contentKey])

  const checkAdminStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Checking admin status, session:', !!session?.user)
      
      if (session?.user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single()
        
        if (error) {
          console.error('Error fetching profile:', error)
          setIsAdmin(false)
          setAdminCheckComplete(true)
          return
        }
        
        console.log('Profile data:', profile)
        const adminStatus = profile?.is_admin || false
        setIsAdmin(adminStatus)
        console.log('Admin status set to:', adminStatus)
      } else {
        console.log('No session found - user is not logged in')
        setIsAdmin(false)
      }
      setAdminCheckComplete(true)
    } catch (error) {
      console.error('Error checking admin status:', error)
      setIsAdmin(false)
      setAdminCheckComplete(true)
    }
  }

  const loadContent = async () => {
    try {
      // First try database for latest content
      const { data } = await supabase
        .from('site_content')
        .select('content')
        .eq('key', contentKey)
        .single()
      
      if (data?.content) {
        setContent(data.content)
        setOriginalContent(data.content)
        return
      }

      // Fallback to localStorage if no database content
      const localContent = localStorage.getItem(`content_${contentKey}`)
      if (localContent) {
        setContent(localContent)
        setOriginalContent(localContent)
        return
      }

      // Finally, extract text content from children if no saved content
      const textContent = extractTextFromChildren(children)
      setContent(textContent)
      setOriginalContent(textContent)
    } catch (error) {
      // If table doesn't exist, try localStorage then fallback to children
      console.log('Database unavailable, trying localStorage for', contentKey)
      const localContent = localStorage.getItem(`content_${contentKey}`)
      if (localContent) {
        setContent(localContent)
        setOriginalContent(localContent)
      } else {
        const textContent = extractTextFromChildren(children)
        setContent(textContent)
        setOriginalContent(textContent)
      }
    }
  }

  const extractTextFromChildren = (children: React.ReactNode): string => {
    if (typeof children === 'string') return children
    if (typeof children === 'number') return String(children)
    if (React.isValidElement(children)) {
      return extractTextFromChildren(children.props.children)
    }
    if (Array.isArray(children)) {
      return children.map(extractTextFromChildren).join(' ')
    }
    return ''
  }

  const handleSave = async () => {
    if (!content.trim()) return
    
    setLoading(true)
    try {
      // Try to save to database first
      const { error } = await supabase
        .from('site_content')
        .upsert({
          key: contentKey,
          content: content,
          updated_at: new Date().toISOString()
        })
      
      if (error) {
        console.log('Database save failed:', error.message)
        // Fallback to localStorage
        localStorage.setItem(`content_${contentKey}`, content)
        alert('Saved locally. Database may not be available.')
      } else {
        console.log('Content saved to database successfully')
        // Also save to localStorage as backup
        localStorage.setItem(`content_${contentKey}`, content)
      }
      
      setOriginalContent(content)
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving content:', error)
      // Still allow local editing via localStorage
      localStorage.setItem(`content_${contentKey}`, content)
      setOriginalContent(content)
      setIsEditing(false)
      alert('Saved locally only. Database connection failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setContent(originalContent)
    setIsEditing(false)
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  if (!adminCheckComplete) {
    // Don't show anything until we've checked admin status
    return <div className={className} style={style}>{children}</div>
  }

  if (!isAdmin) {
    // For non-admin users, show saved content or original children
    if (originalContent && originalContent !== extractTextFromChildren(children)) {
      return (
        <div className={className} style={style}>
          {originalContent}
        </div>
      )
    }
    return <div className={className} style={style}>{children}</div>
  }

  return (
    <div className="relative group">
      {/* Debug indicator for admin mode */}
      {isAdmin && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded z-50">
          ADMIN
        </div>
      )}
      {/* Syncing indicator */}
      {syncing && (
        <div className="absolute -top-2 -left-2 bg-blue-500 text-white text-xs px-1 rounded z-50 animate-pulse">
          SYNC
        </div>
      )}
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 border rounded-lg resize-none min-h-[100px]"
            style={{ ...style, backgroundColor: 'white', color: '#333' }}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className={className} style={style}>
          {originalContent || children}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleEdit}
            className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white"
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
