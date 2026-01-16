"use client"

import { ColumnDef } from "@tanstack/react-table"
import { RestaurantDetails } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Check, X, Eye, MoreHorizontal, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ApprovalDialog } from "./approval-dialog"
import { CreateLoginDialog } from "./create-login-dialog"
import { useState } from "react"

export const getColumns = (onSuccess?: () => void): ColumnDef<RestaurantDetails>[] => [
    {
        accessorKey: "name",
        header: "Restaurant Name",
    },
    {
        accessorKey: "account_holder_name",
        header: "Account Holder",
    },
    {
        accessorKey: "ifsc_code",
        header: "IFSC",
        cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("ifsc_code")}</span>
    },
    {
        accessorKey: "upi_id",
        header: "UPI ID",
        cell: ({ row }) => {
            const val = row.getValue("upi_id") as string | null
            return val ? val : <span className="text-muted-foreground">-</span>
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string

            let variant: "default" | "secondary" | "destructive" | "outline" = "outline"
            if (status === 'approved') variant = "default" // or a success variant if available
            if (status === 'rejected') variant = "destructive"
            if (status === 'pending') variant = "secondary"

            // Custom coloring classes
            let className = ""
            if (status === 'approved') className = "bg-green-100 text-green-800 hover:bg-green-100 border-transparent shadow-none"
            if (status === 'rejected') className = "bg-red-100 text-red-800 hover:bg-red-100 border-transparent shadow-none"
            if (status === 'pending') className = "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-transparent shadow-none"

            return (
                <Badge variant="outline" className={`capitalize ${className}`}>
                    {status}
                </Badge>
            )
        },
    },
    {
        accessorKey: "created_at",
        header: "Submitted",
        cell: ({ row }) => {
            return new Date(row.getValue("created_at")).toLocaleDateString()
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const restaurant = row.original
            const [showDialog, setShowDialog] = useState(false)
            const [showLoginDialog, setShowLoginDialog] = useState(false)

            return (
                <>
                    <ApprovalDialog
                        open={showDialog}
                        onOpenChange={setShowDialog}
                        restaurant={restaurant}
                        onSuccess={onSuccess}
                    />
                    <CreateLoginDialog
                        open={showLoginDialog}
                        onOpenChange={setShowLoginDialog}
                        restaurant={restaurant}
                        onSuccess={onSuccess}
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setShowDialog(true)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </DropdownMenuItem>
                            {restaurant.status === 'approved' && !restaurant.credentials_created && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setShowLoginDialog(true)}>
                                        <Key className="mr-2 h-4 w-4" />
                                        Create Login
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </>
            )
        },
    },
]

