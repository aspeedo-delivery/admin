'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { UserWithWallet } from '@/app/dashboard/users/columns';
import { DataTable } from '@/app/dashboard/users/data-table';
import { Button } from '@/components/ui/button';
import { WalletCards, MoreHorizontal, ArrowUpDown } from 'lucide-react';
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WalletManagerDialog } from './wallet-manager-dialog';

export default function WalletPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<UserWithWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithWallet | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'admin') {
      router.push('/login/admin');
      return;
    }
    fetchUsers();
  }, [user, router]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
          *,
          wallet_balance (
            balance
          )
        `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } else {
      setUsers(data ?? []);
    }
    setLoading(false);
  };

  const openManager = (user: UserWithWallet) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleManagerSuccess = () => {
    fetchUsers(); // Re-fetch list to update balances in table
    if (selectedUser) {
      // We also need to update the selectedUser object so the modal sees the new balance immediately if it stays open or re-opens
      // However, fetching users updates the list, but not the 'selectedUser' state automatically if it's a copy.
      // Actually simpler: re-find the user from the new list or just let fetchUsers update the table.
      // If we want the modal to update live, we should verify wallet-manager-dialog handles user updates.
      // But for now, just refreshing the table data is key.
    }
  };

  const columns: ColumnDef<UserWithWallet>[] = [
    {
      accessorKey: "full_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.full_name || 'N/A'}</span>
          <span className="text-xs text-muted-foreground">{row.original.email}</span>
        </div>
      )
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      accessorKey: "wallet_balance",
      header: () => <div className="text-right">Balance</div>,
      cell: ({ row }) => {
        const balance = row.original.wallet_balance?.balance ?? 0;
        return (
          <div className="text-right font-bold text-base">
            {new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
            }).format(Number(balance))}
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex justify-end">
            <Button size="sm" onClick={() => openManager(u)}>
              <WalletCards className="mr-2 h-4 w-4" />
              Manage Wallet
            </Button>
          </div>
        )
      },
    },
  ];

  if (loading) {
    return <div className="p-6">Loading wallets...</div>;
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Wallet Management</h1>
      </div>

      <DataTable columns={columns} data={users} filterColumnId="full_name" filterPlaceholder="Filter by name..." />

      <WalletManagerDialog
        user={selectedUser}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={handleManagerSuccess}
      />
    </div>
  );
}
