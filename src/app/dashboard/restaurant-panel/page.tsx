
'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Loader2, Utensils, Dot, CalendarIcon, ChevronsUpDown, CheckCircle, Ban, CookingPot, Check } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
} from "@/components/ui/alert-dialog";
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
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import StatCard from '@/components/stat-card';
import { useAuth } from '@/context/auth-context';


const mockRestaurant = {
    name: 'Spice Villa',
    status: 'Open',
};

const mockMenu = [
    { id: 'item_1', name: 'Paneer Butter Masala', price: 220, category: 'Main Course', available: true, description: 'Creamy and rich paneer dish.', type: 'Veg' },
    { id: 'item_2', name: 'Chicken Biryani', price: 280, category: 'Main Course', available: true, description: 'Aromatic rice and chicken.', type: 'Non-Veg' },
    { id: 'item_3', name: 'Masala Dosa', price: 120, category: 'Snacks', available: false, description: 'Crispy crepe with potato filling.', type: 'Veg' },
    { id: 'item_4', name: 'Cold Coffee', price: 90, category: 'Drinks', available: true, description: 'Chilled coffee delight.', type: 'Veg' },
];

const mockCombos = [
    { id: 'combo_1', name: 'Veggie Delight Combo', items: ['item_1', 'item_3'], price: 320, available: true, type: 'Veg', description: 'Paneer Butter Masala and Masala Dosa.' },
    { id: 'combo_2', name: 'Full Meal', items: ['item_2', 'item_4'], price: 350, available: true, type: 'Non-Veg', description: 'Chicken Biryani and a refreshing Cold Coffee.' },
]

const mockTodayOrders = {
    pending: [{ orderId: 'ORD101', items: 3, total: 560, status: 'Pending', time: '12:30 PM' }, { orderId: 'ORD103', items: 1, total: 120, status: 'Pending', time: '12:35 PM' }],
    inProgress: [{ orderId: 'ORD102', items: 1, total: 280, status: 'In Progress', time: '12:32 PM' }],
    ready: [],
    completed: [{ orderId: 'ORD099', items: 2, total: 320, status: 'Completed', time: '11:50 AM' }],
    cancelled: [],
}

const mockAllOrders = {
    pending: [
        { orderId: "ORD201", items: 4, total: 720, date: "2025-01-10", status: "Pending" }
    ],
    completed: [
        { orderId: "ORD180", items: 3, total: 540, date: "2025-01-08", status: "Completed" },
        { orderId: "ORD172", items: 5, total: 890, date: "2025-01-07", status: "Completed" },
        { orderId: "ORD101", items: 2, total: 440, date: "2025-01-07", status: "Completed" },
    ],
    cancelled: [
        { orderId: "ORD165", items: 2, total: 260, date: "2025-01-05", status: "Cancelled" }
    ]
};

const mockCategories = ['Main Course', 'Snacks', 'Drinks', 'Desserts', 'Breads'];

const menuItemSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    price: z.coerce.number().min(0, 'Price must be non-negative'),
    category: z.string().min(1, 'Category is required'),
    type: z.enum(['Veg', 'Non-Veg']),
    available: z.boolean(),
});

const comboItemSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    price: z.coerce.number().min(0, "Price must be non-negative"),
    items: z.array(z.string()).min(2, "Please select at least 2 items"),
    type: z.enum(['Veg', 'Non-Veg', 'Mixed']),
    available: z.boolean(),
});


type MenuItemFormValues = z.infer<typeof menuItemSchema>;
type ComboItemFormValues = z.infer<typeof comboItemSchema>;
type Order = { orderId: string; items: number; total: number; status: string; time: string; };

