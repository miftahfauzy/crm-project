import React from 'react';
import { render, screen, fireEvent } from '@/test/test-utils';
import { CustomerDetails } from '../customer-details';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  UserCircle: () => <div data-testid="user-circle-icon" />,
  Building2: () => <div data-testid="building2-icon" />,
  Phone: () => <div data-testid="phone-icon" />,
  Mail: () => <div data-testid="mail-icon" />,
  CalendarDays: () => <div data-testid="calendar-icon" />,
  Edit: () => <div data-testid="edit-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
  X: () => <div data-testid="x-icon" />,
}));

// Mock Dialog components
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }) => open ? <div role="dialog">{children}</div> : null,
  DialogContent: ({ children, ...props }) => <div {...props}>{children}</div>,
  DialogHeader: ({ children }) => <div>{children}</div>,
  DialogTitle: ({ children }) => <div>{children}</div>,
}));

// Mock Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
}));

// Mock Card components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children }) => <div>{children}</div>,
  CardContent: ({ children }) => <div>{children}</div>,
  CardHeader: ({ children }) => <div>{children}</div>,
  CardTitle: ({ children }) => <div>{children}</div>,
  CardDescription: ({ children }) => <div>{children}</div>,
}));

// Mock Badge component
jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className }) => <span className={className}>{children}</span>,
}));

// Mock AlertDialog components
jest.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children }) => <div>{children}</div>,
  AlertDialogTrigger: ({ children }) => <div>{children}</div>,
  AlertDialogContent: ({ children }) => <div>{children}</div>,
  AlertDialogHeader: ({ children }) => <div>{children}</div>,
  AlertDialogTitle: ({ children }) => <div>{children}</div>,
  AlertDialogDescription: ({ children }) => <div>{children}</div>,
  AlertDialogFooter: ({ children }) => <div>{children}</div>,
  AlertDialogCancel: ({ children }) => <button>{children}</button>,
  AlertDialogAction: ({ children, onClick }) => <button data-testid="confirm-delete" onClick={onClick}>{children}</button>,
}));

const mockCustomer = {
  id: '1',
  name: 'Test Customer',
  email: 'test@example.com',
  phone: '123-456-7890',
  company: 'Test Company',
  status: 'active' as const,
  type: 'individual' as const,
  notes: 'Test notes',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

describe('CustomerDetails', () => {
  it('should render with proper accessibility attributes', () => {
    render(
      <CustomerDetails 
        customer={mockCustomer}
        open={true}
        onOpenChange={() => {}}
      />
    );
    
    // Check if dialog content has proper aria-describedby
    const dialogContent = screen.getByRole('dialog');
    expect(dialogContent).toBeInTheDocument();
    
    // Verify the description is present and hidden
    const description = screen.getAllByText(/Detailed view of customer information/)[0];
    expect(description).toHaveClass('sr-only');
  });

  it('should display customer information with proper headings and structure', () => {
    render(
      <CustomerDetails 
        customer={mockCustomer}
        open={true}
        onOpenChange={() => {}}
      />
    );

    // Check that customer information is properly labeled
    expect(screen.getByText(mockCustomer.name)).toBeInTheDocument();
    expect(screen.getByText(mockCustomer.email)).toBeInTheDocument();
    expect(screen.getByText(mockCustomer.phone)).toBeInTheDocument();
  });

  it('should handle edit and delete actions', () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    
    render(
      <CustomerDetails 
        customer={mockCustomer}
        open={true}
        onOpenChange={() => {}}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    // Test edit button
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    expect(onEdit).toHaveBeenCalledWith(mockCustomer);

    // Test delete button and confirmation
    const deleteButton = screen.getByTestId('trash-icon').closest('button');
    if (!deleteButton) throw new Error('Delete button not found');
    fireEvent.click(deleteButton);
    
    // Confirm deletion
    const confirmDeleteButton = screen.getByTestId('confirm-delete');
    fireEvent.click(confirmDeleteButton);

    expect(onDelete).toHaveBeenCalledWith(mockCustomer);
  });

  it('should have proper ARIA labels and roles', () => {
    render(
      <CustomerDetails 
        customer={mockCustomer}
        open={true}
        onOpenChange={() => {}}
      />
    );

    // Check for proper dialog role and labeling
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // Check for proper heading structure
    expect(screen.getByText('Contact Information')).toBeInTheDocument();

    // Check for accessible links
    const emailLink = screen.getByRole('link', { name: mockCustomer.email });
    expect(emailLink).toHaveAttribute('href', `mailto:${mockCustomer.email}`);

    const phoneLink = screen.getByRole('link', { name: mockCustomer.phone });
    expect(phoneLink).toHaveAttribute('href', `tel:${mockCustomer.phone}`);
  });
});
