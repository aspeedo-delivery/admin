"use client";

import { useState, useEffect } from "react";
import { UserWithWallet } from "@/app/dashboard/users/columns";
import { supabase } from "@/lib/supabaseClient";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface WalletManagerDialogProps {
    user: UserWithWallet | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function WalletManagerDialog({
    user,
    isOpen,
    onClose,
    onSuccess,
}: WalletManagerDialogProps) {
    const { toast } = useToast();
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Fetch transactions when dialog opens or user changes
    useEffect(() => {
        if (isOpen && user) {
            fetchTransactions();
            // Reset form
            setAmount("");
            setDescription("");
        }
    }, [isOpen, user]);

    const fetchTransactions = async () => {
        if (!user) return;
        setLoadingHistory(true);
        const { data, error } = await supabase
            .from('wallet_transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('timestamp', { ascending: false });

        if (error) {
            console.error("Error fetching transactions:", error);
        } else {
            setTransactions(data ?? []);
        }
        setLoadingHistory(false);
    };

    const handleAdjustBalance = async (type: "credit" | "debit") => {
        if (!user) return;
        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) {
            toast({
                variant: "destructive",
                title: "Invalid Amount",
                description: "Please enter a valid positive number.",
            });
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.rpc("admin_wallet_adjust_balance", {
                p_user_id: user.id,
                p_amount: val,
                p_type: type,
                p_description: description || (type === 'credit' ? 'Admin Credited' : 'Admin Debited'),
            });

            if (error) throw error;

            toast({
                title: "Success",
                description: `Successfully ${type === "credit" ? "added" : "deducted"} money.`,
            });
            onSuccess(); // Refresh parent list
            fetchTransactions(); // Refresh local history
            setAmount("");
            setDescription("");
        } catch (error: any) {
            console.error("Wallet adjustment error:", JSON.stringify(error, null, 2), error);

            let msg = error.message || "Failed to adjust balance.";
            if (error.code === 'PGRST202') {
                msg = "Critical: The 'admin_wallet_adjust_balance' function is missing directly in the database. Please run the provided SQL script.";
            }

            toast({
                variant: "destructive",
                title: "Error",
                description: msg,
            });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Manage Wallet: {user.full_name || user.email}</DialogTitle>
                    <DialogDescription>
                        View history and adjust wallet balance for this user.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
                            <h2 className="text-3xl font-bold">
                                {new Intl.NumberFormat("en-IN", {
                                    style: "currency",
                                    currency: "INR",
                                }).format(user.wallet_balance?.balance ?? 0)}
                            </h2>
                        </div>
                    </div>

                    <Tabs defaultValue="add" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="add">Add Money</TabsTrigger>
                            <TabsTrigger value="deduct">Deduct Money</TabsTrigger>
                        </TabsList>
                        <div className="p-4 border rounded-md mt-2">
                            <TabsContent value="add" className="space-y-4 m-0">
                                <div className="space-y-2">
                                    <Label>Amount</Label>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input
                                        placeholder="Reason for adding money..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                                <Button
                                    className="w-full"
                                    onClick={() => handleAdjustBalance("credit")}
                                    disabled={loading}
                                >
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Add Money
                                </Button>
                            </TabsContent>
                            <TabsContent value="deduct" className="space-y-4 m-0">
                                <div className="space-y-2">
                                    <Label>Amount</Label>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input
                                        placeholder="Reason for deducting money..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                                <Button
                                    variant="destructive"
                                    className="w-full"
                                    onClick={() => handleAdjustBalance("debit")}
                                    disabled={loading}
                                >
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Deduct Money
                                </Button>
                            </TabsContent>
                        </div>
                    </Tabs>

                    <div className="space-y-2">
                        <h3 className="text-lg font-medium">Transaction History</h3>
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loadingHistory ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">
                                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                            </TableCell>
                                        </TableRow>
                                    ) : transactions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                                No transaction history found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        transactions.map((tx) => (
                                            <TableRow key={tx.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {tx.type === 'credit' ? <ArrowDownLeft className="h-4 w-4 text-green-500" /> : <ArrowUpRight className="h-4 w-4 text-red-500" />}
                                                        <span className="capitalize">{tx.type}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className={tx.type === 'credit' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                                    {tx.type === 'credit' ? '+' : '-'}{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(tx.amount)}
                                                </TableCell>
                                                <TableCell>{tx.description || '-'}</TableCell>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    {new Date(tx.timestamp || tx.created_at).toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
