
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        let redirectPath = '/dashboard';
        if(user.role === 'restaurant') {
            redirectPath = `/dashboard/restaurant-panel`;
        } else if (user.role === 'warehouse') {
            redirectPath = `/dashboard/warehouse`;
        }
        router.push(redirectPath);
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Loading...</p>
    </div>
  );
}
