
'use client';

import { columns } from './columns';
import { RestaurantOrder } from '@/types';
import { DataTable } from './data-table';
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { mockFoodOrders } from '@/lib/mock-data';


export default function FoodOrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/login/admin');
    }
    // Simulate fetching data
    setOrders(mockFoodOrders);
  }, [user, router]);

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-6">Food Orders</h1>
      <DataTable columns={columns} data={orders} />
    </div>
  );
}
