"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RestaurantDetails } from "@/types"
import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface ApprovalDialogProps {
    restaurant: RestaurantDetails
    trigger?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
    onSuccess?: () => void
}

export function ApprovalDialog({ restaurant, trigger, open, onOpenChange, onSuccess }: ApprovalDialogProps) {
    const { toast } = useToast()
    const router = useRouter()
    const [localOpen, setLocalOpen] = useState(false)
    const isControlled = open !== undefined && onOpenChange !== undefined

    const isOpen = isControlled ? open : localOpen
    const setIsOpen = isControlled ? onOpenChange : setLocalOpen

    const [isLoading, setIsLoading] = useState(false)
    const [rejectReason, setRejectReason] = useState("")
    const [showRejectInput, setShowRejectInput] = useState(false)

    const handleApprove = async () => {
        try {
            setIsLoading(true)

            const { error } = await supabase
                .from("restaurant_details")
                .update({ status: "approved" })
                .eq("id", restaurant.id)

            if (error) throw error

            toast({
                title: "Restaurant Approved",
                description: `${restaurant.name} has been approved successfully.`,
                duration: 3000,
            })

            setIsOpen(false)
            if (onSuccess) onSuccess()
            router.refresh()

        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to approve restaurant",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleReject = async () => {
        try {
            setIsLoading(true)

            const { error } = await supabase
                .from("restaurant_details")
                .update({
                    status: "rejected",
                    rejection_reason: rejectReason || null
                })
                .eq("id", restaurant.id)

            if (error) throw error

            toast({
                title: "Restaurant Rejected",
                description: `${restaurant.name} has been rejected.`,
                variant: "destructive",
            })

            setIsOpen(false)
            setShowRejectInput(false)
            setRejectReason("")
            if (onSuccess) onSuccess()
            router.refresh()

        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to reject restaurant",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Restaurant Application Details</DialogTitle>
                    <DialogDescription>
                        Review the registration details for {restaurant.name}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* General Info */}
                    <div className="space-y-4">
                        <h3 className="font-medium text-lg border-b pb-2">General Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Restaurant Name</Label>
                                <div className="font-medium">{restaurant.name}</div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Application ID</Label>
                                <div className="text-sm font-mono truncate">{restaurant.id}</div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Date Submitted</Label>
                                <div className="font-medium">{new Date(restaurant.created_at).toLocaleDateString()}</div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Owner Email</Label>
                                <div className="font-medium truncate">{restaurant.owner_email || "-"}</div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Owner Phone</Label>
                                <div className="font-medium">{restaurant.owner_phone || "-"}</div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Status</Label>
                                <div className={`font-medium capitalize ${restaurant.status === 'approved' ? 'text-green-600' :
                                    restaurant.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                                    }`}>
                                    {restaurant.status}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Banking / Legal */}
                    <div className="space-y-4">
                        <h3 className="font-medium text-lg border-b pb-2">Banking & Legal</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Account Holder</Label>
                                <div className="font-medium">{restaurant.account_holder_name}</div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Account Number</Label>
                                <div className="font-medium font-mono">{restaurant.account_number}</div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">IFSC Code</Label>
                                <div className="font-medium font-mono">{restaurant.ifsc_code}</div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">UPI ID</Label>
                                <div className="font-medium">{restaurant.upi_id || "N/A"}</div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">GST</Label>
                                <div className="font-medium">{restaurant.gst || "N/A"}</div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">FSSAI License</Label>
                                <div className="font-medium">{restaurant.fssai_license || "N/A"}</div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">PAN</Label>
                                <div className="font-medium">{restaurant.pan || "N/A"}</div>
                            </div>
                        </div>
                    </div>

                    {restaurant.status === 'rejected' && restaurant.rejection_reason && (
                        <div className="space-y-2 p-3 bg-destructive/10 rounded-md border border-destructive/20 text-destructive">
                            <Label className="font-semibold">Rejection Reason:</Label>
                            <div>{restaurant.rejection_reason}</div>
                        </div>
                    )}

                    {/* Action Area - Only for Pending */}
                    {restaurant.status === 'pending' && (
                        <div className="pt-4 border-t mt-2">
                            {!showRejectInput ? (
                                <div className="flex gap-3 justify-end">
                                    <Button variant="outline" className="gap-2 border-red-200 hover:bg-red-50 text-red-600" onClick={() => setShowRejectInput(true)} disabled={isLoading}>
                                        <XCircle className="w-4 h-4" /> Reject
                                    </Button>
                                    <Button className="gap-2 bg-green-600 hover:bg-green-700" onClick={handleApprove} disabled={isLoading}>
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                        Approve
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Reason for Rejection</Label>
                                        <Textarea
                                            placeholder="Please specify why this application is being rejected..."
                                            value={rejectReason}
                                            onChange={(e) => setRejectReason(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-3 justify-end">
                                        <Button variant="ghost" onClick={() => setShowRejectInput(false)} disabled={isLoading}>Cancel</Button>
                                        <Button variant="destructive" onClick={handleReject} disabled={isLoading || !rejectReason.trim()}>
                                            {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                            Confirm Rejection
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {restaurant.status !== 'pending' && (
                    <DialogFooter>
                        <Button onClick={() => setIsOpen(false)}>Close</Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    )
}
