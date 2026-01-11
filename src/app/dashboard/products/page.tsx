'use client';

import { useState, useEffect } from 'react';
import { ProductClientPage } from './products-client-page';
import { Product, ProductCategory } from '@/types';
import { supabase } from '@/lib/supabaseClient';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      /* 1️⃣ Fetch Products */
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) {
        console.error('Error fetching products:', productsError);
      } else {
        setProducts(productsData ?? []);
      }

      /* 2️⃣ Fetch Categories */
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
      } else {
        setCategories(categoriesData ?? []);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-6">Loading products...</div>;
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Product Management</h1>
          <p className="text-muted-foreground">
            Add, edit, and manage all products and categories.
          </p>
        </div>
      </div>

      <ProductClientPage
        initialProducts={products}
        initialCategories={categories}
      />
    </div>
  );
}
