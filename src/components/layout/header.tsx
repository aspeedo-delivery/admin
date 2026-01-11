
'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, Home, Users, UtensilsCrossed, Package, Wallet, Truck as DeliveryTruckIcon, Store, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Icons } from '../icons';
import { useAuth, Role } from '@/context/auth-context';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navConfig: Record<Role, { href: string; icon: React.ElementType; label: string }[]> = {
  admin: [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/dashboard/users', icon: Users, label: 'Users' },
    { href: '/dashboard/restaurants', icon: UtensilsCrossed, label: 'Restaurants' },
    { href: '/dashboard/products', icon: ShoppingCart, label: 'Products' },
    { href: '/dashboard/orders/food', icon: Package, label: 'Food Orders' },
    { href: '/dashboard/orders/courier', icon: Package, label: 'Courier Orders' },
    { href: '/dashboard/wallet', icon: Wallet, label: 'Wallet' },
    { href: '/dashboard/delivery-partners', icon: DeliveryTruckIcon, label: 'Delivery Partners' },
    { href: '/dashboard/warehouse', icon: Icons.Warehouse, label: 'Warehouse' },
  ],
  restaurant: [
    { href: '/dashboard/restaurant-panel', icon: Store, label: 'My Panel' },
  ],
  warehouse: [
    { href: '/dashboard/warehouse', icon: Icons.Warehouse, label: 'Warehouse Panel' },
  ],
};

const getNavItems = (role: keyof typeof navConfig) => {
    return navConfig[role] || [];
}

const getLogoLink = (role: keyof typeof navConfig) => {
    return navConfig[role]?.[0]?.href || '/dashboard';
}

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  
  if (!user) return null;

  const navItems = getNavItems(user.role);
  const logoLink = getLogoLink(user.role);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href={logoLink}
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <span className="font-bold">A</span>
              <span className="sr-only">Aspeedoo Admin</span>
            </Link>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground",
                  pathname === item.href && "text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="relative ml-auto flex-1 md:grow-0">
        {/* Can add a search bar here if needed */}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
            <Image
              src="https://placehold.co/36x36.png"
              width={36}
              height={36}
              alt="Avatar"
              className="overflow-hidden rounded-full"
              data-ai-hint="avatar person"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
