'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  PlusCircle, 
  Search, 
  Download, 
  Upload,
  Filter,
  MoreHorizontal,
  Mail,
  Trash2,
  FileText
} from 'lucide-react';
import { CustomerDialog } from '@/components/customers/customer-dialog';
import { CustomerDetails } from '@/components/customers/customer-details';
import { staticData } from '@/lib/data/static-data';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

const statusColors = {
  active: 'bg-green-500',
  inactive: 'bg-gray-500',
  pending: 'bg-yellow-500',
};

export default function CustomersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const { toast } = useToast();
  const router = useRouter();

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  const handleCheckboxChange = (customerId: string, checked: boolean) => {
    const newSelected = new Set(selectedCustomers);
    if (checked) {
      newSelected.add(customerId);
    } else {
      newSelected.delete(customerId);
    }
    setSelectedCustomers(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = filteredCustomers.map(customer => customer.id.toString());
      setSelectedCustomers(new Set(allIds));
    } else {
      setSelectedCustomers(new Set());
    }
  };

  const handleBulkDelete = () => {
    // In a real app, this would make API calls
    toast({
      title: 'Success',
      description: `${selectedCustomers.size} customers would be deleted in a full app`,
      duration: 3000,
    });
    setSelectedCustomers(new Set());
  };

  const handleBulkEmail = () => {
    // In a real app, this would open an email composer
    toast({
      title: 'Info',
      description: `Email composer would open for ${selectedCustomers.size} customers in a full app`,
      duration: 3000,
    });
  };

  const handleExport = () => {
    // In a real app, this would generate and download a CSV
    toast({
      title: 'Info',
      description: 'Customer data would be exported to CSV in a full app',
      duration: 3000,
    });
  };

  const handleImport = () => {
    // In a real app, this would open a file picker
    toast({
      title: 'Info',
      description: 'CSV import would be available in a full app',
      duration: 3000,
    });
  };

  const filteredCustomers = staticData.customers.map(customer => ({
    ...customer,
    id: String(customer.id),
    status: customer.status.toLowerCase() as 'active' | 'inactive' | 'pending',
    type: customer.type.toLowerCase() as 'individual' | 'business'
  })).filter((customer) => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    const matchesType = typeFilter === 'all' || customer.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const hasSelected = selectedCustomers.size > 0;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleExport}
            title="Export to CSV"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleImport}
            title="Import from CSV"
          >
            <Upload className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center space-x-2"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Customer</span>
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="individual">Individual</SelectItem>
            <SelectItem value="business">Business</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {hasSelected && (
        <div className="bg-muted/50 p-2 rounded-md flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {selectedCustomers.size} customer(s) selected
          </span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkEmail}
              className="flex items-center space-x-2"
            >
              <Mail className="h-4 w-4" />
              <span>Email Selected</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Selected</span>
            </Button>
          </div>
        </div>
      )}

      {/* Customers Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedCustomers.size === filteredCustomers.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow
                key={customer.id}
                className="cursor-pointer"
                onClick={() => handleCustomerClick(customer)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedCustomers.has(customer.id.toString())}
                    onCheckedChange={(checked: boolean) => handleCheckboxChange(customer.id.toString(), checked)}
                  />
                </TableCell>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>
                  <Badge className={statusColors[customer.status]}>
                    {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {customer.type.charAt(0).toUpperCase() + customer.type.slice(1)}
                </TableCell>
                <TableCell>
                  {new Date(customer.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleCustomerClick(customer)}>
                        <FileText className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CustomerDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={(data) => {
          // In static export, we'll just show an alert
          toast({
            title: 'Success',
            description: 'Customer would be created here in a full app',
            duration: 3000,
          });
          setIsDialogOpen(false);
        }}
      />

      <CustomerDetails
        customer={selectedCustomer}
        open={!!selectedCustomer}
        onOpenChange={(open) => !open && setSelectedCustomer(null)}
        onEdit={(customer) => {
          // In a real app, this would open the edit dialog
          toast({
            title: 'Info',
            description: 'Edit functionality would be available in a full app',
            duration: 3000,
          });
        }}
        onDelete={(customer) => {
          // In a real app, this would delete the customer
          toast({
            title: 'Success',
            description: 'Customer would be deleted in a full app',
            duration: 3000,
          });
          setSelectedCustomer(null);
        }}
      />
    </div>
  );
}