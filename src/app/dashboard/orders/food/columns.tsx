
"use client"


import { ColumnDef } from "@tanstack/react-table"
import { RestaurantOrder } from "@/types"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

export const columns: ColumnDef<RestaurantOrder>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
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
  },
  {
    accessorKey: "id",
    header: "Order ID",
  },
  {
    accessorKey: "user_profiles.full_name",
    header: "Customer",
    cell: ({ row }) => row.original.user_profiles?.full_name || "N/A",
  },
  {
    accessorKey: "restaurants.name",
    header: "Restaurant",
    cell: ({ row }) => row.original.restaurants?.name || "N/A",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant = status === "delivered" ? "default" : status === "cancelled" ? "destructive" : "secondary";
      return <Badge variant={variant} className="capitalize">{status}</Badge>
    }
  },
  {
    accessorKey: "total_amount",
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total_amount") || "0")
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount)

      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"))
      return <span>{date.toLocaleDateString()}</span>
    },
  },
]
