
'use client';

import Link from 'next/link';
import {
  Home,
  Users,
  UtensilsCrossed,
  Package,
  Wallet,
  Truck as DeliveryTruckIcon,
  Settings,
  Store,
  ShoppingCart,
  FileCheck,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Icons } from '../icons';
import { useAuth, Role } from '@/context/auth-context';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navConfig: Record<Role, { href: string; icon: React.ElementType; label: string }[]> = {
  admin: [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/dashboard/users', icon: Users, label: 'Users' },
    { href: '/dashboard/restaurants', icon: UtensilsCrossed, label: 'Restaurants' },
    { href: '/dashboard/restaurants/approvals', icon: FileCheck, label: 'Restaurant Approvals' },
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

export default function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const navItems = getNavItems(user.role);
  const logoLink = getLogoLink(user.role);

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-card sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href={logoLink}
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <span className="font-bold">A</span>
          <span className="sr-only">Aspeedoo Admin</span>
        </Link>
        <TooltipProvider>
          {navItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                    pathname.startsWith(item.href) && item.href !== '/dashboard' && "bg-accent text-accent-foreground",
                    pathname === item.href && item.href === '/dashboard' && "bg-accent text-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </nav>
    </aside>
  );
}
