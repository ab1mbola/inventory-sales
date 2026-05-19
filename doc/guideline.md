# Mnemos — Development Practices & Engineering Guidelines

Welcome to the engineering guidelines for **Mnemos**, a multi-tenant inventory and sales management platform built with high performance, secure isolation, and a premium "Craft" design system.

This document serves as the absolute source of truth for code standards, database protocols, architectural isolation, and user interface engineering. All developers and AI coding agents must adhere strictly to these patterns.

---

## 🔐 1. Multi-Tenancy & Data Isolation

Mnemos enforces a strict logical multi-tenant isolation model where all records are securely partitioned by a `companyId`.

### The Core Rule: NEVER Access Unscoped DB
- **Always use `req.db` in controllers.** `req.db` is an auto-scoped Prisma client attached via the `authenticate` middleware. It automatically scopes all reads, updates, deletes, and injections during creates to the tenant (`companyId`) of the authenticated user.
- **NEVER import or use the global `internal_unscoped_prisma`** client directly inside application routers, controllers, or services.
- Direct access to `internal_unscoped_prisma` is monitored and blocked in development. Attempting to access it will trigger a security exception unless `ALLOW_UNSAFE_GLOBAL_PRISMA` is explicitly set (e.g., inside seeds or database synchronization scripts).

```typescript
// ❌ CRITICAL SECURITY VIOLATION: Unscoped query
import { internal_unscoped_prisma } from '../db/client';

export const getProducts = async (req: Request, res: Response) => {
  const products = await internal_unscoped_prisma.product.findMany(); // Isolation breach!
  res.json(products);
};

// ✅ SECURE AND SCAMPED: Automatically isolated by tenant context
export const getProducts = async (req: Request, res: Response) => {
  const products = await req.db.product.findMany(); // Safe, scoped to req.user.companyId
  res.json(products);
};
```

---

## 🗄️ 2. Database & ORM (Prisma + PostgreSQL)

We use Prisma 7 as our Object-Relational Mapper (ORM) and PostgreSQL as our transactional database.

### Decimal and Financial Calculations
- Financial properties (e.g., `price`, `cost`, `totalAmount`, `amountReceived`, `creditLimit`) **MUST** be defined in the Prisma schema as `@db.Decimal(10, 2)` to avoid floating-point precision errors.
- Always convert raw decimals from the database to JavaScript `Number` or perform math operations using precise libraries (or Decimal calculations) when returning JSON or rendering client-side.

```typescript
// ✅ Good: Convert decimal properly for display
₦{Number(sale.totalAmount).toLocaleString()}
```

### Prisma Schema Rules
1. **Scoping**: All tenant-specific models (e.g., `Product`, `Customer`, `Sale`, `Expense`) must possess a `companyId String` field and link back to the `Company` model.
2. **Indexing**: Always index fields that are queried frequently or used as foreign keys:
   - `companyId` for multi-tenant isolation joins.
   - Unique lookups (e.g., `sku` on products, `phone` on customers).
   - Date indices for high-performance timeline queries.
3. **Migrations**: Ensure you run `npx prisma migrate dev` in dev mode for schema updates, followed by `npx prisma db seed` to maintain consistent testing states.

---

## 🛠️ 3. Backend Architecture (Express 5 + TypeScript)

The backend follows a simple, robust layer architecture:
```text
backend/src/
├── controllers/  # Request handlers (logic & validation)
├── middleware/   # Authorization, authentication, & route security
├── db/           # Database adapter-pg connection and tenant-scoping factory
├── routes/       # API endpoints definitions
└── utils/        # Generic helpers
```

### Controller Design System
- Return appropriate HTTP status codes:
  - `200 OK` / `201 Created` for successful mutations.
  - `400 Bad Request` for invalid payloads.
  - `401 Unauthorized` for missing or invalid authentication.
  - `403 Forbidden` for tenant context mismatch or insufficient role.
  - `404 Not Found` for missing resources.
  - `500 Internal Server Error` for unhandled runtime exceptions.
- Always wrap controller logic in clear handler functions or use async error catchers. Unhandled errors should route directly to the Global Error Handler defined in `backend/src/index.ts`.

---

## 🎨 4. Frontend Architecture & The "Mnemos Craft" UI

The frontend uses React 19, Vite 8, Tailwind CSS 4, Zustand, and TanStack Query 5. 

We maintain a premium, editorial, high-contrast, black-and-white minimalist design system known as **Mnemos Craft**.

### Aesthetic Guidelines
1. **Typography**: 
   - Headers use an elegant serif font structure with italic styling: `font-serif font-bold italic uppercase tracking-tighter`.
   - Small labels and metadata use wide tracking uppercase monospace/sans font styling: `text-[10px] uppercase tracking-[0.4em] font-bold`.
2. **Color Palette**:
   - Primary background is pure `#FFFFFF` or high-fidelity surfaces.
   - Text is pure `#000000` (primary) or muted `#000000` with varying opacities (`opacity-60`, `opacity-40` for secondary descriptions).
   - Accents are minimal and used exclusively to highlight specific high-value states (e.g., Credit sales, urgent trends).
3. **Animations (Framer Motion)**:
   - Always wrap page routes in `<AnimatedPage>` for clean transitions.
   - Table rows and card grids must render using container stagger transitions (`staggerChildren: 0.05`) with cubic-bezier easing (`ease: [0.23, 1, 0.32, 1]`) for a buttery-smooth entry.
   - Modals and transient popups must be wrapped in `<AnimatePresence>` to animate out cleanly upon dismount.

### State Management & Data Fetching
- **Server State**: Always manage server fetching, caching, and mutations using **TanStack Query (React Query)** hooks. Avoid using React `useEffect` for raw fetching operations.
- **Client State**: Keep local client state (e.g., active shopping cart, sidebar collapse, user settings) inside **Zustand** stores scoped in `frontend/src/store/`.

```typescript
// ✅ Good: Scoping server state properly
export function useSales() {
  return useQuery<Sale[]>({
    queryKey: ['sales'],
    queryFn: () => api.get('/sales').then((res) => res.data),
  });
}
```

---

## 🌳 5. Git Branching Strategy & PR Workflow

We follow a structured branching model to guarantee build stability and seamless CI/CD operation.

### Branch Topology
- **`main`**: Production release branch. Must always be fully stable.
- **`dev`**: The integration branch. All features merge here first to run automated checks and regression testing.
- **`feat/*` or `fix/*`**: Personal developer and agent feature branches created off `dev`.

### Pre-Commit Checklist
Before pushing any code or opening a Pull Request, verify:
1. **Types**: Ensure TypeScript compiles cleanly on both folders (`npm run build` or `tsc --noEmit`).
2. **Lints**: Clean up unused imports, dead logs, and linting exceptions.
3. **No Unscoped Leakage**: Double-check that all new backend operations use `req.db` instead of raw imports.
4. **Standardized Commit Messages**:
   - `feat: ...` for new functionalities.
   - `fix: ...` for regression or bug fixes.
   - `style: ...` for visual enhancements or Tailwind utility updates.
   - `refactor: ...` for restructuring without logical mutations.

---

> **Design Tip**: Never build boring UI components. The user interface of Mnemos should feel editorial, highly responsive, tactile, and professional. Use transitions, clean spacing, and bespoke layout architecture to keep the design premium.
