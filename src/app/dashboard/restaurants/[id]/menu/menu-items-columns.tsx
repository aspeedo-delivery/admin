
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MenuItemWithCategory } from "@/types"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"

// This type will be used for the form
export type MenuItemFormValues = {
    id?: string
    name: string
    description?: string
    price: number
    category_id: string
    is_veg: boolean
    in_stock: boolean
    image_url?: string
}


export const getMenuItemsColumns = (
    openEditDialog: (menuItem: MenuItemFormValues) => void, 
    openDeleteDialog: (menuItemId: string, name: string) => void
): ColumnDef<MenuItemWithCategory>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox 
                checked={table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")}
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
        header: "Name",
        cell: ({ row }) => (
            <div className="flex items-center gap-4">
                <Image src={row.original.image_url || "https://placehold.co/40x40.png"} alt={row.original.name} width={40} height={40} className="rounded-md object-cover" data-ai-hint="food item" />
                <div className="flex flex-col">
                    <span className="font-medium">{row.original.name}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">{row.original.description}</span>
                </div>
            </div>
        )
    },
    {
        accessorKey: "restaurant_categories.category_name",
        header: "Category",
        cell: ({ row }) => row.original.restaurant_categories?.category_name || "N/A",
    },
    {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.original.price),
    },
    {
        accessorKey: "is_veg",
        header: "Type",
        cell: ({ row }) => {
            const isVeg = row.original.is_veg;
            return <Badge variant="outline" className={isVeg ? 'text-green-700 border-green-300 bg-green-50' : 'text-red-700 border-red-300 bg-red-50'}>{isVeg ? "Veg" : "Non-Veg"}</Badge>
        },
    },
    {
        accessorKey: "in_stock",
        header: "In Stock",
        cell: ({ row }) => <Badge variant={row.original.in_stock ? "default" : "secondary"}>{row.original.in_stock ? "Yes" : "No"}</Badge>,
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const menuItem = row.original;
            const formValues: MenuItemFormValues = {
                id: menuItem.id,
                name: menuItem.name,
                description: menuItem.description || '',
                price: menuItem.price,
                category_id: menuItem.category_id,
                is_veg: menuItem.is_veg,
                in_stock: menuItem.in_stock,
                image_url: menuItem.image_url || '',
            }

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openEditDialog(formValues)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => openDeleteDialog(menuItem.id, menuItem.name)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
