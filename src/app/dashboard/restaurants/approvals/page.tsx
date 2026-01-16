"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { supabase } from "@/lib/supabaseClient"
import { RestaurantDetails } from "@/types"
import { getColumns } from "./columns" // Updated import
import { DataTable } from "./data-table"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function RestaurantApprovalsPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [data, setData] = useState<RestaurantDetails[]>([])
    const [loading, setLoading] = useState(true)

    const fetchData = useCallback(async () => {
        // Only set loading to true on initial load or manual refresh if we wanted a spinner
        // But for seamless updates, maybe don't set loading=true on re-fetch?
        // Let's keep it simple: if empty (initial), load. If refreshing, maybe show spinner or just update.
        // For now, simple re-fetch.

        // We won't set loading=true here to avoid flashing layout on every approval
        // But we might want a small indicator. For now, just update.

        const { data: result, error } = await supabase
            .from("restaurant_details")
            .select("*")
            .order("created_at", { ascending: false })

        if (error) {
            console.error("Error fetching restaurant approvals:", error)
        } else {
            setData((result as RestaurantDetails[]) || [])
        }
    }, [])

    useEffect(() => {
        if (!user) return;
        if (user.role !== 'admin') {
            router.push('/login/admin');
            return;
        }

        setLoading(true)
        fetchData().finally(() => setLoading(false))
    }, [user, router, fetchData])

    // Memoize columns to prevent re-renders, passing fetchData as onSuccess
    const columns = useMemo(() => getColumns(fetchData), [fetchData])

    // Filter data based on tabs
    const pendingData = data.filter(item => item.status === 'pending')
    const approvedData = data.filter(item => item.status === 'approved')
    const rejectedData = data.filter(item => item.status === 'rejected')

    if (loading) {
        return <div className="p-8">Loading approvals...</div>
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Restaurant Approvals</h1>
            </div>

            <Tabs defaultValue="pending" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="pending" className="relative">
                        Pending
                        {pendingData.length > 0 && (
                            <span className="ml-2 rounded-full bg-yellow-500 text-white text-[10px] px-2 py-0.5">
                                {pendingData.length}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                    <TabsTrigger value="all">All Applications</TabsTrigger>
                </TabsList>

                <TabsContent value="pending">
                    <DataTable columns={columns} data={pendingData} filterColumnId="name" />
                </TabsContent>
                <TabsContent value="approved">
                    <DataTable columns={columns} data={approvedData} filterColumnId="name" />
                </TabsContent>
                <TabsContent value="rejected">
                    <DataTable columns={columns} data={rejectedData} filterColumnId="name" />
                </TabsContent>
                <TabsContent value="all">
                    <DataTable columns={columns} data={data} filterColumnId="name" />
                </TabsContent>
            </Tabs>
        </div>
    )
}
