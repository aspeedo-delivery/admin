
'use client';

import * as React from 'react';
import { useTransition } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Restaurant, MenuItemWithCategory, RestaurantCategory } from '@/types';
import { getMenuItemsColumns, MenuItemFormValues } from './menu-items-columns';
import { getCategoriesColumns, CategoryFormValues } from './categories-columns';
import { DataTable } from './data-table';

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
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Loader2 } from 'lucide-react';

interface MenuClientPageProps {
    restaurant: Restaurant;
    initialMenuItems: MenuItemWithCategory[];
    initialCategories: RestaurantCategory[];
}

const categoryFormSchema = z.object({
    id: z.string().optional(),
    category_name: z.string().min(1, 'Category name is required'),
});

const menuItemFormSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    price: z.coerce.number().min(0, 'Price must be non-negative'),
    category_id: z.string({ required_error: 'A category must be selected' }),
    is_veg: z.boolean(),
    in_stock: z.boolean(),
    image_url: z.string().url().optional().or(z.literal('')),
});


export function MenuClientPage({ restaurant, initialMenuItems, initialCategories }: MenuClientPageProps) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const [menuItems, setMenuItems] = React.useState(initialMenuItems);
    const [categories, setCategories] = React.useState(initialCategories);

    React.useEffect(() => setMenuItems(initialMenuItems), [initialMenuItems]);
    React.useEffect(() => setCategories(initialCategories), [initialCategories]);

    // State for dialogs
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = React.useState(false);
    const [isMenuItemDialogOpen, setIsMenuItemDialogOpen] = React.useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

    // State for data being edited or deleted
    const [editingCategory, setEditingCategory] = React.useState<CategoryFormValues | null>(null);
    const [editingMenuItem, setEditingMenuItem] = React.useState<MenuItemFormValues | null>(null);
    const [deletingId, setDeletingId] = React.useState<{ id: string, type: 'category' | 'menuItem', name: string } | null>(null);


    const categoryForm = useForm<z.infer<typeof categoryFormSchema>>({
        resolver: zodResolver(categoryFormSchema),
        defaultValues: { category_name: '' },
    });

    const menuItemForm = useForm<z.infer<typeof menuItemFormSchema>>({
        resolver: zodResolver(menuItemFormSchema),
        defaultValues: { name: '', description: '', price: 0, category_id: '', is_veg: false, in_stock: true, image_url: '' },
    });

    const handleOpenCategoryDialog = (category: CategoryFormValues | null = null) => {
        setEditingCategory(category);
        categoryForm.reset(category || { category_name: '' });
        setIsCategoryDialogOpen(true);
    };

    const handleOpenMenuItemDialog = (menuItem: MenuItemFormValues | null = null) => {
        setEditingMenuItem(menuItem);
        menuItemForm.reset(menuItem || { name: '', description: '', price: 0, is_veg: false, in_stock: true, image_url: '' });
        setIsMenuItemDialogOpen(true);
    };

    const handleOpenDeleteDialog = (id: string, name: string, type: 'category' | 'menuItem') => {
        setDeletingId({ id, name, type });
        setIsDeleteDialogOpen(true);
    }

    const onCategorySubmit = (values: z.infer<typeof categoryFormSchema>) => {
        startTransition(() => {
            if (editingCategory?.id) {
                setCategories(cats => cats.map(c => c.id === editingCategory.id ? { ...c, ...values } : c));
                toast({ title: 'Success', description: 'Category updated.' });
            } else {
                const newCategory = { ...values, id: `cat_${Date.now()}`, restaurant_id: restaurant.id };
                setCategories(cats => [...cats, newCategory]);
                toast({ title: 'Success', description: 'Category saved.' });
            }
            setIsCategoryDialogOpen(false);
        });
    };

    const onMenuItemSubmit = (values: z.infer<typeof menuItemFormSchema>) => {
        startTransition(() => {
            const category = categories.find(c => c.id === values.category_id);
            const itemWithCategory: MenuItemWithCategory = {
                id: values.id || `item_${Date.now()}`,
                name: values.name,
                description: values.description ?? null,
                price: values.price,
                category_id: values.category_id,
                is_veg: values.is_veg,
                in_stock: values.in_stock,
                image_url: values.image_url || null,
                restaurant_id: restaurant.id,
                restaurant_categories: { category_name: category?.category_name || 'N/A' },
                half_price: null,
                created_at: new Date().toISOString()
            };

            if (editingMenuItem?.id) {
                setMenuItems(items => items.map(i => i.id === editingMenuItem.id ? { ...i, ...itemWithCategory } : i));
                toast({ title: 'Success', description: 'Menu item updated.' });
            } else {
                setMenuItems(items => [...items, itemWithCategory]);
                toast({ title: 'Success', description: 'Menu item saved.' });
            }
            setIsMenuItemDialogOpen(false);
        });
    };

    const onConfirmDelete = () => {
        if (!deletingId) return;
        startTransition(() => {
            if (deletingId.type === 'category') {
                setCategories(cats => cats.filter(c => c.id !== deletingId.id));
            } else {
                setMenuItems(items => items.filter(i => i.id !== deletingId.id));
            }

            toast({ title: 'Success', description: `${deletingId.type} deleted.` });
            setIsDeleteDialogOpen(false);
            setDeletingId(null);
        });
    }

    const menuItemsCols = React.useMemo(() => getMenuItemsColumns(handleOpenMenuItemDialog, (id, name) => handleOpenDeleteDialog(id, name, 'menuItem')), []);
    const categoriesCols = React.useMemo(() => getCategoriesColumns(handleOpenCategoryDialog, (id, name) => handleOpenDeleteDialog(id, name, 'category')), []);

    return (
        <Tabs defaultValue="menu_items">
            <TabsList>
                <TabsTrigger value="menu_items">Menu Items</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>
            <TabsContent value="menu_items">
                <DataTable
                    columns={menuItemsCols}
                    data={menuItems}
                    filterColumnId="name"
                    filterPlaceholder="Filter by name..."
                >
                    <Button onClick={() => handleOpenMenuItemDialog()}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Menu Item
                    </Button>
                </DataTable>
            </TabsContent>
            <TabsContent value="categories">
                <DataTable
                    columns={categoriesCols}
                    data={categories}
                    filterColumnId="category_name"
                    filterPlaceholder="Filter by category..."
                >
                    <Button onClick={() => handleOpenCategoryDialog()}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Category
                    </Button>
                </DataTable>
            </TabsContent>

            {/* Category Dialog */}
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? 'Edit' : 'Add'} Category</DialogTitle>
                        <DialogDescription>
                            {editingCategory ? 'Update the details for this category.' : 'Create a new menu category.'}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...categoryForm}>
                        <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-4">
                            <FormField
                                control={categoryForm.control}
                                name="category_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category Name</FormLabel>
                                        <FormControl><Input placeholder="e.g., Appetizers" {...field} /></FormControl>
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

            {/* Menu Item Dialog */}
            <Dialog open={isMenuItemDialogOpen} onOpenChange={setIsMenuItemDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{editingMenuItem ? 'Edit' : 'Add'} Menu Item</DialogTitle>
                        <DialogDescription>
                            {editingMenuItem ? 'Update the details for this menu item.' : 'Add a new item to your menu.'}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...menuItemForm}>
                        <form onSubmit={menuItemForm.handleSubmit(onMenuItemSubmit)} className="space-y-4">
                            <FormField
                                control={menuItemForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="e.g., Spring Rolls" {...field} /></FormControl><FormMessage /></FormItem>
                                )}
                            />
                            <FormField
                                control={menuItemForm.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Crispy fried rolls with vegetable filling." {...field} /></FormControl><FormMessage /></FormItem>
                                )}
                            />
                            <FormField
                                control={menuItemForm.control}
                                name="image_url"
                                render={({ field }) => (
                                    <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input placeholder="https://example.com/image.png" {...field} /></FormControl><FormMessage /></FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={menuItemForm.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}
                                />
                                <FormField
                                    control={menuItemForm.control}
                                    name="category_id"
                                    render={({ field }) => (
                                        <FormItem><FormLabel>Category</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {categories.map(cat => (
                                                        <SelectItem key={cat.id} value={cat.id}>{cat.category_name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex items-center space-x-4">
                                <FormField
                                    control={menuItemForm.control}
                                    name="is_veg"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm flex-1">
                                            <div className="space-y-0.5"><FormLabel>Vegetarian?</FormLabel></div>
                                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={menuItemForm.control}
                                    name="in_stock"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm flex-1">
                                            <div className="space-y-0.5"><FormLabel>In Stock?</FormLabel></div>
                                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsMenuItemDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>


            {/* Delete Confirmation Dialog */}
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
