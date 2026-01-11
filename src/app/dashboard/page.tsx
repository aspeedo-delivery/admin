
'use client';
import { Users, UtensilsCrossed, Truck, IndianRupee, AlertCircle } from 'lucide-react';
import StatCard from '@/components/stat-card';
import OverviewChart from '@/components/overview-chart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RestaurantOrder, UserProfile as UserProfileType } from '@/types';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { mockDashboardStats, mockRecentOrders } from '@/lib/mock-data';
import { supabase } from '@/lib/supabaseClient';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    restaurants: 0,
    delivery_partners: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [chartData, setChartData] = useState<{ name: string, total: number }[]>([]);

  useEffect(() => {
    if (!user) return;

    if (user.role === 'restaurant') {
      router.push('/dashboard/restaurant-panel');
      return;
    } else if (user.role === 'warehouse') {
      router.push('/dashboard/warehouse');
      return;
    }

    if (user.role === 'admin') {
      fetchDashboardData();
    }
  }, [user, router]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Parallel fetching
      const [
        usersCount,
        restaurantsCount,
        partnersCount,
        pendingCount,
        revenueData,
        overviewData,
        recentData
      ] = await Promise.all([
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('restaurants').select('*', { count: 'exact', head: true }),
        supabase.from('delivery_partners').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('orders').select('total_amount').eq('status', 'delivered'),
        supabase.rpc('get_dashboard_overview'),
        supabase.from('orders')
          .select(`
                    id,
                    total_amount,
                    status,
                    created_at,
                    user_profiles (
                        full_name
                    )
                `)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      // Calculate Revenue
      const totalRev = revenueData.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      // Process Chart Data
      const processedChartData = (overviewData.data || []).map((item: any) => ({
        name: item.month,
        total: item.revenue
      }));

      setStats({
        users: usersCount.count || 0,
        restaurants: restaurantsCount.count || 0,
        delivery_partners: partnersCount.count || 0,
        totalRevenue: totalRev,
        pendingOrders: pendingCount.count || 0
      });

      setRecentOrders(recentData.data || []);
      setChartData(processedChartData);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    // Basic loading skeleton
    return (
      <div className="flex min-h-screen w-full flex-col gap-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 xl:grid-cols-5">
          <div className="col-span-1 lg:col-span-2 xl:col-span-3 h-[400px] rounded-xl bg-muted animate-pulse" />
          <div className="col-span-1 lg:col-span-1 xl:col-span-2 h-[400px] rounded-xl bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard title="Total Users" value={stats.users.toLocaleString()} icon={Users} description="All registered users" />
        <StatCard title="Total Restaurants" value={stats.restaurants.toLocaleString()} icon={UtensilsCrossed} description="All partner restaurants" />
        <StatCard title="Delivery Partners" value={stats.delivery_partners.toLocaleString()} icon={Truck} description="Available for deliveries" />
        <StatCard title="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={IndianRupee} description="From all food orders" />
        <StatCard title="Pending Orders" value={stats.pendingOrders.toLocaleString()} icon={AlertCircle} description="Food orders needing attention" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        <OverviewChart data={chartData} />
        <Card className="col-span-1 lg:col-span-1 xl:col-span-2">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Recent Food Orders</CardTitle>
              <CardDescription>The last 5 food orders placed.</CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/dashboard/orders">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="font-medium">{order.user_profiles?.full_name ?? 'Unknown Customer'}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="capitalize" variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">₹{(order.total_amount || 0).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                {!recentOrders.length && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground h-24">No recent orders found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
