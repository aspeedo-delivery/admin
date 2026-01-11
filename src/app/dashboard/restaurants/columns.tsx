"use client"


import { ColumnDef } from "@tanstack/react-table"
import { Restaurant } from "@/types"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"

export const columns: ColumnDef<Restaurant>[] = [
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
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Image
          src={row.original.logo_url || "https://placehold.co/40x40.png"}
          alt={row.original.name}
          width={40}
          height={40}
          className="rounded-full object-cover"
          data-ai-hint="restaurant logo"
        />
        <span>{row.original.name}</span>
      </div>
    )
  },
  {
    accessorKey: "cuisine_types",
    header: "Cuisine",
    cell: ({ row }) => {
      const cuisines = row.getValue("cuisine_types") as string[]
      return <div className="flex flex-wrap gap-1">{cuisines?.map(c => <Badge key={c} variant="outline">{c}</Badge>)}</div>
    }
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("is_active")
      return <Badge variant={isActive ? "default" : "destructive"}>{isActive ? "Active" : "Inactive"}</Badge>
    }
  },
  {
    accessorKey: "rating",
    header: "Rating",
  },
  {
    accessorKey: "created_at",
    header: "Onboarded On",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"))
      return <span>{date.toLocaleDateString()}</span>
    },
  },
]
