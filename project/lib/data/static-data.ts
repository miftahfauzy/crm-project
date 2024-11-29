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
      phone: '+1 (555) 0100',
      status: 'active',
      type: 'business',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'TechStart Inc',
      email: 'info@techstart.com',
      phone: '+1 (555) 0200',
      status: 'active',
      type: 'business',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z'
    },
    {
      id: 3,
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 (555) 0300',
      status: 'active',
      type: 'individual',
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z'
    },
    {
      id: 4,
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1 (555) 0400',
      status: 'pending',
      type: 'individual',
      createdAt: '2024-01-04T00:00:00Z',
      updatedAt: '2024-01-04T00:00:00Z'
    },
    {
      id: 5,
      name: 'Global Solutions Ltd',
      email: 'contact@globalsolutions.com',
      phone: '+44 20 7123 4567',
      status: 'inactive',
      type: 'business',
      createdAt: '2024-01-05T00:00:00Z',
      updatedAt: '2024-01-05T00:00:00Z'
    },
    {
      id: 6,
      name: 'Emma Davis',
      email: 'emma.davis@email.com',
      phone: '+1 (555) 0600',
      status: 'active',
      type: 'individual',
      createdAt: '2024-01-06T00:00:00Z',
      updatedAt: '2024-01-06T00:00:00Z'
    },
    {
      id: 7,
      name: 'Quantum Dynamics',
      email: 'info@quantumdyn.com',
      phone: '+1 (555) 0700',
      status: 'active',
      type: 'business',
      createdAt: '2024-01-07T00:00:00Z',
      updatedAt: '2024-01-07T00:00:00Z'
    },
    {
      id: 8,
      name: 'Michael Chang',
      email: 'm.chang@email.com',
      phone: '+1 (555) 0800',
      status: 'inactive',
      type: 'individual',
      createdAt: '2024-01-08T00:00:00Z',
      updatedAt: '2024-01-08T00:00:00Z'
    },
    {
      id: 9,
      name: 'Green Earth Co',
      email: 'contact@greenearth.com',
      phone: '+1 (555) 0900',
      status: 'pending',
      type: 'business',
      createdAt: '2024-01-09T00:00:00Z',
      updatedAt: '2024-01-09T00:00:00Z'
    },
    {
      id: 10,
      name: 'Sofia Rodriguez',
      email: 'sofia.r@email.com',
      phone: '+34 91 123 4567',
      status: 'active',
      type: 'individual',
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-10T00:00:00Z'
    },
    {
      id: 11,
      name: 'Tokyo Tech Solutions',
      email: 'contact@tokyotech.co.jp',
      phone: '+81 3 1234 5678',
      status: 'active',
      type: 'business',
      createdAt: '2024-01-11T00:00:00Z',
      updatedAt: '2024-01-11T00:00:00Z'
    },
    {
      id: 12,
      name: 'Hans Mueller',
      email: 'hans.mueller@email.de',
      phone: '+49 30 1234 5678',
      status: 'pending',
      type: 'individual',
      createdAt: '2024-01-12T00:00:00Z',
      updatedAt: '2024-01-12T00:00:00Z'
    },
    {
      id: 13,
      name: 'Eco Solutions Australia',
      email: 'info@ecosolutions.com.au',
      phone: '+61 2 1234 5678',
      status: 'active',
      type: 'business',
      createdAt: '2024-01-13T00:00:00Z',
      updatedAt: '2024-01-13T00:00:00Z'
    },
    {
      id: 14,
      name: 'Marie Dubois',
      email: 'marie.dubois@email.fr',
      phone: '+33 1 23 45 67 89',
      status: 'active',
      type: 'individual',
      createdAt: '2024-01-14T00:00:00Z',
      updatedAt: '2024-01-14T00:00:00Z'
    },
    {
      id: 15,
      name: 'Nordic Innovations AS',
      email: 'contact@nordic-innovations.no',
      phone: '+47 21 234 567',
      status: 'active',
      type: 'business',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
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
