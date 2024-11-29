import React from 'react';
import { render, screen, fireEvent, within, waitFor } from '@/test/test-utils';
import { act } from 'react-dom/test-utils';
import CustomersPage from '../page';
import { staticData } from '@/lib/data/static-data';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    };
  },
}));

describe('CustomersPage', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders the customers page', () => {
    render(<CustomersPage />);
    expect(screen.getByText('Customers')).toBeInTheDocument();
  });

  it('displays customer data in the table', () => {
    render(<CustomersPage />);
    staticData.customers.forEach((customer) => {
      expect(screen.getByText(customer.name)).toBeInTheDocument();
      expect(screen.getByText(customer.email)).toBeInTheDocument();
    });
  });

  it('filters customers by search query', () => {
    render(<CustomersPage />);
    const searchInput = screen.getByPlaceholderText('Search customers...');
    
    // Get the first customer from static data
    const firstCustomer = staticData.customers[0];
    
    // Search for the first customer's name
    fireEvent.change(searchInput, { target: { value: firstCustomer.name } });
    
    // Should show the matching customer
    expect(screen.getByText(firstCustomer.name)).toBeInTheDocument();
    expect(screen.getByText(firstCustomer.email)).toBeInTheDocument();
    
    // Other customers should not be visible
    staticData.customers.slice(1).forEach((customer) => {
      const nameElements = screen.queryAllByText(customer.name);
      expect(nameElements.length).toBe(0);
    });
  });

  it('filters customers by status', async () => {
    render(<CustomersPage />);
    
    // Open status filter dropdown
    const statusFilter = screen.getByRole('combobox', { name: /Filter by status/i });
    fireEvent.click(statusFilter);
    
    // Wait for and select 'Active' status from the dropdown
    await waitFor(() => {
      const activeOption = screen.getByRole('option', { name: /Active/i });
      fireEvent.click(activeOption);
    });
    
    // Check if only active customers are displayed
    const rows = screen.getAllByRole('row');
    rows.slice(1).forEach((row) => { // Skip header row
      expect(within(row).getByText('Active')).toBeInTheDocument();
    });
  });

  it('filters customers by type', async () => {
    render(<CustomersPage />);
    
    // Open type filter dropdown
    const typeFilter = screen.getByRole('combobox', { name: /Filter by type/i });
    fireEvent.click(typeFilter);
    
    // Wait for and select 'Individual' type from the dropdown
    await waitFor(() => {
      const individualOption = screen.getByRole('option', { name: /Individual/i });
      fireEvent.click(individualOption);
    });
    
    // Check if only individual customers are displayed
    const rows = screen.getAllByRole('row');
    rows.slice(1).forEach((row) => { // Skip header row
      expect(within(row).getByText('Individual')).toBeInTheDocument();
    });
  });

  it('handles bulk selection', () => {
    render(<CustomersPage />);
    
    // Get all checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    
    // Select the first customer
    fireEvent.click(checkboxes[1]); // Skip header checkbox
    
    // Check if bulk actions appear
    expect(screen.getByText('1 customer(s) selected')).toBeInTheDocument();
    expect(screen.getByText('Email Selected')).toBeInTheDocument();
    expect(screen.getByText('Delete Selected')).toBeInTheDocument();
  });

  it('handles select all', () => {
    render(<CustomersPage />);
    
    // Get the select all checkbox
    const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
    
    // Select all customers
    fireEvent.click(selectAllCheckbox);
    
    // Check if all customers are selected
    const customerCount = staticData.customers.length;
    expect(screen.getByText(`${customerCount} customer(s) selected`)).toBeInTheDocument();
  });

  it('opens customer details when clicking a row', async () => {
    render(<CustomersPage />);
    
    // Get the first customer row
    const firstCustomer = staticData.customers[0];
    const customerName = screen.getByText(firstCustomer.name);
    fireEvent.click(customerName);
    
    // Wait for and check if customer details dialog is opened with customer name
    await waitFor(() => {
      expect(screen.getByText(firstCustomer.name)).toBeInTheDocument();
      expect(screen.getByText(firstCustomer.email)).toBeInTheDocument();
      expect(screen.getByText(firstCustomer.phone)).toBeInTheDocument();
    });
  });

  it('opens customer dialog when clicking add customer', async () => {
    render(<CustomersPage />);
    
    // Click add customer button
    const addButton = screen.getByText('Add Customer');
    fireEvent.click(addButton);
    
    // Wait for and check if dialog is opened
    await waitFor(() => {
      expect(screen.getByText('Add New Customer')).toBeInTheDocument();
    });
  });

  it('shows toast notification when exporting', () => {
    render(<CustomersPage />);
    
    // Click export button
    const exportButton = screen.getByTitle('Export to CSV');
    fireEvent.click(exportButton);
    
    // Check if toast appears
    expect(screen.getByText('Customer data would be exported to CSV in a full app')).toBeInTheDocument();
  });

  it('shows toast notification when importing', () => {
    render(<CustomersPage />);
    
    // Click import button
    const importButton = screen.getByTitle('Import from CSV');
    fireEvent.click(importButton);
    
    // Check if toast appears
    expect(screen.getByText('CSV import would be available in a full app')).toBeInTheDocument();
  });

  it('handles bulk email action', () => {
    render(<CustomersPage />);
    
    // Select the first customer
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // Skip header checkbox
    
    // Click email selected button
    const emailButton = screen.getByText('Email Selected');
    fireEvent.click(emailButton);
    
    // Check if toast appears
    expect(screen.getByText('Email composer would open for 1 customers in a full app')).toBeInTheDocument();
  });

  it('handles bulk delete action', () => {
    render(<CustomersPage />);
    
    // Select the first customer
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // Skip header checkbox
    
    // Click delete selected button
    const deleteButton = screen.getByText('Delete Selected');
    fireEvent.click(deleteButton);
    
    // Check if toast appears
    expect(screen.getByText('1 customers would be deleted in a full app')).toBeInTheDocument();
  });
});
