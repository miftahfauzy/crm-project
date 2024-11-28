# CRM Dashboard

A modern, feature-rich Customer Relationship Management system built with Next.js, TypeScript, and Prisma.

## 🌟 Features

### 1. Customer Management
- Customer profiles with detailed information
- Customer analytics and insights
- Communication history tracking
- Custom tags and categorization

### 2. Order Management
- Complete order lifecycle tracking
- Order history and status updates
- Bulk order operations
- Advanced order querying and reporting

### 3. Communication Tools
- Communication analytics
- Message history tracking
- Automated communication logs
- Multi-channel support

### 4. Task Management
- Task creation and assignment
- Productivity dashboard
- Task progress tracking
- Team performance analytics

### 5. Bulk Operations
- Bulk tag management
- Mass order processing
- Batch customer updates
- Report generation

### 6. Analytics & Reporting
- Real-time dashboard
- Customer analytics
- Sales metrics
- Productivity insights
- Custom report generation

## 🚀 Technology Stack

- **Frontend**: Next.js, TypeScript, Material-UI, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Prisma ORM
- **Authentication**: JWT-based auth system
- **State Management**: React Hooks
- **Charts & Visualization**: Recharts
- **Form Handling**: React Hook Form, Zod
- **Styling**: Tailwind CSS, CSS Modules
- **Notifications**: Notistack

## 📦 Prerequisites

- Node.js >= 18.13.0
- npm or yarn
- Git

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/miftahfauzy/crm-project.git
cd crm-project
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Set up the database:
```bash
npm run migrate:dev
# or
yarn migrate:dev
```

5. Start the development server:
```bash
npm run dev
# or
yarn dev
```

## 🗄️ Project Structure

```
project/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── customers/         # Customer management pages
├── components/            # React components
│   ├── ui/               # UI components
│   ├── dashboard/        # Dashboard components
│   └── tasks/            # Task management components
├── lib/                   # Utility functions and services
│   ├── services/         # Business logic services
│   └── middleware/       # API middleware
├── prisma/               # Database schema and migrations
└── public/               # Static assets
```

## 🔑 API Endpoints

### Customer API
- `GET /api/customers` - List all customers
- `POST /api/customers` - Create new customer
- `GET /api/customers/analytics` - Get customer analytics

### Order API
- `GET /api/orders` - List all orders
- `POST /api/orders` - Create new order
- `GET /api/orders/[id]` - Get order details

### Communication API
- `GET /api/communications` - List communications
- `POST /api/communications` - Create communication
- `GET /api/communications/analytics` - Get communication analytics

### Task API
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/productivity` - Get productivity metrics

## 🔐 Authentication

The system uses JWT-based authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## 🛡️ Environment Variables

Required environment variables:
```
DATABASE_URL=          # Prisma database connection URL
JWT_SECRET=           # Secret key for JWT tokens
NEXT_PUBLIC_API_URL=  # Frontend API URL
```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run migrate:dev` - Run database migrations
- `npm run migrate:deploy` - Deploy database migrations

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contact

Miftah Fauzy - [GitHub](https://github.com/miftahfauzy)
