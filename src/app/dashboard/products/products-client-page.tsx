
'use client';

import * as React from 'react';
import { useTransition } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Product, ProductCategory } from '@/types';
import { getProductsColumns, ProductFormValues } from './products-columns';
import { getCategoriesColumns, CategoryFormValues } from './categories-columns';
import { DataTable } from '@/app/dashboard/restaurants/[id]/menu/data-table';
import { supabase } from '@/lib/supabaseClient';


import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Loader2 } from 'lucide-react';

interface ProductClientPageProps {
    initialProducts: Product[];
    initialCategories: ProductCategory[];
}

const categoryFormSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Category name is required'),
});

const productFormSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    price: z.coerce.number().min(0, 'Price must be non-negative'),
    stock: z.coerce.number().int().min(0, 'Stock must be a non-negative integer'),
    category_id: z.string({ required_error: 'A category must be selected' }),
    image_url: z.string().url().optional().or(z.literal('')),
});


export function ProductClientPage({ initialProducts, initialCategories }: ProductClientPageProps) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const [products, setProducts] = React.useState(initialProducts);
    const [categories, setCategories] = React.useState(initialCategories);

    React.useEffect(() => setProducts(initialProducts), [initialProducts]);
    React.useEffect(() => setCategories(initialCategories), [initialCategories]);

    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = React.useState(false);
    const [isProductDialogOpen, setIsProductDialogOpen] = React.useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

    const [editingCategory, setEditingCategory] = React.useState<CategoryFormValues | null>(null);
    const [editingProduct, setEditingProduct] = React.useState<ProductFormValues | null>(null);
    const [deletingId, setDeletingId] = React.useState<{ id: string, type: 'category' | 'product', name: string } | null>(null);

    const categoryForm = useForm<z.infer<typeof categoryFormSchema>>({
        resolver: zodResolver(categoryFormSchema),
        defaultValues: { name: '' },
    });

    const productForm = useForm<z.infer<typeof productFormSchema>>({
        resolver: zodResolver(productFormSchema),
        defaultValues: { title: '', description: '', price: 0, stock: 0, category_id: '', image_url: '' },
    });

    const handleOpenCategoryDialog = (category: CategoryFormValues | null = null) => {
        setEditingCategory(category);
        categoryForm.reset(category || { name: '' });
        setIsCategoryDialogOpen(true);
    };

    const handleOpenProductDialog = (product: ProductFormValues | null = null) => {
        setEditingProduct(product);
        productForm.reset(product || { title: '', description: '', price: 0, stock: 0, category_id: '', image_url: '' });
        setIsProductDialogOpen(true);
    };

    const handleOpenDeleteDialog = (id: string, name: string, type: 'category' | 'product') => {
        setDeletingId({ id, name, type });
        setIsDeleteDialogOpen(true);
    }

    const onCategorySubmit = (values: z.infer<typeof categoryFormSchema>) => {
        startTransition(async () => {
            try {
                if (editingCategory?.id) {
                    const { data, error } = await supabase
                        .from('categories')
                        .update({ name: values.name })
                        .eq('id', editingCategory.id)
                        .select('*')
                        .single();

                    if (error) throw error;
                    if (data) {
                        setCategories(cats => cats.map(c => c.id === editingCategory.id ? data : c));
                        toast({ title: 'Success', description: 'Category updated.' });
                        setIsCategoryDialogOpen(false);
                    }
                } else {
                    const { data, error } = await supabase
                        .from('categories')
                        .insert({ name: values.name })
                        .select('*')
                        .single();

                    if (error) throw error;
                    if (data) {
                        setCategories(cats => [data, ...cats]);
                        toast({ title: 'Success', description: 'Category saved.' });
                        setIsCategoryDialogOpen(false);
                    }
                }
            } catch (error: any) {
                console.error('Error saving category:', error);
                let msg = error.message || "Failed to save category.";
                if (error.code === '42501' || msg.includes('violates row-level security')) {
                    msg = "Permission denied. Check RLS policies in Supabase.";
                } else if (error.code === '23505') { // Unique constraint violation
                    msg = "Category already exists.";
                }
                toast({ variant: "destructive", title: "Error", description: msg });
            }
        });
    };

    const onProductSubmit = (values: z.infer<typeof productFormSchema>) => {
        startTransition(async () => {
            // const category = categories.find(c => c.id === values.category_id);
            // We'll let Supabase join or we just refresh, but requirement says we update local state.
            // For local update we need category name to show in table immediately without refetch if we want perfection.
            // But the requirement says "Products already include category_name column in products (denormalized) which is auto-filled by DB trigger OR backfilled already"
            // So fetching single * should return category_name if DB has it.

            try {
                if (editingProduct?.id) {
                    const { data, error } = await supabase
                        .from('products')
                        .update(values)
                        .eq('id', editingProduct.id)
                        .select('*')
                        .single();

                    if (error) throw error;
                    if (data) {
                        setProducts(prods => prods.map(p => p.id === editingProduct.id ? data : p));
                        toast({ title: 'Success', description: 'Product updated.' });
                        setIsProductDialogOpen(false);
                    }
                } else {
                    const { data, error } = await supabase
                        .from('products')
                        .insert(values)
                        .select('*')
                        .single();

                    if (error) throw error;
                    if (data) {
                        setProducts(prods => [data, ...prods]);
                        toast({ title: 'Success', description: 'Product saved.' });
                        setIsProductDialogOpen(false);
                    }
                }
            } catch (error: any) {
                console.error('Error saving product:', error);
                const msg = error.code === '42501' || error.message?.includes('violates row-level security')
                    ? "Permission denied. Check RLS policies in Supabase."
                    : (error.message || "Failed to save product.");
                toast({ variant: "destructive", title: "Error", description: msg });
            }
        });
    };

    const onConfirmDelete = () => {
        if (!deletingId) return;
        startTransition(async () => {
            if (deletingId.type === 'category') {
                try {
                    // Check for linked products
                    const { count, error: countError } = await supabase
                        .from('products')
                        .select('id', { count: 'exact', head: true })
                        .eq('category_id', deletingId.id);

                    if (countError) throw countError;

                    if (count !== null && count > 0) {
                        toast({ variant: "destructive", title: "Error", description: "Cannot delete category. Products are linked to it." });
                        setIsDeleteDialogOpen(false); // Should we close? User might want to see why. But instructions said "disable buttons", logic implies abort. Closed dialog is fine.
                        // Actually, let's just close as per success flow logic usually.
                        setDeletingId(null);
                        return;
                    }

                    const { error } = await supabase
                        .from('categories')
                        .delete()
                        .eq('id', deletingId.id);

                    if (error) throw error;

                    setCategories(cats => cats.filter(c => c.id !== deletingId.id));
                    toast({ title: 'Success', description: 'Category deleted.' });
                    setIsDeleteDialogOpen(false);
                    setDeletingId(null);

                } catch (error: any) {
                    console.error('Error deleting category:', error);
                    const msg = error.code === '42501' || error.message?.includes('violates row-level security')
                        ? "Permission denied. Check RLS policies in Supabase."
                        : (error.message || "Failed to delete category.");
                    toast({ variant: "destructive", title: "Error", description: msg });
                }
            } else {
                try {
                    const { error } = await supabase
                        .from('products')
                        .delete()
                        .eq('id', deletingId.id);

                    if (error) throw error;

                    setProducts(prods => prods.filter(p => p.id !== deletingId.id));
                    toast({ title: 'Success', description: 'Product deleted.' });
                    setIsDeleteDialogOpen(false);
                    setDeletingId(null);
                } catch (error: any) {
                    console.error('Error deleting product:', error);
                    const msg = error.code === '42501' || error.message?.includes('violates row-level security')
                        ? "Permission denied. Check RLS policies in Supabase."
                        : (error.message || "Failed to delete product.");
                    toast({ variant: "destructive", title: "Error", description: msg });
                }
            }
        });
    }

    const productsCols = React.useMemo(() => getProductsColumns(handleOpenProductDialog, (id, name) => handleOpenDeleteDialog(id, name, 'product')), []);
    const categoriesCols = React.useMemo(() => getCategoriesColumns(handleOpenCategoryDialog, (id, name) => handleOpenDeleteDialog(id, name, 'category')), []);

    return (
        <Tabs defaultValue="products">
            <TabsList>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>
            <TabsContent value="products">
                <DataTable
                    columns={productsCols}
                    data={products}
                    filterColumnId="title"
                    filterPlaceholder="Filter by title..."
                >
                    <Button onClick={() => handleOpenProductDialog()}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Product
                    </Button>
                </DataTable>
            </TabsContent>
            <TabsContent value="categories">
                <DataTable
                    columns={categoriesCols}
                    data={categories}
                    filterColumnId="name"
                    filterPlaceholder="Filter by category..."
                >
                    <Button onClick={() => handleOpenCategoryDialog()}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Category
                    </Button>
                </DataTable>
            </TabsContent>

            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? 'Edit' : 'Add'} Category</DialogTitle>
                        <DialogDescription>
                            {editingCategory ? 'Update the details for this category.' : 'Create a new product category.'}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...categoryForm}>
                        <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-4">
                            <FormField
                                control={categoryForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category Name</FormLabel>
                                        <FormControl><Input placeholder="e.g., Electronics" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{editingProduct ? 'Edit' : 'Add'} Product</DialogTitle>
                        <DialogDescription>
                            {editingProduct ? 'Update the details for this product.' : 'Add a new product to your catalog.'}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...productForm}>
                        <form onSubmit={productForm.handleSubmit(onProductSubmit)} className="space-y-4">
                            <FormField
                                control={productForm.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Wireless Headphones" {...field} /></FormControl><FormMessage /></FormItem>
                                )}
                            />
                            <FormField
                                control={productForm.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="High-quality wireless headphones with noise cancellation." {...field} /></FormControl><FormMessage /></FormItem>
                                )}
                            />
                            <FormField
                                control={productForm.control}
                                name="image_url"
                                render={({ field }) => (
                                    <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input placeholder="https://example.com/image.png" {...field} /></FormControl><FormMessage /></FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={productForm.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}
                                />
                                <FormField
                                    control={productForm.control}
                                    name="stock"
                                    render={({ field }) => (
                                        <FormItem><FormLabel>Stock</FormLabel><FormControl><Input type="number" step="1" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={productForm.control}
                                name="category_id"
                                render={({ field }) => (
                                    <FormItem><FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {categories.map(cat => (
                                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsProductDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>


            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the {deletingId?.type} "{deletingId?.name}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onConfirmDelete} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </Tabs>
    );
}
