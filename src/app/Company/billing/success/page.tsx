"use client"

import Link from "next/link"
import DashboardLayout from "@/components/Company/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

export default function BillingSuccessPage() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[70vh] px-6">
        <Card className="w-full max-w-md shadow-lg border-muted">
          
          {/* Header */}
          <CardHeader className="flex flex-col items-center text-center space-y-3">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>

            <CardTitle className="text-xl font-semibold">
              Payment Successful
            </CardTitle>

            <CardDescription className="text-sm text-muted-foreground">
              Your subscription has been updated successfully.
            </CardDescription>
          </CardHeader>

          {/* Content */}
          <CardContent className="flex flex-col gap-3 text-center">
            
            <p className="text-sm text-muted-foreground">
              It may take a few seconds for activation. You can verify your plan in the subscription page.
            </p>

            {/* Actions */}
            <Link href="/Company/subscription">
              <Button className="w-full">
                View Subscription
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