
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { mockTransport } from "@/lib/mock-data";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DeliveryPartnersPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/login/admin');
    }
  }, [user, router]);

  const deliveryPartners = mockTransport;

  return (
    <div className="w-full">
        <h1 className="text-3xl font-bold mb-6">Transport / Delivery Partner Management</h1>
        <Card>
            <CardHeader>
                <CardTitle>Transport Partners</CardTitle>
                <CardDescription>List of all transport partners and their status.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Vehicle ID</TableHead>
                            <TableHead>Driver Name</TableHead>
                            <TableHead>Current Route</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {deliveryPartners.map((partner) => (
                            <TableRow key={partner.vehicleId}>
                                <TableCell className="font-medium">{partner.vehicleId}</TableCell>
                                <TableCell>{partner.driver}</TableCell>
                                <TableCell>{partner.route}</TableCell>
                                <TableCell>
                                    <Badge variant={partner.status === 'Active' ? 'default' : 'secondary'}>{partner.status}</Badge>
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
