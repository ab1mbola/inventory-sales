# Multi-Tenant Inventory & Sales Management

A comprehensive full-stack solution for managing inventory, tracking sales, and monitoring business performance. Built with a modern tech stack focusing on performance, scalability, and ease of use.

## 🚀 Features

- **Multi-Tenant SaaS**: Secure data isolation with support for multiple companies.
- **Dashboard**: Real-time business overview with dynamic charts (ApexCharts).
- **POS (Point of Sale)**: Streamlined interface for making sales, managing carts, and processing payments.
- **Inventory Management**: Full CRUD operations for products and categories.
- **Customer Tracking**: Manage customer relationships and track purchasing history.
- **Debt Management**: Monitor credit sales and manage debtor records.
- **Comprehensive Reports**: Detailed analytics on sales performance and inventory trends.
- **Secure Authentication**: JWT-based authentication with company-scoped access.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite 8
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query) 5
- **Icons**: Lucide React
- **Charts**: ApexCharts

### Backend
- **Framework**: Express 5
- **Language**: TypeScript
- **ORM**: Prisma 7
- **Database**: PostgreSQL (Supabase)
- **Infrastructure**: Supabase (Auth, Storage, Database)
- **Authentication**: JWT + Bcryptjs

---

## 🚦 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [PostgreSQL](https://www.postgresql.org/) database instance

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-repo/mnemos.git
   cd mnemos
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   ```
   - Create a `.env` file in the `backend` directory based on `.env.example`:
     ```env
     PORT=3001
     DB_ENV=dev # Use 'dev' or 'prod'
     DATABASE_URL_DEV="your-supabase-dev-url"
     DATABASE_URL_PROD="your-supabase-prod-url"
     JWT_SECRET="your-secret-key"
     ```
   - Initialize the database:
     ```bash
     npx prisma migrate dev
     npx prisma db seed
     ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   ```
   - Create a `.env` file in the `frontend` directory based on `.env.example`:
     ```env
     VITE_SUPABASE_URL="your-supabase-url"
     VITE_SUPABASE_PUBLISHABLE_KEY="your-supabase-key"
     ```

---

## 🏃 Running the Application

### Start Backend
```bash
cd backend
npm run dev
```

### Start Frontend
```bash
cd frontend
npm run dev
```

The application should now be running!
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`

---

## 📂 Project Structure

```text
├── backend/
│   ├── prisma/          # Database schema and seeds
│   ├── src/
│   │   ├── controllers/ # Request handlers
│   │   ├── middleware/  # Auth and validation middleware
│   │   ├── routes/      # API endpoints
│   │   └── utils/       # Shared helpers
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI elements
│   │   ├── hooks/       # Custom React hooks
│   │   ├── pages/       # View components
│   │   ├── services/    # API communication logic
│   │   ├── store/       # Zustand state management
│   │   └── types/       # TypeScript definitions
```

---

## 🔐 Multi-tenancy & Data Isolation

This system is built with a strict multi-tenant architecture. 

- **Company Scoping**: Every record (Users, Products, Sales, Customers) is associated with a `companyId`.
- **Data Security**: Middleware ensures that users can only access and modify data belonging to their own company.
- **Multi-Company Support**: A single database instance can securely host data for multiple independent businesses.

---

## 📄 License
This project is licensed under the ISC License.
