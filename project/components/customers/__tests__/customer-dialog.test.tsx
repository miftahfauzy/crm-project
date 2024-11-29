import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CustomerDialog } from '../customer-dialog';
import axios from 'axios';
import userEvent from '@testing-library/user-event';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Helper function to render dialog
const renderCustomerDialog = (props = {}) => {
  return render(
    <CustomerDialog 
      open={true} 
      onOpenChange={() => {}} 
      {...props} 
    />
  );
};

describe('CustomerDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with proper accessibility attributes', async () => {
    renderCustomerDialog();
    
    const formDescription = screen.getByTestId('customer-form-description');
    expect(formDescription).toBeInTheDocument();
    expect(formDescription).toHaveTextContent('Form to add or edit customer information');
  });

  it('should be accessible via keyboard navigation', async () => {
    const user = userEvent.setup();
    renderCustomerDialog();

    // Wait for dialog to be visible
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Initial focus should be on the first input
    const nameInput = screen.getByPlaceholderText('John Doe');
    const emailInput = screen.getByPlaceholderText('john@example.com');
    const phoneInput = screen.getByPlaceholderText(/\+1 234 567 890/i);

    // Focus name input first
    await user.tab();
    expect(document.activeElement).toBe(nameInput);

    // Tab to email input
    await user.tab();
    expect(document.activeElement).toBe(emailInput);

    // Tab to phone input
    await user.tab();
    expect(document.activeElement).toBe(phoneInput);
  });

  it('should validate required fields', async () => {
    renderCustomerDialog();
    
    const user = userEvent.setup();
    const submitButton = screen.getByRole('button', { name: /create customer/i });
    
    // Submit empty form
    await user.click(submitButton);
    
    // Check for validation messages
    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('should validate email format', async () => {
    renderCustomerDialog();
    
    const user = userEvent.setup();
    const emailInput = screen.getByPlaceholderText('john@example.com');
    const submitButton = screen.getByRole('button', { name: /create customer/i });

    // Type invalid email and submit
    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    // Check for validation message
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const onOpenChange = jest.fn();
    renderCustomerDialog({ onOpenChange });
    
    const user = userEvent.setup();
    const nameInput = screen.getByPlaceholderText('John Doe');
    const emailInput = screen.getByPlaceholderText('john@example.com');
    const submitButton = screen.getByRole('button', { name: /create customer/i });
    
    // Fill out form
    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'test@example.com');
    
    // Mock successful submission
    mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });
    
    // Submit form
    await user.click(submitButton);
    
    // Wait for API call
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/customers',
        expect.objectContaining({
          name: 'Test User',
          email: 'test@example.com'
        })
      );
    });
    
    // Wait for dialog to close
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('should show loading state during submission', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    renderCustomerDialog({ onSubmit });

    const nameInput = screen.getByPlaceholderText('John Doe');
    const emailInput = screen.getByPlaceholderText('john@example.com');
    const submitButton = screen.getByRole('button', { name: /create customer/i });

    // Fill out form
    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    // Check for loading state
    await waitFor(() => {
      expect(screen.getByText(/creating.../i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    // Wait for submission to complete
    await waitFor(() => {
      expect(screen.queryByText(/creating.../i)).not.toBeInTheDocument();
    });
  });

  it('should handle API errors', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error('Failed to create customer'));
    renderCustomerDialog({ onSubmit });

    const nameInput = screen.getByPlaceholderText('John Doe');
    const emailInput = screen.getByPlaceholderText('john@example.com');
    const submitButton = screen.getByRole('button', { name: /create customer/i });

    // Fill out form
    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/failed to create customer/i)).toBeInTheDocument();
    });

    // Submit button should be enabled again
    expect(submitButton).not.toBeDisabled();
  });

  it('should reset form when dialog is closed', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderCustomerDialog({ onOpenChange });

    const nameInput = screen.getByPlaceholderText('John Doe');
    const emailInput = screen.getByPlaceholderText('john@example.com');
    const cancelButton = screen.getByRole('button', { name: /cancel/i });

    // Fill out form
    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'test@example.com');

    // Close dialog
    await user.click(cancelButton);

    // Verify onOpenChange was called
    expect(onOpenChange).toHaveBeenCalledWith(false);

    // Re-open dialog
    renderCustomerDialog({ open: true });

    // Verify form is reset
    await waitFor(() => {
      expect(screen.getByPlaceholderText('John Doe')).toHaveValue('');
      expect(screen.getByPlaceholderText('john@example.com')).toHaveValue('');
    });
  });

  it('should handle keyboard navigation correctly', async () => {
    const user = userEvent.setup();
    renderCustomerDialog();

    // Open dialog with keyboard
    const trigger = screen.getByRole('button', { name: /create customer/i });
    await user.keyboard('{Tab}');
    await user.keyboard('{Enter}');

    // Navigate through form fields
    await user.keyboard('{Tab}'); // Focus name input
    expect(screen.getByPlaceholderText('John Doe')).toHaveFocus();
    
    await user.keyboard('{Tab}'); // Focus email input
    expect(screen.getByPlaceholderText('john@example.com')).toHaveFocus();
    
    await user.keyboard('{Tab}'); // Focus submit button
    expect(screen.getByRole('button', { name: /create customer/i })).toHaveFocus();
    
    await user.keyboard('{Tab}'); // Focus cancel button
    expect(screen.getByRole('button', { name: /cancel/i })).toHaveFocus();
    
    // Test closing with Escape
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should validate all fields before submission', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderCustomerDialog({ onSubmit });

    // Try submitting empty form
    const submitButton = screen.getByRole('button', { name: /create customer/i });
    await user.click(submitButton);

    // Check validation messages
    expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();

    // Fill name only
    await user.type(screen.getByPlaceholderText('John Doe'), 'Test User');
    await user.click(submitButton);
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();

    // Fill invalid email
    await user.type(screen.getByPlaceholderText('john@example.com'), 'invalid-email');
    await user.click(submitButton);
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should trim input values before submission', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderCustomerDialog({ onSubmit });

    // Fill form with whitespace
    await user.type(screen.getByPlaceholderText('John Doe'), '  Test User  ');
    await user.type(screen.getByPlaceholderText('john@example.com'), '  test@example.com  ');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /create customer/i }));

    // Verify trimmed values
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Test User',
      email: 'test@example.com'
    });
  });

  it('should have proper ARIA attributes', () => {
    renderCustomerDialog();
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');
    
    // Verify form inputs have proper aria-labels
    const nameInput = screen.getByPlaceholderText('John Doe');
    const emailInput = screen.getByPlaceholderText('john@example.com');
    
    expect(nameInput).toHaveAttribute('aria-invalid', 'false');
    expect(emailInput).toHaveAttribute('aria-invalid', 'false');
    
    // Verify error messages are associated with inputs
    const submitButton = screen.getByRole('button', { name: /create customer/i });
    fireEvent.click(submitButton);
    
    expect(nameInput).toHaveAttribute('aria-invalid', 'true');
    expect(nameInput).toHaveAttribute('aria-errormessage');
    expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    expect(emailInput).toHaveAttribute('aria-errormessage');
  });

  it('should maintain focus trap in dialog', async () => {
    const user = userEvent.setup();
    renderCustomerDialog();

    // Focus last element and verify focus trap
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    cancelButton.focus();
    
    // Tab forward should cycle back to first focusable element
    await user.keyboard('{Tab}');
    expect(screen.getByPlaceholderText('John Doe')).toHaveFocus();
    
    // Shift+Tab backward should cycle to last focusable element
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(cancelButton).toHaveFocus();
  });

  it('should handle rapid form submissions correctly', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn()
      .mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)))
      .mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    renderCustomerDialog({ onSubmit });

    // Fill form
    await user.type(screen.getByPlaceholderText('John Doe'), 'Test User');
    await user.type(screen.getByPlaceholderText('john@example.com'), 'test@example.com');
    
    // Submit multiple times rapidly
    const submitButton = screen.getByRole('button', { name: /create customer/i });
    await user.click(submitButton);
    await user.click(submitButton);
    await user.click(submitButton);

    // Should only submit once while loading
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(submitButton).toBeDisabled();
    });
  });

  it('should handle network timeout gracefully', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockImplementationOnce(() => 
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), 100)
      )
    );
    
    renderCustomerDialog({ onSubmit });

    // Fill and submit form
    await user.type(screen.getByPlaceholderText('John Doe'), 'Test User');
    await user.type(screen.getByPlaceholderText('john@example.com'), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /create customer/i }));

    // Verify timeout error handling
    await waitFor(() => {
      expect(screen.getByText(/network timeout/i)).toBeInTheDocument();
    });
  });

  it('should preserve form state when dialog is reopened after error', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValueOnce(new Error('Submission failed'));
    const { rerender } = renderCustomerDialog({ onSubmit, open: true });

    // Fill form
    await user.type(screen.getByPlaceholderText('John Doe'), 'Test User');
    await user.type(screen.getByPlaceholderText('john@example.com'), 'test@example.com');
    
    // Submit and trigger error
    await user.click(screen.getByRole('button', { name: /create customer/i }));
    
    // Close and reopen dialog
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    rerender(<CustomerDialog open={true} onSubmit={onSubmit} />);

    // Form should be reset after error and reopen
    await waitFor(() => {
      expect(screen.getByPlaceholderText('John Doe')).toHaveValue('');
      expect(screen.getByPlaceholderText('john@example.com')).toHaveValue('');
      expect(screen.queryByText(/submission failed/i)).not.toBeInTheDocument();
    });
  });
});
