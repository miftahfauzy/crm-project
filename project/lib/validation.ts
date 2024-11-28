import { z } from 'zod';

export const baseEntitySchema = z.object({
  id: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export const customerSchema = baseEntitySchema.merge(z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
    .optional(),
  company: z.string().max(100, 'Company name too long').optional(),
  status: z.enum(['active', 'inactive', 'prospect']).default('active'),
  type: z.enum(['regular', 'vip', 'lead']).default('regular'),
  notes: z.string().max(500, 'Notes too long').optional(),
  userId: z.string().optional()
}));

export const productSchema = z.object({
  name: z.string().min(2, { message: "Product name must be at least 2 characters" }),
  description: z.string().optional(),
  price: z.number().positive({ message: "Price must be a positive number" }),
  status: z.enum(['active', 'inactive']).default('active'),
  tags: z.array(z.string()).optional()
}).strict();

export const orderSchema = z.object({
  customerId: z.string().uuid({ message: "Invalid customer ID" }),
  userId: z.string().uuid({ message: "Invalid user ID" }),
  total: z.number().positive({ message: "Total must be a positive number" }),
  status: z.enum(['pending', 'processing', 'completed', 'cancelled']).default('pending'),
  items: z.array(z.object({
    productId: z.string().uuid({ message: "Invalid product ID" }),
    quantity: z.number().int().positive({ message: "Quantity must be a positive integer" }),
    price: z.number().positive({ message: "Item price must be a positive number" })
  })).min(1, { message: "Order must have at least one item" })
}).strict();

export const communicationSchema = baseEntitySchema.merge(z.object({
  customerId: z.string().min(1, 'Customer is required'),
  type: z.enum(['email', 'phone', 'meeting', 'chat', 'sms']),
  content: z.string().min(1, 'Communication content is required'),
  direction: z.enum(['inbound', 'outbound']),
  status: z.enum(['pending', 'completed', 'failed']).default('pending')
}));

export const tagSchema = z.object({
  name: z.string().min(2, { message: "Tag name must be at least 2 characters" }),
  color: z.string().optional(),
  description: z.string().max(500, { message: "Description must be less than 500 characters" }).optional(),
  type: z.enum(['product', 'customer', 'communication', 'order']).optional()
}).strict();

export const userSchema = baseEntitySchema.merge(z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(64, 'Password must be less than 64 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
      'Password must include uppercase, lowercase, number, and special character'),
  name: z.string().optional(),
  role: z.enum(['user', 'admin', 'manager']).default('user'),
  status: z.enum(['active', 'inactive', 'suspended']).default('active')
}));

export const validateData = <T>(schema: z.ZodType<T>, data: unknown): T => {
  return schema.parse(data);
};

export const createPartialSchema = <T extends z.ZodTypeAny>(schema: T) => {
  return schema.partial();
};