export default function RestaurantPanelPage() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user && user.role !== 'restaurant') {
            router.push(`/login/restaurant`);
        }
    }, [user, router]);

    const [restaurant, setRestaurant] = React.useState(mockRestaurant);
    const [menu, setMenu] = React.useState(mockMenu);
    const [combos, setCombos] = React.useState(mockCombos);
    const [todayOrders, setTodayOrders] = React.useState(mockTodayOrders);
    const [allOrders, setAllOrders] = React.useState(mockAllOrders);


    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const [isMenuDialogOpen, setIsMenuDialogOpen] = React.useState(false);
    const [isComboDialogOpen, setIsComboDialogOpen] = React.useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

    const [editingMenuItem, setEditingMenuItem] = React.useState<MenuItemFormValues | null>(null);
    const [editingCombo, setEditingCombo] = React.useState<ComboItemFormValues | null>(null);
    const [deletingItemId, setDeletingItemId] = React.useState<{ id: string, name: string, type: 'menu' | 'combo' } | null>(null);

    const availableItems = menu.filter(item => item.available).length;
    const availableCombos = combos.filter(c => c.available).length;


    const menuForm = useForm<MenuItemFormValues>({
        resolver: zodResolver(menuItemSchema),
        defaultValues: { name: '', description: '', price: 0, category: '', type: 'Veg', available: true },
    });

    const comboForm = useForm<ComboItemFormValues>({
        resolver: zodResolver(comboItemSchema),
        defaultValues: { name: '', description: '', price: 0, items: [], type: 'Veg', available: true }
    })

    const handleToggleRestaurantStatus = (isOpen: boolean) => {
        startTransition(() => {
            setRestaurant(prev => ({ ...prev, status: isOpen ? 'Open' : 'Closed' }));
            toast({
                title: `Restaurant is now ${isOpen ? 'Open' : 'Closed'}`,
                description: isOpen ? 'You can now receive new orders.' : 'You will not receive new orders.',
            });
        });
    };

    const handleOpenMenuDialog = (item: MenuItemFormValues | null = null) => {
        setEditingMenuItem(item);
        menuForm.reset(item || { name: '', description: '', price: 0, category: '', type: 'Veg', available: true });
        setIsMenuDialogOpen(true);
    };

    const handleOpenComboDialog = (combo: ComboItemFormValues | null = null) => {
        setEditingCombo(combo);
        comboForm.reset(combo || { name: '', description: '', price: 0, items: [], type: 'Veg', available: true });
        setIsComboDialogOpen(true);
    }

    const handleOpenDeleteDialog = (id: string, name: string, type: 'menu' | 'combo') => {
        setDeletingItemId({ id, name, type });
        setIsDeleteDialogOpen(true);
    }

    const onMenuItemSubmit = (values: MenuItemFormValues) => {
        startTransition(() => {
            setTimeout(() => {
                if (editingMenuItem?.id) {
                    setMenu(menu.map(item => item.id === editingMenuItem.id ? { ...item, ...values, description: values.description || '' } : item));
                    toast({ title: "Success", description: "Menu item updated." });
                } else {
                    setMenu([...menu, { ...values, description: values.description || '', id: `item_${Date.now()}` }]);
                    toast({ title: "Success", description: "New menu item added." });
                }
                setIsMenuDialogOpen(false);
            }, 500);
        });
    }

    const onComboItemSubmit = (values: ComboItemFormValues) => {
        startTransition(() => {
            setTimeout(() => {
                if (editingCombo?.id) {
                    setCombos(combos.map(c => c.id === editingCombo.id ? { ...c, ...values, description: values.description || '' } : c));
                    toast({ title: "Success", description: "Combo updated." });
                } else {
                    setCombos([...combos, { ...values, description: values.description || '', id: `combo_${Date.now()}` }]);
                    toast({ title: "Success", description: "New combo added." });
                }
                setIsComboDialogOpen(false);
            }, 500);
        });
    }

    const onConfirmDelete = () => {
        if (!deletingItemId) return;
        startTransition(() => {
            setTimeout(() => {
                if (deletingItemId.type === 'menu') {
                    setMenu(menu.filter(item => item.id !== deletingItemId.id));
                } else {
                    setCombos(combos.filter(combo => combo.id !== deletingItemId.id));
                }
                toast({ title: "Success", description: `"${deletingItemId.name}" has been deleted.` });
                setIsDeleteDialogOpen(false);
                setDeletingItemId(null);
            }, 500);
        });
    }

    const getItemName = (id: string) => menu.find(m => m.id === id)?.name || 'Unknown Item';

    const handleUpdateOrderStatus = (orderId: string, fromStatus: keyof typeof todayOrders, toStatus: keyof typeof todayOrders) => {
        startTransition(() => {
            let orderToMove: Order | undefined;
            const newFromOrders = todayOrders[fromStatus].filter((order: Order) => {
                if (order.orderId === orderId) {
                    orderToMove = order;
                    return false;
                }
                return true;
            });

            if (orderToMove) {
                // Here I am casting orderToMove to Order.
                const movedOrder = { ...orderToMove, status: toStatus.toString() } as Order;
                const newToOrders = [...todayOrders[toStatus], movedOrder];

                setTodayOrders(prev => ({
                    ...prev,
                    [fromStatus]: newFromOrders,
                    [toStatus]: newToOrders,
                }));

                toast({
                    title: `Order ${orderId} updated`,
                    description: `Moved from ${fromStatus} to ${toStatus}.`
                });
            }
        });
    }

    const OrderTable = ({ title, orders, actions }: { title: string, orders: Order[], actions?: (order: Order) => React.ReactNode }) => (
        <div>
            <h3 className="text-lg font-semibold mb-2">{title} ({orders.length})</h3>
            {orders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No orders in this category.</p>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                {actions && <TableHead className="text-right">Actions</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map(order => (
                                <TableRow key={order.orderId}>
                                    <TableCell className="font-medium">{order.orderId}</TableCell>
                                    <TableCell>{order.time}</TableCell>
                                    <TableCell>{order.items}</TableCell>
                                    <TableCell className="text-right">₹{order.total.toFixed(2)}</TableCell>
                                    {actions && <TableCell className="text-right">{actions(order)}</TableCell>}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );


    return (
        <div className="w-full space-y-6">
            <h1 className="text-3xl font-bold">Restaurant Panel: {restaurant.name}</h1>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Restaurant Status</CardTitle>
                        <CardDescription>Control whether your restaurant is accepting orders.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="restaurant-status"
                                checked={restaurant.status === 'Open'}
                                onCheckedChange={handleToggleRestaurantStatus}
                                aria-label='Toggle restaurant status'
                            />
                            <Label htmlFor="restaurant-status" className="text-lg font-medium">{restaurant.status}</Label>
                        </div>
                        <Badge variant={restaurant.status === 'Open' ? 'default' : 'destructive'}>
                            {restaurant.status}
                        </Badge>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Total Menu Items</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-bold">{menu.length}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Items Available</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-bold">{availableItems} / {menu.length}</p></CardContent>
                </Card>
            </div>

            <Tabs defaultValue="today_orders">
                <TabsList className="grid w-full grid-cols-4 mb-4">
                    <TabsTrigger value="today_orders">Today's Orders</TabsTrigger>
                    <TabsTrigger value="all_orders">All Orders</TabsTrigger>
                    <TabsTrigger value="menu">Menu Items</TabsTrigger>
                    <TabsTrigger value="combos">Combos</TabsTrigger>
                </TabsList>
                <TabsContent value="today_orders">
                    <Card>
                        <CardHeader>
                            <CardTitle>Today's Orders</CardTitle>
                            <CardDescription>A summary of orders received today.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-4">
                                <StatCard title="Pending" value={todayOrders.pending.length.toString()} icon={Loader2} description="Orders waiting for acceptance." />
                                <StatCard title="In Progress" value={todayOrders.inProgress.length.toString()} icon={CookingPot} description="Orders being prepared." />
                                <StatCard title="Ready for Pickup" value={todayOrders.ready.length.toString()} icon={Check} description="Orders ready for the delivery partner." />
                                <StatCard title="Completed" value={todayOrders.completed.length.toString()} icon={CheckCircle} description="Orders successfully delivered today." />
                            </div>

                            <div className="space-y-6">
                                <OrderTable
                                    title="Pending"
                                    orders={todayOrders.pending}
                                    actions={(order) => (
                                        <div className="space-x-2">
                                            <Button size="sm" onClick={() => handleUpdateOrderStatus(order.orderId, 'pending', 'inProgress')}>Accept</Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleUpdateOrderStatus(order.orderId, 'pending', 'cancelled')}>Cancel</Button>
                                        </div>
                                    )}
                                />
                                <OrderTable
                                    title="In Progress"
                                    orders={todayOrders.inProgress}
                                    actions={(order) => (
                                        <Button size="sm" onClick={() => handleUpdateOrderStatus(order.orderId, 'inProgress', 'ready')}>Mark as Ready</Button>
                                    )}
                                />
                                <OrderTable
                                    title="Ready for Pickup"
                                    orders={todayOrders.ready}
                                />
                                <OrderTable
                                    title="Completed Today"
                                    orders={todayOrders.completed}
                                />
                            </div>

                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="all_orders">
                    <Card>
                        <CardHeader>
                            <CardTitle>All-Time Orders</CardTitle>
                            <CardDescription>A historical view of all orders.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-4">
                                <StatCard title="Total Orders" value={(allOrders.completed.length + allOrders.pending.length + allOrders.cancelled.length).toString()} icon={Utensils} />
                                <StatCard title="Completed" value={allOrders.completed.length.toString()} icon={CheckCircle} />
                                <StatCard title="Pending" value={allOrders.pending.length.toString()} icon={Loader2} />
                                <StatCard title="Cancelled" value={allOrders.cancelled.length.toString()} icon={Ban} />
                            </div>
                            <div className="flex items-center gap-4">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[280px] justify-start text-left font-normal",
                                                !allOrders && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            <span>Pick a date range</span>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        {/* Placeholder for DateRangePicker */}
                                        <p className="p-4 text-sm">Date Range Picker Here</p>
                                    </PopoverContent>
                                </Popover>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-[180px]">
                                            Filter by Status
                                            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem>All</DropdownMenuItem>
                                        <DropdownMenuItem>Pending</DropdownMenuItem>
                                        <DropdownMenuItem>Completed</DropdownMenuItem>
                                        <DropdownMenuItem>Cancelled</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Order History</h3>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Order ID</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Items</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {[...allOrders.pending, ...allOrders.completed, ...allOrders.cancelled]
                                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                                .map(order => (
                                                    <TableRow key={order.orderId}>
                                                        <TableCell className="font-medium">{order.orderId}</TableCell>
                                                        <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                                                        <TableCell>{order.items}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={order.status === 'Completed' ? 'default' : order.status === 'Cancelled' ? 'destructive' : 'secondary'}>
                                                                {order.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">₹{order.total.toFixed(2)}</TableCell>
                                                    </TableRow>
                                                ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="menu">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Menu Management</CardTitle>
                                <CardDescription>Add, edit, or remove items from your menu.</CardDescription>
                            </div>
                            <Button onClick={() => handleOpenMenuDialog()}>
                                <PlusCircle className="mr-2" /> Add Item
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="text-center">Availability</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {menu.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={cn(item.type === 'Veg' ? 'border-green-500 text-green-700' : 'border-red-500 text-red-700', 'bg-opacity-10')}>
                                                    <Dot className={cn("mr-1 h-4 w-4", item.type === 'Veg' ? 'text-green-500' : 'text-red-500')} />
                                                    {item.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
                                            <TableCell className="text-right">₹{item.price.toFixed(2)}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={item.available ? 'default' : 'destructive'}>
                                                    {item.available ? 'Available' : 'Unavailable'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => handleOpenMenuDialog(item as unknown as MenuItemFormValues)}>Edit</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive" onClick={() => handleOpenDeleteDialog(item.id, item.name, 'menu')}>Delete</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="combos">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Combo Management</CardTitle>
                                <CardDescription>Create and manage combo deals.</CardDescription>
                            </div>
                            <Button onClick={() => handleOpenComboDialog()}>
                                <PlusCircle className="mr-2" /> Add Combo
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Combo Name</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="text-center">Availability</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {combos.map((combo) => (
                                        <TableRow key={combo.id}>
                                            <TableCell className="font-medium">{combo.name}</TableCell>
                                            <TableCell className="text-muted-foreground text-xs max-w-xs truncate">{combo.items.map(getItemName).join(', ')}</TableCell>
                                            <TableCell className="text-right">₹{combo.price.toFixed(2)}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={combo.available ? 'default' : 'destructive'}>
                                                    {combo.available ? 'Available' : 'Unavailable'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => handleOpenComboDialog(combo as unknown as ComboItemFormValues)}>Edit</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive" onClick={() => handleOpenDeleteDialog(combo.id, combo.name, 'combo')}>Delete</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>


            {/* Menu Item Dialog */}
            <Dialog open={isMenuDialogOpen} onOpenChange={setIsMenuDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingMenuItem ? 'Edit' : 'Add'} Menu Item</DialogTitle>
                        <DialogDescription>
                            {editingMenuItem ? 'Update details for this item.' : 'Create a new item for your menu.'}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...menuForm}>
                        <form onSubmit={menuForm.handleSubmit(onMenuItemSubmit)} className="space-y-4">
                            <FormField
                                control={menuForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="e.g., Gulab Jamun" {...field} /></FormControl><FormMessage /></FormItem>
                                )}
                            />
                            <FormField
                                control={menuForm.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="A short, tasty description." {...field} /></FormControl><FormMessage /></FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={menuForm.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem><FormLabel>Price (₹)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}
                                />
                                <FormField
                                    control={menuForm.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem><FormLabel>Category</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {mockCategories.map(cat => (
                                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={menuForm.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel>Type</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex items-center space-x-4"
                                            >
                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                    <FormControl><RadioGroupItem value="Veg" /></FormControl>
                                                    <FormLabel className="font-normal">Veg</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                    <FormControl><RadioGroupItem value="Non-Veg" /></FormControl>
                                                    <FormLabel className="font-normal">Non-Veg</FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={menuForm.control}
                                name="available"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5"><FormLabel>Available?</FormLabel></div>
                                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsMenuDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {editingMenuItem ? 'Save Changes' : 'Create Item'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Combo Item Dialog */}
            <Dialog open={isComboDialogOpen} onOpenChange={setIsComboDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingCombo ? 'Edit' : 'Add'} Combo</DialogTitle>
                        <DialogDescription>
                            {editingCombo ? 'Update details for this combo.' : 'Create a new combo deal.'}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...comboForm}>
                        <form onSubmit={comboForm.handleSubmit(onComboItemSubmit)} className="space-y-4">
                            <FormField control={comboForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Combo Name</FormLabel><FormControl><Input placeholder="e.g., Family Feast" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={comboForm.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="A short description of the combo." {...field} /></FormControl><FormMessage /></FormItem>)} />

                            <FormField
                                control={comboForm.control}
                                name="items"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Menu Items</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value?.length && "text-muted-foreground")}>
                                                        {field.value?.length ? `${field.value.length} selected` : "Select items"}
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search items..." />
                                                    <CommandList>
                                                        <CommandEmpty>No results found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {menu.map((item) => (
                                                                <CommandItem
                                                                    key={item.id}
                                                                    onSelect={() => {
                                                                        const selected = field.value || [];
                                                                        const newSelection = selected.includes(item.id)
                                                                            ? selected.filter((id) => id !== item.id)
                                                                            : [...selected, item.id];
                                                                        field.onChange(newSelection);
                                                                    }}
                                                                >
                                                                    <Check className={cn("mr-2 h-4 w-4", (field.value || []).includes(item.id) ? "opacity-100" : "opacity-0")} />
                                                                    {item.name}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField control={comboForm.control} name="price" render={({ field }) => (<FormItem><FormLabel>Combo Price (₹)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />

                            <FormField
                                control={comboForm.control}
                                name="available"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5"><FormLabel>Available?</FormLabel></div>
                                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsComboDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {editingCombo ? 'Save Changes' : 'Create Combo'}
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
                            This action cannot be undone. This will permanently delete the item "{deletingItemId?.name}".
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

        </div>
    );
}