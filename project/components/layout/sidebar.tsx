'use client';

import { cn } from '@/lib/utils';
import {
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  Mail,
  MessageSquare,
  Home,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const routes = [
  {
    label: 'Dashboard',
    icon: Home,
    href: '/dashboard',
  },
  {
    label: 'Customers',
    icon: Users,
    href: '/customers',
  },
  {
    label: 'Orders',
    icon: ShoppingCart,
    href: '/orders',
  },
  {
    label: 'Analytics',
    icon: BarChart3,
    href: '/analytics',
  },
  {
    label: 'Marketing',
    icon: Mail,
    href: '/marketing',
  },
  {
    label: 'Support',
    icon: MessageSquare,
    href: '/support',
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/settings',
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-card text-card-foreground border-r">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold">ModernCRM</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition',
                pathname === route.href ? 'text-primary bg-primary/10' : 'text-muted-foreground',
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className="h-5 w-5 mr-3" />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}