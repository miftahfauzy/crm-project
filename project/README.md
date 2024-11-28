# Modern CRM Dashboard

## Overview
A comprehensive Customer Relationship Management (CRM) application built with Next.js 14, Prisma, and TypeScript, featuring advanced bulk operations and reporting capabilities.

## 🚀 Features

### Bulk Operations
- **Tag Management**
  - Create multiple tags simultaneously
  - Search entities by tag
  - Dynamic tag input

- **Order Management**
  - Advanced querying with complex filters
  - Bulk status updates
  - Pagination support
  - Comprehensive reporting

## 🛠 Tech Stack
- **Frontend**: 
  - Next.js 14
  - React
  - Material-UI (MUI)
  - Notistack
- **Backend**:
  - Prisma ORM
  - SQLite
  - Winston Logging
- **Authentication**:
  - JWT-based
  - Role-based access control

## 📦 Prerequisites
- Node.js (>=18.13.0)
- npm or yarn

## 🔧 Setup & Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/modern-crm.git
cd modern-crm
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
- Copy `.env.example` to `.env`
- Fill in necessary credentials

4. Generate Prisma Client
```bash
npx prisma generate
```

5. Run database migrations
```bash
npm run migrate:dev
```

## 🚀 Running the Application

- Development Mode
```bash
npm run dev
```

- Production Build
```bash
npm run build
npm start
```

## 📋 Available Scripts
- `dev`: Start development server
- `build`: Create production build
- `start`: Start production server
- `lint`: Run ESLint
- `format`: Format code with Prettier
- `migrate:dev`: Run database migrations
- `migrate:deploy`: Deploy database migrations

## 🔒 Authentication
- Default roles: admin, manager, sales, user
- Secure JWT-based authentication
- Role-based access control for endpoints

## 📊 Bulk Operations Endpoints

### Tags
- `POST /api/bulk/tags`: Create multiple tags
- `GET /api/bulk/tags`: Search entities by tag

### Orders
- `PATCH /api/bulk/orders`: Update multiple order statuses
- `POST /api/bulk/orders`: Advanced order querying
- `GET /api/bulk/orders`: Generate order reports

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📜 License
MIT License

## 🛟 Support
For issues or questions, please open a GitHub issue.
