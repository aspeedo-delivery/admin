
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CourierOrdersPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/login/admin');
    }
  }, [user, router]);
  
  return (
    <div className="w-full">
        <h1 className="text-3xl font-bold mb-6">Courier Orders</h1>
        <Card>
            <CardHeader>
                <CardTitle>Under Construction</CardTitle>
                <CardDescription>This page is currently under development. Check back soon!</CardDescription>
            </CardHeader>
            <CardContent>
                <p>The courier orders management section will allow you to view and manage all non-food delivery orders.</p>
            </CardContent>
        </Card>
    </div>
  );
}
