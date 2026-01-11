
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Product } from "@/types"
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

export type ProductFormValues = {
    id?: string
    title: string
    description?: string
    price: number
    stock: number
    category_id: string
    image_url?: string
}

export const getProductsColumns = (
    openEditDialog: (product: ProductFormValues) => void, 
    openDeleteDialog: (productId: string, name: string) => void
): ColumnDef<Product>[] => [
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
        accessorKey: "title",
        header: "Product",
        cell: ({ row }) => (
            <div className="flex items-center gap-4">
                <Image src={row.original.image_url || "https://placehold.co/40x40.png"} alt={row.original.title} width={40} height={40} className="rounded-md object-cover" data-ai-hint="product image" />
                <div className="flex flex-col">
                    <span className="font-medium">{row.original.title}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">{row.original.description}</span>
                </div>
            </div>
        )
    },
    {
        accessorKey: "category_name",
        header: "Category",
        cell: ({ row }) => row.original.category_name || "N/A",
    },
    {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.original.price),
    },
    {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }) => {
            const stock = row.original.stock;
            let variant: "default" | "secondary" | "destructive" = "default";
            if (stock === 0) {
                variant = "destructive"
            } else if (stock < 20) {
                variant = "secondary"
            }
            return <Badge variant={variant}>{stock > 0 ? stock : "Out of Stock"}</Badge>
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const product = row.original;
            const formValues: ProductFormValues = {
                id: product.id,
                title: product.title,
                description: product.description || '',
                price: product.price,
                stock: product.stock,
                category_id: product.category_id,
                image_url: product.image_url || '',
            }

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openEditDialog(formValues)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => openDeleteDialog(product.id, product.title)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
