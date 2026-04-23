import { api } from '@/lib/api'
import { useEffect, useRef, useCallback } from 'react'



interface TelemetryEvent {
  event_type: 'keystroke' | 'paste' | 'tab_switch' | 'focus_lost' | 'mouse_idle' | 'fullscreen_exit' | 'screenshot_attempt' | 'no_face' | 'multiple_faces'
  event_data: Record<string, unknown>
  timestamp: number
}

export function useTelemetry(sessionId: string, questionId: string, isActive: boolean) {
  const buffer = useRef<TelemetryEvent[]>([])
  const lastKeyTime = useRef<number>(0)
  const flushTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const flush = useCallback(async () => {
    if (!buffer.current.length || !isActive) return
    const events = [...buffer.current]
    buffer.current = []

    try {
      await api.post(`/api/student/assessment/${sessionId}/telemetry`, {
        questionId,
        events
      })
    } catch {
      // Silently fail — telemetry is non-critical
    }
  }, [sessionId, questionId, isActive])

  // Expose pushEvent for external callers (e.g. fullscreen_exit, screenshot_attempt)
  const pushEvent = useCallback((eventType: TelemetryEvent['event_type'], eventData: Record<string, unknown> = {}) => {
    buffer.current.push({
      event_type: eventType,
      event_data: eventData,
      timestamp: Date.now()
    })
    // Flush immediately for critical events
    if (eventType === 'fullscreen_exit' || eventType === 'screenshot_attempt') {
      flush()
    }
  }, [flush])

  // Schedule batch flush every 3 seconds
  useEffect(() => {
    if (!isActive) return
    flushTimer.current = setInterval(flush, 3000)
    return () => {
      if (flushTimer.current) clearInterval(flushTimer.current)
      flush()  // Final flush on unmount
    }
  }, [flush, isActive])

  // Keystroke tracker
  useEffect(() => {
    if (!isActive) return

    const handleKeydown = (e: KeyboardEvent) => {
      const now = Date.now()
      const timeSinceLast = lastKeyTime.current ? now - lastKeyTime.current : 0
      lastKeyTime.current = now

      buffer.current.push({
        event_type: 'keystroke',
        event_data: {
          key_length: e.key.length,  // 1 = normal char, >1 = special key
          time_since_last_ms: timeSinceLast,
          is_special: e.key.length > 1,
        },
        timestamp: now
      })
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [isActive])

  // Paste tracker
  useEffect(() => {
    if (!isActive) return

    const handlePaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text') || ''
      buffer.current.push({
        event_type: 'paste',
        event_data: {
          pasted_length: text.length,
          pasted_word_count: text.split(/\s+/).length,
          is_large_paste: text.length > 200
        },
        timestamp: Date.now()
      })
    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [isActive])

  // Tab switch / focus loss tracker
  useEffect(() => {
    if (!isActive) return

    const handleVisibilityChange = () => {
      buffer.current.push({
        event_type: document.hidden ? 'tab_switch' : 'focus_lost',
        event_data: { hidden: document.hidden },
        timestamp: Date.now()
      })
      if (!document.hidden) {
        flush()  // Flush immediately on return
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isActive, flush])

  // Mouse idle tracker (no mouse movement for >5s)
  useEffect(() => {
    if (!isActive) return
    let idleTimer: ReturnType<typeof setTimeout>
    let lastMoveTime = Date.now()

    const handleMouseMove = () => {
      lastMoveTime = Date.now()
      clearTimeout(idleTimer)
      idleTimer = setTimeout(() => {
        buffer.current.push({
          event_type: 'mouse_idle',
          event_data: { idle_ms: Date.now() - lastMoveTime },
          timestamp: Date.now()
        })
      }, 5000)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(idleTimer)
    }
  }, [isActive])

  return { pushEvent }
}

