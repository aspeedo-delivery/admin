
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MenuClientPage } from './menu-client-page';
import { Restaurant, MenuItemWithCategory, RestaurantCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { mockRestaurants, mockMenuItemsWithCategory, mockRestaurantCategories } from '@/lib/mock-data';

export default function MenuManagementPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItemWithCategory[]>([]);
  const [categories, setCategories] = useState<RestaurantCategory[]>([]);

  useEffect(() => {
    const foundRestaurant = mockRestaurants.find(r => r.id === id);
    if (!foundRestaurant) {
      router.push('/dashboard/restaurants?error=not_found');
      return;
    }

    setRestaurant(foundRestaurant);
    setMenuItems(mockMenuItemsWithCategory.filter(item => item.restaurant_id === id));
    setCategories(mockRestaurantCategories.filter(cat => cat.restaurant_id === id));
  }, [id, router]);

  if (!restaurant) {
    return <div>Loading restaurant data...</div>;
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard/restaurants">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            </Button>
            <div>
                <h1 className="text-3xl font-bold">Manage Menu</h1>
                <p className="text-muted-foreground">{restaurant.name}</p>
            </div>
        </div>
      </div>
      <MenuClientPage 
        restaurant={restaurant} 
        initialMenuItems={menuItems} 
        initialCategories={categories} 
      />
    </div>
  );
}
