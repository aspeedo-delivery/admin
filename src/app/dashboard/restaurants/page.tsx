'use client';

import { useState, useEffect } from 'react';
import { columns } from './columns';
import { Restaurant } from '@/types';
import { DataTable } from './data-table';
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { supabase } from '@/lib/supabaseClient';

export default function RestaurantsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Prevent fetch until auth is ready
    if (!user) return;

    // ✅ Redirect if not admin
    if (user.role !== 'admin') {
      router.push('/login/admin');
      return;
    }

    const fetchRestaurants = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching restaurants:', error);
        setRestaurants([]);
      } else {
        setRestaurants(data ?? []);
      }

      setLoading(false);
    };

    fetchRestaurants();
  }, [user, router]);

  if (!user) {
    return <div className="p-6">Checking authentication...</div>;
  }

  if (loading) {
    return <div className="p-6">Loading restaurants...</div>;
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-6">Restaurant Management</h1>
      <DataTable columns={columns} data={restaurants} />
    </div>
  );
}
