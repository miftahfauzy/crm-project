export const staticData = {
  communications: [
    {
      id: 1,
      type: 'email',
      subject: 'Follow-up Meeting',
      content: 'Thank you for your time yesterday. I wanted to follow up on our discussion...',
      customerId: 1,
      userId: 1,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 2,
      type: 'call',
      subject: 'Product Demo',
      content: 'Scheduled a product demonstration for next week...',
      customerId: 2,
      userId: 1,
      createdAt: '2024-01-16T14:30:00Z',
      updatedAt: '2024-01-16T14:30:00Z'
    }
  ],
  customers: [
    {
      id: 1,
      name: 'Acme Corp',
      email: 'contact@acme.com',
      phone: '555-0100',
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'TechStart Inc',
      email: 'info@techstart.com',
      phone: '555-0200',
      status: 'active',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z'
    }
  ],
  orders: [
    {
      id: 1,
      customerId: 1,
      status: 'completed',
      total: 1500.00,
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-10T00:00:00Z'
    },
    {
      id: 2,
      customerId: 2,
      status: 'pending',
      total: 2500.00,
      createdAt: '2024-01-11T00:00:00Z',
      updatedAt: '2024-01-11T00:00:00Z'
    }
  ],
  tags: [
    {
      id: 1,
      name: 'VIP',
      color: '#FFD700',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'New Client',
      color: '#90EE90',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ],
  users: [
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ]
};
