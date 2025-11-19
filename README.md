# 오늘의신상 - Frontend

Korean e-commerce product discovery platform for convenience stores and food brands.

## 🏗️ Architecture

This is the **frontend repository** built with Next.js 16. It communicates with a separate SpringBoot backend via REST API.

```
┌─────────────────────┐         ┌──────────────────────┐
│   Next.js Frontend  │ ◄─────► │  SpringBoot Backend  │
│   (This Repo)       │  REST   │  + JPA + PostgreSQL  │
│   Port: 3000        │   API   │  Port: 8080          │
└─────────────────────┘         └──────────────────────┘
```

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4.1
- **UI Components**: shadcn/ui (Radix UI)
- **State Management**: React Query (TanStack Query)
- **HTTP Client**: Fetch API with custom wrapper
- **Package Manager**: pnpm

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- SpringBoot backend running on `http://localhost:8080`

### Installation

```bash
# Install dependencies
npx pnpm install

# Copy environment variables
cp .env.local.example .env.local

# Edit .env.local and set your backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### Development

```bash
# Run development server
npx pnpm dev

# Open http://localhost:3000
```

### Build

```bash
# Create production build
npx pnpm build

# Start production server
npx pnpm start
```

### Lint

```bash
npx pnpm lint
```

## 📁 Project Structure

```
newProduct/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx           # Root layout with React Query
│   ├── page.tsx             # Homepage (product grid)
│   ├── submit/              # Product submission page
│   ├── admin/               # Admin dashboard
│   └── product/[id]/        # Product detail page
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── header.tsx           # Navigation header
│   ├── product-card.tsx     # Product card component
│   └── filter-sidebar.tsx   # Filter UI
├── lib/
│   ├── api/
│   │   ├── client.ts        # API client (fetch wrapper)
│   │   └── hooks.ts         # React Query hooks
│   ├── types/
│   │   └── api.ts           # TypeScript types
│   ├── providers/
│   │   └── query-provider.tsx  # React Query Provider
│   └── utils.ts             # Utility functions
├── styles/
│   └── globals.css          # Global styles + design system
├── public/                   # Static assets
└── hooks/                    # Custom React hooks
```

## 🎨 Design System

Premium, sophisticated design with:

- **Colors**: Deep Charcoal (#1A1A1A), Warm Gray (#6B6B6B), Muted Gold (#B8956A)
- **Typography**: Pretendard (Korean), Inter (English)
- **Border Radius**: 4-8px (sharp, modern)
- **Spacing**: 8px base unit
- **Transitions**: 200ms ease

See `styles/globals.css` for full design tokens.

## 🔌 API Integration

### Using API Client

```typescript
import { apiClient } from '@/lib/api/client'

// Login
const response = await apiClient.login({ email, password })

// Get products
const products = await apiClient.getProducts({ stores: ['CU'] })
```

### Using React Query Hooks (Recommended)

```typescript
import { useProducts, useLogin } from '@/lib/api/hooks'

function ProductList() {
  const { data, isLoading, error } = useProducts({ stores: ['CU'] })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return <div>{/* Render products */}</div>
}
```

### Available Hooks

**Authentication**:
- `useCurrentUser()` - Get current user
- `useLogin()` - Login mutation
- `useRegister()` - Register mutation
- `useLogout()` - Logout mutation

**Products**:
- `useProducts(filters)` - List products
- `useProduct(id)` - Get product detail
- `useSubmitProduct()` - Submit new product
- `useUpdateProduct()` - Update product
- `useDeleteProduct()` - Delete product

**Admin**:
- `usePendingSubmissions()` - Get pending submissions
- `useApproveSubmission()` - Approve product
- `useRejectSubmission()` - Reject product
- `usePromoteToAdmin()` - Promote user to admin
- `useAdminStats()` - Get statistics

## 🔐 Authentication

JWT tokens are stored in `localStorage` and automatically sent with API requests.

```typescript
import { apiClient } from '@/lib/api/client'

// Login sets the token automatically
await apiClient.login({ email, password })

// Token is included in all subsequent requests
const user = await apiClient.getCurrentUser()

// Logout clears the token
await apiClient.logout()
```

## 🌐 Environment Variables

Required environment variables:

```env
# Backend API URL (required)
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# App URL (optional)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📝 TypeScript Types

All API types are defined in `lib/types/api.ts`:

```typescript
import type { Product, User, ProductFilters } from '@/lib/types/api'
```

## 🎯 Key Features

- ✅ Product browsing with advanced filtering
- ✅ Multi-filter sidebar (stores, price, categories, dates)
- ✅ Product submission with image upload
- ✅ Admin dashboard for approval
- ✅ User management (promote to admin)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark mode support
- ✅ Premium UI design system

## 🔄 Backend Requirements

This frontend expects the SpringBoot backend to provide:

1. **Authentication** endpoints (`/api/auth/*`)
2. **Product** CRUD endpoints (`/api/products/*`)
3. **Admin** management endpoints (`/api/admin/*`)
4. **File upload** endpoint (`/api/upload`)
5. **CORS** enabled for `http://localhost:3000`
6. **JWT** authentication with Bearer tokens

See `lib/api/client.ts` for complete API contract.

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [React Query](https://tanstack.com/query/latest)

## 🤝 Contributing

This is the frontend repository. For backend changes, see the SpringBoot repository.

## 📄 License

Private project.
