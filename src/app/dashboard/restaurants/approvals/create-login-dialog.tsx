"use client"

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RestaurantDetails } from "@/types"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Copy, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"

interface CreateLoginDialogProps {
    restaurant: RestaurantDetails
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function CreateLoginDialog({ restaurant, open, onOpenChange, onSuccess }: CreateLoginDialogProps) {
    const { toast } = useToast()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [credentials, setCredentials] = useState<{ email: string, password: string } | null>(null)

    const handleCreateLogin = async () => {
        // Basic validation
        if (!restaurant.owner_email && !restaurant.name) { // Fallback validation logic can vary
            toast({ variant: "destructive", title: "Error", description: "Restaurant data missing email" })
            return
        }

        setLoading(true)
        try {
            const response = await fetch('/api/admin/create-restaurant-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    detailsId: restaurant.id,
                    owner_email: restaurant.owner_email || `${restaurant.name.toLowerCase().replace(/\s/g, '')}@example.com` // Fallback if email missing
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to create login")
            }

            setCredentials(data)
            toast({
                title: "Login Created",
                description: "Credentials generated successfully.",
            })

            if (onSuccess) onSuccess()
            router.refresh()
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message
            })
            // Close on error? or let them retry? Let's keep open.
        } finally {
            setLoading(false)
        }
    }

    const handleCopy = () => {
        if (!credentials) return
        const text = `Email: ${credentials.email}\nPassword: ${credentials.password}`
        navigator.clipboard.writeText(text)
        toast({ description: "Credentials copied to clipboard" })
    }

    const handleClose = () => {
        setCredentials(null)
        onOpenChange(false)
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Create Login Credentials</AlertDialogTitle>
                    <AlertDialogDescription>
                        {credentials
                            ? "Please save these credentials immediately. The password will not be shown again."
                            : `This will create a new login account for "${restaurant.name}". The owner will use these credentials to access the portal.`
                        }
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {!credentials ? (
                    <div className="py-4 space-y-4">
                        <div className="flex items-center gap-2 p-3 bg-yellow-50 text-yellow-800 rounded-md text-sm border border-yellow-200">
                            <AlertTriangle className="h-4 w-4" />
                            <span>Ensure the owner email <strong>{restaurant.owner_email || "N/A"}</strong> is correct.</span>
                        </div>
                        <div className="flex justify-end gap-2 theme-gray">
                            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
                            <Button onClick={handleCreateLogin} disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Generate Credentials
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={credentials.email} readOnly />
                        </div>
                        <div className="space-y-2">
                            <Label>Password</Label>
                            <div className="flex gap-2">
                                <Input value={credentials.password} readOnly className="font-mono bg-muted" />
                                <Button variant="outline" onClick={handleCopy} size="icon">
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <AlertDialogFooter className="mt-4">
                            <Button onClick={handleClose}>Done</Button>
                        </AlertDialogFooter>
                    </div>
                )}
            </AlertDialogContent>
        </AlertDialog>
    )
}
