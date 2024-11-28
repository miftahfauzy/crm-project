# CRM Dashboard

A modern, feature-rich Customer Relationship Management system built with Next.js, TypeScript, and Prisma.

## 🌟 Features

### 1. Customer Management
- **Customer Profiles**
  - Detailed customer information storage
  - Contact history tracking
  - Purchase history and preferences
  - Custom fields support
  - Document attachments
- **Customer Analytics**
  - Purchase patterns analysis
  - Customer lifetime value calculation
  - Engagement metrics
  - Churn prediction
- **Segmentation**
  - Custom tags and categories
  - Dynamic segmentation rules
  - Automated categorization
  - Bulk segment management

### 2. Order Management
- **Order Lifecycle**
  - Order creation and tracking
  - Status updates with notifications
  - Payment integration
  - Shipping status tracking
- **Bulk Operations**
  - Mass order processing
  - Batch status updates
  - Bulk shipping label generation
  - Export/Import functionality
- **Reporting**
  - Sales analytics
  - Revenue reports
  - Order status distribution
  - Custom report builder

### 3. Communication Tools
- **Multi-Channel Support**
  - Email integration
  - SMS notifications
  - In-app messaging
  - Communication history
- **Templates**
  - Custom email templates
  - SMS templates
  - Automated responses
  - Dynamic content insertion
- **Analytics**
  - Open rates tracking
  - Response time metrics
  - Communication effectiveness
  - Channel performance

### 4. Task Management
- **Task Organization**
  - Create and assign tasks
  - Priority levels
  - Due date tracking
  - Task dependencies
- **Team Collaboration**
  - Task sharing
  - Team assignments
  - Progress tracking
  - Comment threads
- **Productivity Tools**
  - Time tracking
  - Performance metrics
  - Workload distribution
  - Deadline monitoring

### 5. Analytics & Reporting
- **Dashboards**
  - Real-time metrics
  - Customizable widgets
  - Data visualization
  - Export capabilities
- **Reports**
  - Sales reports
  - Customer reports
  - Team performance
  - Custom report builder
- **KPI Tracking**
  - Revenue metrics
  - Customer satisfaction
  - Team productivity
  - Goal achievement

## 🚀 Technology Stack

### Frontend
- **Next.js 14**
  - App Router
  - Server Components
  - Client Components
  - API Routes
- **UI Components**
  - Material-UI v5
  - Tailwind CSS
  - Custom UI Components
  - Responsive Design
- **State Management**
  - React Context
  - Custom Hooks
  - Local Storage
  - Session Management

### Backend
- **API Architecture**
  - RESTful endpoints
  - Error handling
  - Rate limiting
  - Request validation
- **Database**
  - Prisma ORM
  - Migrations
  - Data seeding
  - Query optimization
- **Security**
  - JWT Authentication
  - Role-based access
  - Input sanitization
  - CORS configuration

## 📦 Installation Guide

### Prerequisites
1. **Node.js Installation**
   ```bash
   # Check Node.js version
   node --version  # Should be >= 18.13.0
   
   # Check npm version
   npm --version
   ```

2. **Database Setup**
   ```bash
   # Install PostgreSQL (if not using SQLite)
   # Windows: Download from https://www.postgresql.org/download/windows/
   # Create a new database
   createdb crm_database
   ```

### Step-by-Step Setup

1. **Clone and Install**
   ```bash
   # Clone repository
   git clone https://github.com/miftahfauzy/crm-project.git
   cd crm-project

   # Install dependencies
   npm install
   ```

2. **Environment Configuration**
   ```bash
   # Copy environment file
   cp .env.example .env

   # Configure environment variables
   DATABASE_URL="postgresql://user:password@localhost:5432/crm_database"
   JWT_SECRET="your-secret-key"
   NEXT_PUBLIC_API_URL="http://localhost:3000"
   ```

3. **Database Migration**
   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Run migrations
   npm run migrate:dev

   # Seed database (if available)
   npx prisma db seed
   ```

4. **Development Server**
   ```bash
   # Start development server
   npm run dev

   # Build for production
   npm run build

   # Start production server
   npm run start
   ```

## 🔑 API Documentation

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123",
  "role": "user"
}
```

### Customer Endpoints

#### List Customers
```http
GET /api/customers
Authorization: Bearer <token>
Query Parameters:
- page (default: 1)
- limit (default: 10)
- search
- sortBy
- order (asc/desc)
```

#### Create Customer
```http
POST /api/customers
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Customer Name",
  "email": "customer@example.com",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "City",
    "country": "Country"
  }
}
```

### Order Endpoints

#### Create Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerId": "customer_id",
  "items": [
    {
      "productId": "product_id",
      "quantity": 2
    }
  ],
  "status": "pending"
}
```

#### Bulk Update Orders
```http
PATCH /api/bulk/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderIds": ["id1", "id2"],
  "status": "shipped"
}
```

## 🛡️ Security

### Authentication Flow
1. User logs in with credentials
2. Server validates and returns JWT token
3. Client stores token in memory/localStorage
4. Token is included in subsequent requests
5. Server validates token for each protected route

### Role-Based Access Control
```typescript
enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  SALES = 'sales',
  USER = 'user'
}

interface Permission {
  role: UserRole;
  actions: string[];
}
```

## 🔧 Configuration

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/crm_database

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

# Email Service (Optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=password

# Feature Flags
ENABLE_NOTIFICATIONS=true
ENABLE_EMAIL_SERVICE=true
```

## 📊 Database Schema

### Core Tables
```prisma
model Customer {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  phone     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  orders    Order[]
  tags      Tag[]
}

model Order {
  id         String   @id @default(uuid())
  customerId String
  status     String
  total      Float
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  customer   Customer @relation(fields: [customerId], references: [id])
  items      Item[]
}
```

## 🚀 Deployment

### Production Build
```bash
# Build application
npm run build

# Start production server
npm run start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Make changes and commit
   ```bash
   git commit -m "feat: add amazing feature"
   ```
4. Push to branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. Open Pull Request

### Coding Standards
- Follow TypeScript best practices
- Use ESLint and Prettier
- Write unit tests for new features
- Follow conventional commits

## 📈 Performance Optimization

### Frontend
- Implement code splitting
- Use Image optimization
- Enable caching strategies
- Minimize bundle size

### Backend
- Implement query optimization
- Use connection pooling
- Cache frequently accessed data
- Implement rate limiting

## 📱 Mobile Responsiveness

The application is fully responsive and tested on:
- Desktop (1920x1080)
- Laptop (1366x768)
- Tablet (768x1024)
- Mobile (375x667)

## 🔍 Testing

### Unit Tests
```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage
```

### E2E Tests
```bash
# Run E2E tests
npm run test:e2e
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contact & Support

- **Developer**: Miftah Fauzy
- **GitHub**: [miftahfauzy](https://github.com/miftahfauzy)
- **Issues**: [GitHub Issues](https://github.com/miftahfauzy/crm-project/issues)
- **Documentation**: [Wiki](https://github.com/miftahfauzy/crm-project/wiki)

For support:
1. Check existing issues
2. Create a new issue
3. Join our community discussions
