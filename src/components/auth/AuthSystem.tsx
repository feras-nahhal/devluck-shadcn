"use client"

import { useState } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { motion } from "framer-motion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Sun, Moon, Laptop } from "lucide-react"

import LetterGlitch from "../ui/LetterGlitch"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"


import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { loginSchema, registerSchema } from "@/lib/schemas/auth"
import { useAuth } from "@/hooks/useAuth"

/* ---------------- TYPES ---------------- */

type AuthMode = "login" | "register"

interface AuthSystemProps {
  initialMode?: AuthMode
}

/* ---------------- ANIMATION VARIANTS ---------------- */
const container = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

/* ---------------- COMPONENT ---------------- */

export default function AuthSystem({
  initialMode = "login",
}: AuthSystemProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<"STUDENT" | "COMPANY">("STUDENT")

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const { login, signup, loading } = useAuth()
  const router = useRouter()
  const { setTheme } = useTheme()

  /* ---------------- GET SCHEMA (FIXED) ---------------- */

  const getSchema = () => {
    return mode === "login" ? loginSchema : registerSchema
  }

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {
    if (loading) return

    setFieldErrors({})

    const schema = getSchema()

    const result = schema.safeParse({
      email,
      password,
      ...(mode === "register" && {
        confirmPassword,
        role,
      }),
    })

    /* ZOD ERRORS */
    if (!result.success) {
      const errors: Record<string, string> = {}

      result.error.issues.forEach((err) => {
        const key = err.path[0]
        if (key) errors[key as string] = err.message
      })

      setFieldErrors(errors)
      toast.error(result.error.issues[0]?.message || "Invalid form data")
      return
    }

    try {
      const user =
        mode === "login"
          ? await login(email, password)
          : await signup(email, password, role)

      toast.success("Welcome 🎉")

      router.push(
        user.role === "COMPANY"
          ? "/Company/dashboard"
          : "/Student/dashboard"
      )
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Authentication failed"

      toast.error(message)
    }
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen flex items-center justify-center relative">

      {/* BACKGROUND */}
      <div className="absolute inset-0 -z-10">
        <LetterGlitch />
      </div>

    <div className="absolute top-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Toggle theme">
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setTheme("light")}>
            <Sun className="mr-2 h-4 w-4" />
            Light
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setTheme("dark")}>
            <Moon className="mr-2 h-4 w-4" />
            Dark
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setTheme("system")}>
            <Laptop className="mr-2 h-4 w-4" />
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

      <motion.div
        initial="hidden"
        animate="show"
        variants={container}
      >
        <Card className="w-[420px] shadow-2xl">

          <CardHeader>
            <motion.div variants={item} className="space-y-1 text-center">
              <CardTitle className="text-xl">
                {mode === "login" ? "Welcome back" : "Create an account"}
              </CardTitle>

              <CardDescription>
                {mode === "login"
                  ? "Enter your credentials to access your account."
                  : "Fill in your details to get started."}
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-4">

            {/* EMAIL */}
            <motion.div variants={item}>
              <Label className="mb-2">Email</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(fieldErrors.email && "border-red-500")}
                
                placeholder="yourname@devluck.com"
              />
              {fieldErrors.email && (
                <p id="email-error" className="text-xs text-red-500">{fieldErrors.email}</p>
              )}
            </motion.div>

            {/* PASSWORD */}
          <motion.div variants={item} className="space-y-2">
            <Label htmlFor="password">Password</Label>

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  "pr-10",
                  fieldErrors.password && "border-red-500"
                )}
                aria-invalid={!!fieldErrors.password}
                aria-describedby="password-error"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {fieldErrors.password && (
              <p id="password-error" className="text-xs text-red-500">
                {fieldErrors.password}
              </p>
            )}
          </motion.div>

          {mode === "register" && (
            <motion.div variants={item} className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>

              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={cn(
                    "pr-10",
                    fieldErrors.confirmPassword && "border-red-500"
                  )}
                  aria-invalid={!!fieldErrors.confirmPassword}
                  aria-describedby="confirm-password-error"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {fieldErrors.confirmPassword && (
                <p id="confirm-password-error" className="text-xs text-red-500">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </motion.div>
          )}

            {/* ROLE */}
          {mode === "register" && (
            <motion.div variants={item} className="space-y-2">
              <Label htmlFor="role">Role</Label>

              <RadioGroup
                value={role}
                onValueChange={(v) => setRole(v as "STUDENT" | "COMPANY")}
                className="flex gap-6"
                aria-labelledby="role"
              >
                <label
                  htmlFor="student"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <RadioGroupItem value="STUDENT" id="student" />
                  <span>Student</span>
                </label>

                <label
                  htmlFor="company"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <RadioGroupItem value="COMPANY" id="company" />
                  <span>Company</span>
                </label>
              </RadioGroup>
            </motion.div>
          )}

            {/* BUTTON */}
            <motion.div variants={item}>
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === "login" ? "Signing in..." : "Creating account..."}
                  </>
                ) : mode === "login" ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </Button>
            </motion.div>

            {/* SWITCH */}
            <motion.p
              variants={item}
              className="text-center text-sm text-muted-foreground"
            >
              {mode === "login"
                ? "Don’t have an account?"
                : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() =>
                  setMode(mode === "login" ? "register" : "login")
                }
                className="font-medium text-primary hover:underline transition-colors"
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </motion.p>

          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}