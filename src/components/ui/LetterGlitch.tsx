"use client"

import { useRef, useEffect } from "react"
import { useTheme } from "next-themes"

const LetterGlitch = ({
  glitchSpeed = 50,
  centerVignette = false,
  outerVignette = true,
  smooth = true,
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789",
}) => {
  const { theme, resolvedTheme } = useTheme()

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number | null>(null)
  const letters = useRef<any[]>([])
  const grid = useRef({ columns: 0, rows: 0 })
  const context = useRef<CanvasRenderingContext2D | null>(null)
  const lastGlitchTime = useRef(Date.now())

  const lettersAndSymbols = Array.from(characters)

  const fontSize = 16
  const charWidth = 10
  const charHeight = 20

  /* ---------------- THEME COLORS ---------------- */

  const getThemeColors = () => {
    const isDark = resolvedTheme === "dark"

    return isDark
      ? ["#D4AF37", "#FFF2B8", "#C9A227", "#6B7280"] // dark mode
      : ["#1F2937", "#374151", "#9CA3AF", "#D4AF37"] // light mode
  }

  const getRandomChar = () => {
    return lettersAndSymbols[
      Math.floor(Math.random() * lettersAndSymbols.length)
    ]
  }

  const getRandomColor = () => {
    const colors = getThemeColors()
    return colors[Math.floor(Math.random() * colors.length)]
  }

  /* ---------------- COLOR UTILS ---------------- */

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null
  }

  const interpolateColor = (start: any, end: any, factor: number) => {
    return `rgb(${Math.round(
      start.r + (end.r - start.r) * factor
    )}, ${Math.round(start.g + (end.g - start.g) * factor)}, ${Math.round(
      start.b + (end.b - start.b) * factor
    )})`
  }

  /* ---------------- GRID ---------------- */

  const calculateGrid = (width: number, height: number) => {
    return {
      columns: Math.ceil(width / charWidth),
      rows: Math.ceil(height / charHeight),
    }
  }

  const initializeLetters = (columns: number, rows: number) => {
    grid.current = { columns, rows }
    const total = columns * rows

    letters.current = Array.from({ length: total }, () => ({
      char: getRandomChar(),
      color: getRandomColor(),
      targetColor: getRandomColor(),
      progress: 1,
    }))
  }

  /* ---------------- CANVAS ---------------- */

  const resizeCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const parent = canvas.parentElement
    if (!parent) return

    const rect = parent.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    if (context.current) {
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const { columns, rows } = calculateGrid(rect.width, rect.height)
    initializeLetters(columns, rows)
    draw()
  }

  const draw = () => {
    const ctx = context.current
    const canvas = canvasRef.current
    if (!ctx || !canvas) return

    const { width, height } = canvas.getBoundingClientRect()

    ctx.clearRect(0, 0, width, height)
    ctx.font = `${fontSize}px monospace`
    ctx.textBaseline = "top"

    letters.current.forEach((l, i) => {
      const x = (i % grid.current.columns) * charWidth
      const y = Math.floor(i / grid.current.columns) * charHeight

      ctx.fillStyle = l.color
      ctx.fillText(l.char, x, y)
    })
  }

  /* ---------------- UPDATE ---------------- */

  const updateLetters = () => {
    const count = Math.max(1, Math.floor(letters.current.length * 0.05))

    for (let i = 0; i < count; i++) {
      const index = Math.floor(Math.random() * letters.current.length)

      const l = letters.current[index]
      if (!l) continue

      l.char = getRandomChar()
      l.targetColor = getRandomColor()

      if (!smooth) {
        l.color = l.targetColor
        l.progress = 1
      } else {
        l.progress = 0
      }
    }
  }

  const smoothColors = () => {
    let redraw = false

    letters.current.forEach((l) => {
      if (l.progress < 1) {
        l.progress += 0.05
        if (l.progress > 1) l.progress = 1

        const start = hexToRgb(l.color)
        const end = hexToRgb(l.targetColor)

        if (start && end) {
          l.color = interpolateColor(start, end, l.progress)
          redraw = true
        }
      }
    })

    if (redraw) draw()
  }

  /* ---------------- ANIMATION ---------------- */

  const animate = () => {
    const now = Date.now()

    if (now - lastGlitchTime.current >= glitchSpeed) {
      updateLetters()
      draw()
      lastGlitchTime.current = now
    }

    if (smooth) smoothColors()

    animationRef.current = requestAnimationFrame(animate)
  }

  /* ---------------- EFFECT ---------------- */

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    context.current = canvas.getContext("2d")

    resizeCanvas()
    animate()

    const handleResize = () => {
      cancelAnimationFrame(animationRef.current!)
      resizeCanvas()
      animate()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(animationRef.current!)
      window.removeEventListener("resize", handleResize)
    }
  }, [resolvedTheme, glitchSpeed, smooth])

  /* ---------------- UI ---------------- */

  return (
    <div className="relative w-full h-full bg-background overflow-hidden">
      <canvas ref={canvasRef} className="block w-full h-full" />

      {outerVignette && (
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,transparent_60%,hsl(var(--background))_100%)]" />
      )}

      {centerVignette && (
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,hsl(var(--background)/0.8)_0%,transparent_60%)]" />
      )}
    </div>
  )
}

export default LetterGlitch