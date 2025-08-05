'use client'

import React, { useState, useEffect, useCallback } from "react"
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
  const [error, setError] = useState<string | null>(null)

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
      
      if (!session?.user) {
        setIsAdmin(false)
        setAdminCheckComplete(true)
        return
      }

      // Try to get profile with error handling
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
      
      if (error) {
        // If we can't fetch profile, default to non-admin but still complete check
        setIsAdmin(false)
        setAdminCheckComplete(true)
        return
      }
      
      // Handle case where user has no profile (non-admin user)
      if (!profiles || profiles.length === 0) {
        // No profile = not an admin = can't edit
        setIsAdmin(false)
        setAdminCheckComplete(true)
        return
      }
      
      const profile = profiles[0]
      const adminStatus = profile?.is_admin || false
      setIsAdmin(adminStatus)
      setAdminCheckComplete(true)
      
    } catch (error) {
      setIsAdmin(false)
      setAdminCheckComplete(true)
    }
  }

  const loadContent = async () => {
    try {
      // Always try database first for the most up-to-date content
      const { data, error } = await supabase
        .from('site_content')
        .select('content')
        .eq('key', contentKey)
        .maybeSingle()
      
      if (!error && data?.content) {
        // Database content found - use it and clear local storage
        setContent(data.content)
        setOriginalContent(data.content)
        localStorage.removeItem(`content_${contentKey}`)
        return
      }
      
      // If database fails or no content, check localStorage
      const localContent = localStorage.getItem(`content_${contentKey}`)
      if (localContent) {
        setContent(localContent)
        setOriginalContent(localContent)
        return
      }

      // Finally, use the default content from children
      const textContent = extractTextFromChildren(children)
      setContent(textContent)
      setOriginalContent(textContent)
      
    } catch (error) {
      console.warn(`Load error for ${contentKey}:`, error)
      // Fallback to localStorage then children
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

  const extractTextFromChildren = useCallback((children: React.ReactNode): string => {
    if (typeof children === 'string') return children
    if (typeof children === 'number') return String(children)
    if (React.isValidElement(children)) {
      return extractTextFromChildren(children.props.children)
    }
    if (Array.isArray(children)) {
      return children.map(extractTextFromChildren).join(' ')
    }
    return ''
  }, [])

  const handleSave = useCallback(async () => {
    if (!isAdmin) return
    
    setLoading(true)
    setError(null)
    
    try {
      // Use upsert which handles both insert and update automatically
      const { error } = await supabase
        .from('site_content')
        .upsert({
          key: contentKey,
          content: content.trim(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'  // Specify the conflict resolution column
        })
      
      if (error) {
        console.error('Database save error:', error)
        setError('Database save failed, saved locally')
        localStorage.setItem(`content_${contentKey}`, content.trim())
      } else {
        // Clear any previous local storage since database save succeeded
        localStorage.removeItem(`content_${contentKey}`)
      }
      
      setOriginalContent(content.trim())
      setIsEditing(false)
    } catch (error) {
      console.error('Save error:', error)
      setError('Connection failed, saved locally')
      localStorage.setItem(`content_${contentKey}`, content.trim())
      setOriginalContent(content.trim())
      setIsEditing(false)
    } finally {
      setLoading(false)
    }
  }, [content, contentKey, isAdmin])

  const handleCancel = useCallback(() => {
    setContent(originalContent)
    setIsEditing(false)
    setError(null)
  }, [originalContent])

  const handleEdit = useCallback(() => {
    setIsEditing(true)
    setError(null)
  }, [])

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
      {/* Syncing indicator */}
      {syncing && (
        <div className="absolute top-0 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-br-md z-50 animate-pulse">
          Updating...
        </div>
      )}
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 border rounded-lg resize-none min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ ...style, backgroundColor: 'white', color: '#333' }}
            placeholder="Enter content..."
          />
          {error && (
            <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
              {error}
            </div>
          )}
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={loading || !content.trim()}
              className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-1" />
              {loading ? 'Saving...' : 'Save'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="disabled:opacity-50"
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
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white/90 hover:bg-white shadow-sm"
            title="Edit content"
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
