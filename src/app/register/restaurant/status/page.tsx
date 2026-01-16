"use client"

import { useEffect, useState, Suspense } from "react"
import { supabase } from "@/lib/supabaseClient"
import { RestaurantDetails } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, XCircle, Clock, ArrowRight, Search } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function StatusContent() {
    const searchParams = useSearchParams()
    const emailFromUrl = searchParams.get("email")

    const [application, setApplication] = useState<RestaurantDetails | null>(null)
    const [loading, setLoading] = useState(false)
    const [searchEmail, setSearchEmail] = useState(emailFromUrl || "")
    const [searched, setSearched] = useState(false)

    async function fetchStatus(email: string) {
        if (!email) return
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from("restaurant_details")
                .select("*")
                .eq("owner_email", email)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle()

            setApplication(data as RestaurantDetails)
            setSearched(true)
        } catch (err) {
            console.error("Error fetching status:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (emailFromUrl) {
            fetchStatus(emailFromUrl)
        }
    }, [emailFromUrl])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        fetchStatus(searchEmail)
    }

    if (loading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!application) {
        return (
            <div className="container max-w-md mx-auto py-20 px-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Check Application Status</CardTitle>
                        <CardDescription>Enter the email address you used to register.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="owner@example.com"
                                    value={searchEmail}
                                    onChange={(e) => setSearchEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                <Search className="w-4 h-4 mr-2" /> Check Status
                            </Button>
                        </form>

                        {searched && (
                            <div className="p-4 bg-muted rounded-md text-center text-sm text-muted-foreground">
                                No application found for this email.
                            </div>
                        )}

                        <div className="pt-4 border-t text-center">
                            <Button variant="link" asChild>
                                <Link href="/register/restaurant">Submit a new application</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container max-w-xl mx-auto py-20 px-4">
            <Card>
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-4">
                        {application.status === 'pending' && <Clock className="h-16 w-16 text-yellow-500" />}
                        {application.status === 'approved' && <CheckCircle2 className="h-16 w-16 text-green-500" />}
                        {application.status === 'rejected' && <XCircle className="h-16 w-16 text-red-500" />}
                    </div>
                    <CardTitle className="text-2xl">Application Status</CardTitle>
                    <CardDescription>
                        Application ID: <span className="font-mono text-xs">{application.id}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className={`text-center p-4 rounded-lg border ${application.status === 'pending' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                        application.status === 'approved' ? 'bg-green-50 border-green-200 text-green-800' :
                            'bg-red-50 border-red-200 text-red-800'
                        }`}>
                        <div className="font-semibold text-lg uppercase tracking-wide mb-1">
                            {application.status}
                        </div>
                        <div className="text-sm opacity-90">
                            {application.status === 'pending' && "Your application is under review. Please check back later."}
                            {application.status === 'approved' && "Congratulations! Your restaurant has been approved."}
                            {application.status === 'rejected' && "We're sorry, your application was not approved."}
                        </div>
                    </div>

                    {application.status === 'rejected' && application.rejection_reason && (
                        <div className="bg-destructive/10 p-4 rounded-md border border-destructive/20">
                            <h4 className="font-semibold text-destructive mb-1">Reason for Rejection:</h4>
                            <p className="text-sm text-destructive/90">{application.rejection_reason}</p>
                        </div>
                    )}

                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Restaurant Details</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground block">Name</span>
                                <span className="font-medium">{application.name}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block">Submited On</span>
                                <span className="font-medium">{new Date(application.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="col-span-2">
                                <span className="text-muted-foreground block">Owner Email</span>
                                <span className="font-medium">{application.owner_email}</span>
                            </div>
                        </div>
                    </div>

                    {application.status === 'approved' && (
                        <Button className="w-full gap-2" asChild>
                            <Link href="/dashboard/restaurant-panel">
                                Go to Dashboard <ArrowRight className="w-4 h-4" />
                            </Link>
                        </Button>
                    )}
                    {application.status === 'rejected' && (
                        <Button variant="outline" className="w-full" asChild>
                            <Link href="/register/restaurant">
                                Submit New Application
                            </Link>
                        </Button>
                    )}

                    <div className="text-center pt-2">
                        <Button variant="ghost" size="sm" onClick={() => setApplication(null)}>
                            Check another email
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function RegistrationStatusPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <StatusContent />
        </Suspense>
    )
}
