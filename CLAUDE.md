# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Korean e-commerce product discovery platform ("오늘의신상" - Today's New Products) - **Frontend Only**

This is the Next.js 16 frontend application that connects to a separate SpringBoot + JPA backend.

**Key Technologies**: Next.js 16, React 19, TypeScript, Tailwind CSS v4.1, shadcn/ui, React Query, pnpm

**Architecture**:
- Frontend: Next.js 16 (this repository)
- Backend: SpringBoot + JPA + PostgreSQL (separate repository)
- Communication: REST API with JWT authentication

## Development Commands

```bash
# Development server (default: http://localhost:3000)
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

## Architecture Overview

### App Router Structure

- **Next.js 16 App Router** (not Pages Router)
- Routes defined in `/app` directory with `page.tsx` files
- Server Components by default; use `'use client'` directive for interactivity
- Dynamic routes: `/app/product/[id]/page.tsx`

### Key Pages

- `/` - Homepage with product grid, multi-filter sidebar, sorting
- `/submit` - Product submission form with image upload (max 3 images, 5MB each)
- `/admin` - Admin dashboard for product approval and user management (protected)
- `/product/[id]` - Dynamic product detail pages

### Component Organization

**UI Components** (`/components/ui/`)
- 56 shadcn/ui components based on Radix UI
- Configured with "New York" style preset
- Use `npx shadcn@latest add <component>` to add new components

**Feature Components** (`/components/`)
- `header.tsx` - Navigation with responsive Sheet menu
- `product-card.tsx` - Product display with store-specific badge colors (OKLch)
- `filter-sidebar.tsx` - Multi-filter UI (stores, price, categories, dates)
- `theme-provider.tsx` - Dark mode support wrapper

### Import Aliases

Configured in `tsconfig.json` and `components.json`:

```typescript
@/components  → /components
@/lib         → /lib
@/hooks       → /hooks
@/styles      → /styles
@/app         → /app
```

## Styling System

### Tailwind CSS v4.1

- PostCSS-based configuration (`postcss.config.mjs`)
- CSS variables in `styles/globals.css` for theming
- **OKLch color space** for all colors (perceptual uniformity)
- 40+ CSS variables: `--primary`, `--secondary`, `--muted`, `--destructive`, etc.
- Dark mode: `.dark` class selector (managed by next-themes)

### Adding New Colors

Define in both light (`:root`) and dark (`.dark`) modes:

```css
:root {
  --custom-color: oklch(0.50 0.10 240);
}

.dark {
  --custom-color: oklch(0.60 0.12 240);
}
```

### Responsive Breakpoints

```
sm:  640px  (mobile)
md:  768px  (tablet)
lg:  1024px (desktop)
xl:  1280px (large desktop)
```

Pattern: `hidden lg:block` for desktop-only elements

## State Management

**Local React state only** - no Redux/Zustand/Context:

```typescript
// Typical pattern
const [filters, setFilters] = useState<FilterState>({
  stores: [],
  priceRange: [0, 50000],
  categories: [],
  dateFilter: 'all',
})
```

Forms use native state management with `onChange` handlers.

## Backend Integration

**SpringBoot Backend API**:

- Backend runs separately on `http://localhost:8080`
- API endpoints: `/api/*`
- Authentication: JWT tokens stored in localStorage
- Database: PostgreSQL (Supabase hosted)

### API Client

Use the centralized API client:

```typescript
import { apiClient } from '@/lib/api/client'
import { useProducts, useLogin } from '@/lib/api/hooks'

// Direct API calls
const products = await apiClient.getProducts({ stores: ['CU'] })

// Or use React Query hooks (recommended)
const { data, isLoading } = useProducts({ stores: ['CU'] })
```

### Available API Endpoints

**Auth**:
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

**Products**:
- `GET /api/products` - List products (with filters)
- `GET /api/products/{id}` - Get product details
- `POST /api/products` - Submit new product
- `PATCH /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

**Admin**:
- `GET /api/admin/submissions` - Pending submissions
- `POST /api/admin/submissions/{id}/approve` - Approve
- `POST /api/admin/submissions/{id}/reject` - Reject
- `POST /api/admin/users/{id}/promote` - Promote to admin
- `GET /api/admin/stats` - Get statistics

**Upload**:
- `POST /api/upload` - Upload single image
- `POST /api/products/{id}/images` - Upload product images

## Form Handling

**Pattern**: Native HTML forms + React state

```typescript
// Typical form structure
const [formData, setFormData] = useState({ name: '', store: '', ... })

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  // Validation
  // API call (currently simulated)
  // Success handling
}
```

**Image uploads**: FileReader API for preview generation, max 3 images at 5MB each

## TypeScript Configuration

- **Strict mode enabled**
- Target: ES6
- Path alias: `@/*` maps to project root
- **Build errors ignored** (`ignoreBuildErrors: true`) - fix before production

## Adding shadcn/ui Components

```bash
# Add a new component
npx shadcn@latest add <component-name>

# Example: Add table component
npx shadcn@latest add table
```

Components are added to `/components/ui/` and can be customized.

## Icons

**Lucide React** (v0.454.0) is the icon library:

```typescript
import { Menu, X, Star, ShoppingBag } from 'lucide-react'
```

## Authentication

Mock implementation in `/lib/auth.ts`:

```typescript
import { isAdmin, addAdminUser, removeAdminUser } from '@/lib/auth'

// Check admin status
if (isAdmin('username')) { ... }
```

Default admin user: `'admin'`

## Common Patterns

### Store Badge Colors

Store names map to specific OKLch colors in `product-card.tsx`:

```typescript
const getStoreBadgeClass = (store: string) => {
  const storeMap: Record<string, string> = {
    'CU': 'bg-[oklch(0.48_0.12_285)] text-white',
    'GS25': 'bg-[oklch(0.42_0.10_240)] text-white',
    // ...
  }
}
```

Add new stores by extending this mapping.

### Mobile Detection

```typescript
import { useIsMobile } from '@/hooks/use-mobile'

const isMobile = useIsMobile() // true if < 768px
```

### Toast Notifications

```typescript
import { useToast } from '@/hooks/use-toast'

const { toast } = useToast()
toast({
  title: "Success",
  description: "Your message here"
})
```

## Important Notes

- **Language**: UI is in Korean (locale: 'ko')
- **Package manager**: pnpm (not npm or yarn)
- **React version**: 19.2.0 (latest)
- **Images**: Unoptimized in config - consider enabling optimization for production
- **Analytics**: Vercel Analytics integrated in root layout
