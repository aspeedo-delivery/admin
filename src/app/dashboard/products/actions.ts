
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { ProductCategory, Product } from '@/types';

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Category name is required'),
});

export async function saveCategory(formData: FormData) {
  const rawData: Partial<ProductCategory> = Object.fromEntries(formData.entries());
  
  const validatedFields = categorySchema.safeParse(rawData);
  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }
  
  console.log("Saving product category (mock):", validatedFields.data);
  revalidatePath(`/dashboard/products`);
  return { success: true };
}

export async function deleteCategory(categoryId: string) {
    console.log("Deleting product category (mock):", categoryId);
    revalidatePath(`/dashboard/products`);
    return { success: true };
}


const productSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    price: z.coerce.number().min(0, 'Price must be non-negative'),
    stock: z.coerce.number().int().min(0, 'Stock must be non-negative'),
    category_id: z.string().min(1,'A category must be selected'),
    image_url: z.string().url().optional().or(z.literal('')),
});


export async function saveProduct(formData: FormData) {
  const rawData: Partial<Product> = Object.fromEntries(formData.entries());
  
  const validatedFields = productSchema.safeParse(rawData);
  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  console.log("Saving product (mock):", validatedFields.data);
  revalidatePath(`/dashboard/products`);
  return { success: true };
}

export async function deleteProduct(productId: string) {
    console.log("Deleting product (mock):", productId);
    revalidatePath(`/dashboard/products`);
    return { success: true };
}
