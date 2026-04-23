"use client"

import Link from "next/link"
import DashboardLayout from "@/components/Company/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"

export default function BillingCancelPage() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[70vh] px-6">
        <Card className="w-full max-w-md shadow-lg border-muted">
          
          {/* Header */}
          <CardHeader className="flex flex-col items-center text-center space-y-3">
            <div className="rounded-full bg-red-100 p-3">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>

            <CardTitle className="text-xl font-semibold">
              Payment Cancelled
            </CardTitle>

            <CardDescription className="text-sm text-muted-foreground">
              No charge was made. You can continue using the Basic plan or try upgrading again anytime.
            </CardDescription>
          </CardHeader>

          {/* Content */}
          <CardContent className="flex flex-col gap-3">
            
            {/* Actions */}
            <Link href="/Company/subscription">
              <Button className="w-full">
                Try Again
              </Button>
            </Link>

            <Link href="/Company/dashboard">
              <Button variant="outline" className="w-full">
                Go to Dashboard
              </Button>
            </Link>

          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}