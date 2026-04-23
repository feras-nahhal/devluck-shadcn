"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"

const DEFAULT_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+"

type Props = {
  text: string
  speed?: number
  maxIterations?: number
  className?: string
  parentClassName?: string
  encryptedClassName?: string
  revealedClassName?: string
  animateOn?: "hover" | "view" | "both"
}

export default function DecryptedText({
  text,
  speed = 50,
  maxIterations = 10,
  className = "",
  parentClassName = "",
  encryptedClassName = "opacity-60",
  revealedClassName = "",
  animateOn = "hover",
}: Props) {
  const [displayText, setDisplayText] = useState(text)
  const [isHovering, setIsHovering] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout
    let iteration = 0

    const chars = DEFAULT_CHARS.split("")

    const shouldAnimate =
      animateOn === "hover"
        ? isHovering
        : animateOn === "view"
        ? hasAnimated
        : isHovering || hasAnimated

    if (!shouldAnimate) {
      setDisplayText(text)
      return
    }

    interval = setInterval(() => {
      const result = text
        .split("")
        .map((char, i) => {
          if (iteration >= maxIterations) return text[i]
          if (char === " ") return " "
          if (i < iteration) return text[i]
          return chars[Math.floor(Math.random() * chars.length)]
        })
        .join("")

      setDisplayText(result)
      iteration++

      if (iteration > maxIterations) {
        clearInterval(interval)
        setDisplayText(text)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed, isHovering, hasAnimated, animateOn, maxIterations])

  useEffect(() => {
    if (animateOn === "hover") return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setHasAnimated(true)
        })
      },
      { threshold: 0.1 }
    )

    if (ref.current) observer.observe(ref.current)

    return () => observer.disconnect()
  }, [animateOn])

  return (
    <motion.span
      ref={ref}
      className={`inline-block whitespace-pre-wrap ${parentClassName}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <span className="sr-only">{text}</span>

      <span aria-hidden="true">
        {displayText.split("").map((char, i) => {
          const isDone = displayText === text

          return (
            <span
              key={i}
              className={isDone ? revealedClassName : encryptedClassName}
            >
              {char}
            </span>
          )
        })}
      </span>
    </motion.span>
  )
}