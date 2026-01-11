'use client';

import { useState, useEffect } from 'react';
import { columns, UserWithWallet } from './columns';
import { UserProfile } from '@/types';
import { DataTable } from './data-table';
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { supabase } from '@/lib/supabaseClient';

export default function UsersPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<UserWithWallet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // ✅ Redirect if not admin
    if (user.role !== 'admin') {
      router.push('/login/admin');
      return;
    }

    const fetchUsers = async () => {
      setLoading(true);

      // ✅ Fetch from Supabase table
      const { data, error } = await supabase
        .from('user_profiles') // <-- change to your exact table name if needed
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

    fetchUsers();
  }, [user, router]);

  if (!user) {
    return <div className="p-6">Checking authentication...</div>;
  }

  if (loading) {
    return <div className="p-6">Loading users...</div>;
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      <DataTable columns={columns} data={users} />
    </div>
  );
}
