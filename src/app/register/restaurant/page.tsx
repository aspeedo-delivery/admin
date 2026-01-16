"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/context/auth-context"
import { restaurantFormSchema, RestaurantFormValues } from "./schema"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function RestaurantRegistrationPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(false) // No longer blocking on user ID check

  // define form
  const form = useForm<RestaurantFormValues>({
    resolver: zodResolver(restaurantFormSchema),
    defaultValues: {
      name: "",
      owner_email: "",
      owner_phone: "",
      account_holder_name: "",
      account_number: "",
      ifsc_code: "",
      upi_id: "",
      fssai_license: "",
      gst: "",
      pan: "",
    },
  })

  // Pre-fill email from auth if available, but NOT required
  useEffect(() => {
    if (user?.email && !form.getValues("owner_email")) {
      form.setValue("owner_email", user.email)
    }
  }, [user, form])

  // Logic to prevent duplicate applications is now handled during Submission or could be done by debouncing email input.
  // We'll keep it simple: Check on submit, or let the user type.
  // We will NOT auto-redirect based on user.id because we don't rely on user.id anymore.
  // We COULD check if user.email matches an existing application, but that requires the user to Type it first or us to assume.
  // Let's rely on the check during Submit for now to keep it clean, OR a simple check if user is logged in.

  useEffect(() => {
    async function checkExisting() {
      if (!user?.email) return

      try {
        const { data } = await supabase
          .from("restaurant_details")
          .select("id, status")
          .eq("owner_email", user.email)
          .maybeSingle()

        if (data) {
          // Determine redirect URL
          const statusUrl = `/register/restaurant/status?email=${encodeURIComponent(user.email)}`
          router.replace(statusUrl)
        }
      } catch (e) {
        console.warn("Error checking existing application", e)
      }
    }

    if (user?.email) {
      checkExisting()
    }
  }, [user, router])


  async function onSubmit(data: RestaurantFormValues) {
    setLoading(true)
    try {
      // 1. Check for duplicate by email
      const { data: existing } = await supabase
        .from("restaurant_details")
        .select("id, status")
        .eq("owner_email", data.owner_email)
        .maybeSingle()

      if (existing) {
        toast({
          variant: "default",
          title: "Application Exists",
          description: "An application with this email already exists."
        })
        router.push(`/register/restaurant/status?email=${encodeURIComponent(data.owner_email)}`)
        return
      }

      // 2. Insert
      const payload = {
        name: data.name,
        owner_email: data.owner_email,
        owner_phone: data.owner_phone || null,
        account_holder_name: data.account_holder_name,
        account_number: data.account_number,
        ifsc_code: data.ifsc_code,
        upi_id: data.upi_id || null,
        fssai_license: data.fssai_license || null,
        gst: data.gst || null,
        pan: data.pan || null,
        status: "pending",
      }

      const { error } = await supabase
        .from("restaurant_details")
        .insert(payload)
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Application Submitted",
        description: "Your restaurant registration has been submitted successfully.",
      })

      router.push(`/register/restaurant/status?email=${encodeURIComponent(data.owner_email)}`)
    } catch (error: any) {
      console.error("Submit Error:", error)
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "Could not submit application. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  if (checkingStatus) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Register Restaurant</CardTitle>
          <CardDescription>
            Submit your restaurant details for approval. Any team member can submit this form.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Restaurant Name <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Tasty Bites" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="owner_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Owner Email <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="owner@example.com" type="email" {...field} />
                        </FormControl>
                        <FormDescription>This will be used for your login.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="owner_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="+91 98765 43210" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Banking Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="account_holder_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Holder Name <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="account_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="1234567890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ifsc_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IFSC Code <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="SBIN0001234" {...field} className="uppercase" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="upi_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UPI ID (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="example@upi" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Legal Documents (Optional)</h3>
                <FormField
                  control={form.control}
                  name="fssai_license"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>FSSAI License No.</FormLabel>
                      <FormControl>
                        <Input placeholder="License number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gst"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GST Number</FormLabel>
                        <FormControl>
                          <Input placeholder="GSTIN..." {...field} className="uppercase" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PAN Number</FormLabel>
                        <FormControl>
                          <Input placeholder="ABCDE1234F" {...field} className="uppercase" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Application
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}