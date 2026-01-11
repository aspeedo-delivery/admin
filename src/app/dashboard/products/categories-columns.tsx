"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ProductCategory } from "@/types"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"

export type CategoryFormValues = {
  id?: string
  name: string
}

export const getCategoriesColumns = (
  openEditDialog: (category: CategoryFormValues) => void,
  openDeleteDialog: (categoryId: string, categoryName: string) => void
): ColumnDef<ProductCategory>[] => [
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
  },
  {
    accessorKey: "name",
    header: "Category Name",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const category = row.original

      const formValues: CategoryFormValues = {
        id: category.id,
        name: category.name,
      }

      const handleCopyId = async () => {
        await navigator.clipboard.writeText(category.id)
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>

            {/* ✅ Edit */}
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              onClick={() => openEditDialog(formValues)}
            >
              Edit
            </DropdownMenuItem>

            {/* ✅ Copy ID */}
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              onClick={handleCopyId}
            >
              Copy ID
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* ✅ Delete */}
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={(e) => e.preventDefault()}
              onClick={() => openDeleteDialog(category.id, category.name)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
