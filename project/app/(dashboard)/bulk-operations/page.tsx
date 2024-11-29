'use client';

import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Grid } from '@/components/ui/grid';
import { staticData } from '@/lib/data/static-data';

export default function BulkOperationsDashboard() {
  return (
    <div className="container mx-auto p-8">
      <Toaster />
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Bulk Operations</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Tag Management</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage tags for multiple items at once
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Order Queries</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Run complex queries on orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Report Generation</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Generate reports from order data
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6">
          {staticData.orders.slice(0, 5).map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <h4 className="text-sm font-semibold">Order #{order.id}</h4>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Status: {order.status}
                  <br />
                  Total: ${order.total}
                  <br />
                  Created: {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
