
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { MenuItem, RestaurantCategory } from '@/types';

const categorySchema = z.object({
  id: z.string().optional(),
  category_name: z.string().min(1, 'Category name is required'),
  restaurant_id: z.string(),
});

export async function saveCategory(formData: FormData) {
  const rawData: Partial<RestaurantCategory> = Object.fromEntries(formData.entries());
  
  const validatedFields = categorySchema.safeParse(rawData);
  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }
  
  console.log("Saving category (mock):", validatedFields.data);
  revalidatePath(`/dashboard/restaurants/${validatedFields.data.restaurant_id}/menu`);
  return { success: true };
}

export async function deleteCategory(categoryId: string, restaurantId: string) {
    console.log("Deleting category (mock):", categoryId);
    revalidatePath(`/dashboard/restaurants/${restaurantId}/menu`);
    return { success: true };
}


const menuItemSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    price: z.coerce.number().min(0, 'Price must be non-negative'),
    category_id: z.string().uuid('A category must be selected'),
    is_veg: z.enum(['true', 'false']).transform(value => value === 'true'),
    in_stock: z.enum(['true', 'false']).transform(value => value === 'true'),
    image_url: z.string().url().optional().or(z.literal('')),
    restaurant_id: z.string(),
});


export async function saveMenuItem(formData: FormData) {
  const rawData: Partial<MenuItem> = Object.fromEntries(formData.entries());
  
  const validatedFields = menuItemSchema.safeParse(rawData);
  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  console.log("Saving menu item (mock):", validatedFields.data);
  revalidatePath(`/dashboard/restaurants/${validatedFields.data.restaurant_id}/menu`);
  return { success: true };
}

export async function deleteMenuItem(menuItemId: string, restaurantId: string) {
    console.log("Deleting menu item (mock):", menuItemId);
    revalidatePath(`/dashboard/restaurants/${restaurantId}/menu`);
    return { success: true };
}
