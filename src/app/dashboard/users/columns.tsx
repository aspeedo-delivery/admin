
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { UserProfile } from "@/types"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

export type UserWithWallet = UserProfile & {
  wallet_balance?: { balance: number } | null
}

export const columns: ColumnDef<UserWithWallet>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "full_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Full Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string
      return <Badge variant={role === 'admin' ? 'default' : 'secondary'} className="capitalize">{role}</Badge>
    }
  },
  {
    accessorKey: "kyc_status",
    header: "KYC Status",
    cell: ({ row }) => {
      const status = row.getValue("kyc_status") as string
      let variant: "default" | "secondary" | "destructive" | "outline" = "secondary"
      if (status === 'approved') variant = 'default'
      if (status === 'rejected') variant = 'destructive'
      return <Badge variant={variant} className="capitalize">{status}</Badge>
    }
  },
  {
    accessorKey: "wallet_balance", // This accessor key might not work directly for sorting if nested, but for display cell it is custom
    header: () => <div className="text-right">Wallet Balance</div>,
    cell: ({ row }) => {
      // Supabase might return it as object or null depending on join
      // row.original is UserWithWallet
      const balanceObj = row.original.wallet_balance;
      const balance = balanceObj?.balance ?? 0;

      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(Number(balance))

      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "created_at",
    header: "Joined On",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"))
      return <span>{date.toLocaleDateString()}</span>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(user.id)}
            >
              Copy user ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Edit user</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete user</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
