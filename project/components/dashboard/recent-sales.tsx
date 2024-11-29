'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const recentSales = [
  {
    name: 'John Smith',
    email: 'john.smith@example.com',
    amount: '$250.00',
    initials: 'JS',
    image: null
  },
  {
    name: 'Sarah Davis',
    email: 'sarah.davis@example.com',
    amount: '$890.00',
    initials: 'SD',
    image: null
  },
  {
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    amount: '$450.00',
    initials: 'MC',
    image: null
  },
  {
    name: 'Emma Wilson',
    email: 'emma.wilson@example.com',
    amount: '$1,250.00',
    initials: 'EW',
    image: null
  },
  {
    name: 'David Brown',
    email: 'david.brown@example.com',
    amount: '$590.00',
    initials: 'DB',
    image: null
  }
];

export function RecentSales() {
  return (
    <div className="space-y-8">
      {recentSales.map((sale, index) => (
        <div key={index} className="flex items-center">
          <Avatar className="h-9 w-9">
            {sale.image && <AvatarImage src={sale.image} alt="Avatar" />}
            <AvatarFallback>{sale.initials}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{sale.name}</p>
            <p className="text-sm text-muted-foreground">{sale.email}</p>
          </div>
          <div className="ml-auto font-medium">{sale.amount}</div>
        </div>
      ))}
    </div>
  );
}