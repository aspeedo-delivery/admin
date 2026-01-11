
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, CheckCheck, QrCode, Truck, Loader2, PlusCircle, Boxes, CheckCircle, Package } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { mockWarehouseProducts } from "@/lib/mock-data";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { useAuth } from '@/context/auth-context';
import StatCard from '@/components/stat-card';
import { Icons } from '@/components/icons';

export default function WarehousePage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [products, setProducts] = useState(mockWarehouseProducts);
    const [otp, setOtp] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (!loading && (!user || (user.role !== 'warehouse' && user.role !== 'admin'))) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user || (user.role !== 'warehouse' && user.role !== 'admin')) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center">
                <p>Loading or Access Denied...</p>
            </div>
        );
    }

    const stats = {
        totalShipments: products.length,
        inTransit: products.filter(p => p.status === 'In Transit').length,
        delivered: products.filter(p => p.status === 'Delivered').length,
        inWarehouse: products.filter(p => p.status === 'Stored in Warehouse').length,
    };

    const updateProductStatus = (productId: string, newStatus: string) => {
        setProducts(prevProducts =>
            prevProducts.map(p => p.productId === productId ? { ...p, status: newStatus } : p)
        );
    };

    const handleAction = (productId: string, action: string, correctOtp?: string) => {
        setIsVerifying(true);
        setTimeout(() => {
            let success = true;

            if ((action === "pickup" || action === "handover" || action === "confirm_delivery") && otp !== correctOtp) {
                success = false;
                toast({ variant: 'destructive', title: "Error", description: `Invalid OTP provided for ${action.replace('_', ' ')}.` });
            }

            if (success) {
                let message = "";
                let newStatus = "";
                switch (action) {
                    case "register":
                        newStatus = "Registered";
                        message = "Product registered.";
                        break;
                    case "store":
                        newStatus = "Stored in Warehouse";
                        message = "Product stored in warehouse.";
                        break;
                    case "assign_transport":
                        newStatus = "Assigned to Transport";
                        message = "Transport assigned.";
                        break;
                    case "pickup":
                        newStatus = "In Transit";
                        message = "Product picked up by transport.";
                        break;
                    case "handover":
                        newStatus = "Reached Destination Agent";
                        message = "Product handed over at destination.";
                        break;
                    case "confirm_delivery":
                        newStatus = "Delivered";
                        message = "Delivery confirmed!";
                        break;
                }
                if (newStatus) {
                    updateProductStatus(productId, newStatus);
                }
                if (message) {
                    toast({ title: "Success", description: message });
                }
            }

            setIsVerifying(false);
            setOtp("");
        }, 1000);
    };


    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Warehouse Dashboard</h1>
                <Button><PlusCircle className="mr-2" /> Register New Product</Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <StatCard title="Total Shipments" value={stats.totalShipments.toString()} icon={Boxes} />
                <StatCard title="In Warehouse" value={stats.inWarehouse.toString()} icon={Icons.Warehouse} />
                <StatCard title="In Transit" value={stats.inTransit.toString()} icon={Truck} />
                <StatCard title="Delivered" value={stats.delivered.toString()} icon={CheckCircle} />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Master Product Log</CardTitle>
                    <CardDescription>Manage and track all products in the logistics lifecycle.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Source/Dest.</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow key={product.productId}>
                                    <TableCell className="font-medium">{product.productId}</TableCell>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell><Badge variant={product.status === "Delivered" ? "default" : "secondary"}>{product.status}</Badge></TableCell>
                                    <TableCell>
                                        <div className="text-xs">
                                            <p>From: {product.sourceAgent}</p>
                                            <p>To: {product.destinationAgent}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="space-x-1">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm"><QrCode className="mr-2" /> View QR</Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>QR Code for {product.productId}</DialogTitle>
                                                    <DialogDescription>
                                                        This QR code is used for scanning and tracking the product.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="flex items-center justify-center p-4">
                                                    <Image src={product.qrCode} alt={`QR Code for ${product.productId}`} width={200} height={200} data-ai-hint="qr code" />
                                                </div>
                                            </DialogContent>
                                        </Dialog>

                                        <Button variant="outline" size="sm" onClick={() => handleAction(product.productId, "assign_transport")} disabled={product.status !== 'Stored in Warehouse' || isVerifying}>
                                            <Package className="mr-2" /> Assign Transport
                                        </Button>

                                        <Dialog onOpenChange={() => setOtp('')}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" disabled={product.status !== 'Assigned to Transport' || isVerifying}>
                                                    <Check className="mr-2" /> Pickup
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Pickup Verification</DialogTitle>
                                                    <DialogDescription>Enter OTP from Source Agent to take custody.</DialogDescription>
                                                </DialogHeader>
                                                <div className="flex flex-col items-center justify-center p-4 gap-4">
                                                    <div className="w-full max-w-sm space-y-2">
                                                        <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="4-digit OTP" />
                                                        <Button className="w-full" onClick={() => handleAction(product.productId, "pickup", product.otp)} disabled={isVerifying}>
                                                            {isVerifying && <Loader2 className="animate-spin mr-2" />}
                                                            Verify & Receive
                                                        </Button>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>

                                        <Dialog onOpenChange={() => setOtp('')}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" disabled={product.status !== 'In Transit' || isVerifying}>
                                                    <Truck className="mr-2" /> Handover
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Handover Verification</DialogTitle>
                                                    <DialogDescription>Enter handover to destination agent.</DialogDescription>
                                                </DialogHeader>
                                                <div className="flex flex-col items-center justify-center p-4 gap-4">
                                                    <div className="w-full max-w-sm space-y-2">
                                                        <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="4-digit OTP" />
                                                        <Button className="w-full" onClick={() => handleAction(product.productId, "handover", product.otp)} disabled={isVerifying}>
                                                            {isVerifying && <Loader2 className="animate-spin mr-2" />}
                                                            Verify & Handover
                                                        </Button>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>

                                        <Dialog onOpenChange={() => setOtp('')}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" disabled={product.status !== 'Reached Destination Agent' || isVerifying}>
                                                    <CheckCheck className="mr-2" /> Deliver
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Confirm Final Delivery</DialogTitle>
                                                    <DialogDescription>Enter OTP from the receiver to confirm delivery.</DialogDescription>
                                                </DialogHeader>
                                                <div className="flex flex-col items-center justify-center p-4 gap-4">
                                                    <div className="w-full max-w-sm space-y-2">
                                                        <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="4-digit OTP" />
                                                        <Button className="w-full" onClick={() => handleAction(product.productId, "confirm_delivery", product.otp)} disabled={isVerifying}>
                                                            {isVerifying && <Loader2 className="animate-spin mr-2" />}
                                                            Verify & Mark Delivered
                                                        </Button>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
