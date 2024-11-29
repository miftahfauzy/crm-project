'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  Mail, 
  Building2, 
  CalendarDays, 
  Edit, 
  Trash2,
  FileText,
  UserCircle 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface Customer {
  id: number | string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending';
  type: 'individual' | 'business';
  createdAt: string;
  updatedAt: string;
}

interface CustomerDetailsProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (customer: Customer) => void;
  onDelete?: (customer: Customer) => void;
}

const statusColors = {
  active: 'bg-green-500',
  inactive: 'bg-gray-500',
  pending: 'bg-yellow-500',
};

const typeIcons = {
  individual: UserCircle,
  business: Building2,
};

export function CustomerDetails({ 
  customer, 
  open, 
  onOpenChange,
  onEdit,
  onDelete 
}: CustomerDetailsProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!customer) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      onDelete?.(customer);
      toast({
        title: 'Success',
        description: 'Customer deleted successfully',
        duration: 3000,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete customer',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const TypeIcon = typeIcons[customer.type];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" aria-describedby="customer-details-description">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <TypeIcon className="h-6 w-6" />
            <span>{customer.name}</span>
            <Badge className={statusColors[customer.status]}>
              {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <div id="customer-details-description" className="sr-only">
          Detailed view of customer information showing contact details, status, type and creation date.
        </div>
        <div className="grid gap-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${customer.email}`} className="text-blue-500 hover:underline">
                  {customer.email}
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${customer.phone}`} className="text-blue-500 hover:underline">
                  {customer.phone}
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span>Customer for {formatDistanceToNow(new Date(customer.createdAt))}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onEdit?.(customer)}
              className="flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="flex items-center space-x-2"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the customer
                    and all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
