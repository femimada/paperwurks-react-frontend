# Paperwurks React Application - Updated Folder Structure

## Project Root Structure

```
paperwurks-react/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   ├── manifest.json
│   └── robots.txt
├── src/                     # Source code (Domain-Driven Architecture)
├── tests/
├── docs/
├── .env.example
├── .env.local
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── eslint.config.js
├── prettier.config.js
└── README.md
```

## Source Structure (Domain-Driven Architecture)

### `/src/` - Root Source Directory

```
src/
├── __tests__/               # All tests consolidated
│   ├── e2e/                # End-to-end tests
│   ├── integration/        # Integration tests
│   ├── mocks/              # Test mocks and handlers
│   ├── setup/              # Test setup files
│   └── utils/              # Test utilities
├── context/                 # React Context providers
│   ├── AuthContext.tsx
│   ├── __tests__/
│   └── index.ts
├── domains/                 # Business domains (core feature areas)
│   ├── auth/               # Authentication domain
│   ├── documents/          # Document management domain
│   ├── notifications/      # Notifications domain
│   └── properties/         # Property management domain
├── lib/                     # Library utilities (3rd party integrations)
│   └── utils.ts            # Utility functions (cn, etc.)
├── services/                # Global API services
│   └── api/                # API client configuration
├── shared/                  # Shared code across domains
│   ├── components/         # Shared UI components
│   ├── constants/          # Application constants
│   ├── hooks/              # Generic hooks
│   ├── types/              # Shared type definitions
│   └── utils/              # Utility functions
├── styles/                  # Global styles
├── App.tsx                  # Root application component
├── main.tsx                 # Application entry point
├── setupTests.ts            # Test configuration
└── vite-env.d.ts           # Vite type definitions
```

## Domain Structure (Detailed)

Each domain follows a consistent structure for maintainability and scalability.

### `/src/domains/auth/` - Authentication Domain

```
auth/
├── components/              # Auth-specific components
│   ├── AuthCard.tsx
│   ├── AuthHeader.tsx
│   ├── AuthLayout.tsx
│   ├── LoginForm.tsx
│   ├── RegisterForm/       # Complex components get folders
│   │   ├── RegisterForm.tsx
│   │   ├── components/
│   │   │   ├── StepNavigation.tsx
│   │   │   ├── StepProgress.tsx
│   │   │   ├── PasswordStrengthMeter.tsx
│   │   │   └── FieldError.tsx
│   │   └── steps/
│   │       ├── PersonalInfoStep.tsx
│   │       ├── RoleSelectionStep.tsx
│   │       └── TermsStep.tsx
│   ├── ProtectedRoute.tsx
│   ├── RoleBasedAccess.tsx
│   ├── UnauthorizedPage.tsx
│   └── __tests__/
├── hooks/                   # Auth-specific hooks
│   ├── useAuth.ts
│   ├── useLogin.ts
│   ├── usePermissions.ts
│   ├── useRegister.ts
│   └── index.ts
├── pages/                   # Auth pages
│   ├── ForgotPasswordPage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── ResetPasswordPage.tsx
│   ├── __tests__/
│   └── index.ts
├── services/                # Auth API services
│   ├── authService.ts
│   ├── tokenService.ts
│   ├── __tests__/
│   └── index.ts
├── types/                   # Auth type definitions
│   ├── auth.types.ts
│   ├── permission.types.ts
│   ├── user.types.ts
│   └── index.ts
├── utils/                   # Auth utilities
├── index.ts                 # Barrel export for clean imports
```

### `/src/domains/properties/` - Property Management Domain

```
properties/
├── components/              # Property-specific components
│   ├── PropertyCard/
│   │   ├── PropertyCard.tsx
│   │   └── index.ts
│   ├── PropertyDetails/
│   │   ├── PropertyDetails.tsx
│   │   └── index.ts
│   ├── PropertyForm/
│   │   ├── PropertyForm.tsx
│   │   └── index.ts
│   ├── PropertyGrid/
│   │   ├── PropertyGrid.tsx
│   │   └── index.ts
│   └── index.ts
├── hooks/                   # Property-specific hooks
│   ├── useProperties.ts
│   ├── useProperty.ts
│   ├── usePropertyCreate.ts
│   ├── usePropertyUpdate.ts
│   ├── __tests__/
│   └── index.ts
├── pages/                   # Property pages
│   ├── PropertyCreatePage.tsx
│   ├── PropertyDetailsPage.tsx
│   ├── PropertyEditPage.tsx
│   ├── PropertyListPage.tsx
│   └── index.ts
├── services/                # Property API services
│   ├── propertyService.ts
│   ├── __tests__/
│   └── index.ts
├── types/                   # Property type definitions
│   ├── property.types.ts
│   ├── pack.types.ts
│   └── index.ts
├── utils/                   # Property utilities
├── index.ts                 # Barrel export for clean imports
```

### `/src/domains/documents/` - Document Management Domain (Ready for Stage 4)

```
documents/
├── components/              # Document components (to be implemented)
│   ├── DocumentUploader/
│   ├── DocumentViewer/
│   ├── DocumentList/
│   └── DocumentAnnotations/
├── hooks/                   # Document hooks (to be implemented)
│   ├── useDocuments.ts
│   ├── useDocumentUpload.ts
│   └── useDocumentViewer.ts
├── pages/                   # Document pages (to be implemented)
├── services/                # Document API services (to be implemented)
├── types/                   # Document type definitions (to be implemented)
├── utils/                   # Document utilities (to be implemented)
└── index.ts
```

### `/src/domains/notifications/` - Notifications Domain (Future)

```
notifications/
├── components/              # Notification components (future)
├── hooks/                   # Notification hooks (future)
├── services/                # Notification API services (future)
├── types/                   # Notification type definitions (future)
└── index.ts
```

## Shared Code Structure

### `/src/shared/components/` - Shared UI Components

```
shared/components/
├── ui/                      # shadcn/ui components
│   ├── alert.tsx
│   ├── avatar.tsx
│   ├── badge.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── form.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── select.tsx
│   ├── table.tsx
│   ├── tabs.tsx
│   └── index.ts            # Barrel export
├── layout/                  # Layout components
│   ├── Footer/
│   │   ├── Footer.tsx
│   │   └── index.ts
│   ├── Header/
│   │   ├── Header.tsx
│   │   └── index.ts
│   ├── Navigation/
│   │   ├── Navigation.tsx
│   │   └── index.ts
│   ├── PageLayout/
│   │   ├── PageLayout.tsx
│   │   └── index.ts
│   └── index.ts
├── Logo.tsx                 # Shared logo component
└── index.ts                 # Barrel export
```

### `/src/shared/constants/` - Application Constants

```
shared/constants/
├── api.ts                   # API endpoints and configuration
├── roles.ts                # User roles and permissions
├── routes.ts               # Application routes
├── status.ts               # Status constants
├── storage.ts              # Storage keys
└── index.ts                # Barrel export
```

### `/src/shared/hooks/` - Generic Hooks

```
shared/hooks/
├── useUkAddressAutocomplete.ts  # Address autocomplete hook
├── useDebounce.ts              # Debounce hook (future)
├── useLocalStorage.ts          # Local storage hook (future)
└── index.ts
```

### `/src/shared/types/` - Shared Type Definitions

```
shared/types/
├── api/                     # API-related types
│   ├── common.types.ts
│   └── error.types.ts
├── global.types.ts         # Global type definitions
└── index.ts
```

### `/src/shared/utils/` - Utility Functions

```
shared/utils/
├── formatting/              # Formatting utilities
│   ├── dateUtils.ts
│   └── stringUtils.ts
├── storage/                 # Storage utilities
│   └── localStorage.ts
├── validation/              # Validation utilities
│   └── authSchemas.ts
├── cn.ts                   # className utility (clsx + tailwind-merge)
├── constants.ts            # Utility constants
├── logger.ts               # Logging utility
└── index.ts                # Barrel export
```

## Import Patterns (Clean Architecture)

### Domain Barrel Imports (Recommended)

```typescript
// Clean imports using barrel exports
import { LoginForm, useAuth, authService } from "@/domains/auth";
import {
  PropertyGrid,
  useProperties,
  propertyService,
} from "@/domains/properties";
import { Button, Card, Input } from "@/shared/components/ui";
import { ROUTES, API_ENDPOINTS } from "@/shared/constants";
import { logger, formatCurrency } from "@/shared/utils";
```

### Path Mapping Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/domains/*": ["./src/domains/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/tests/*": ["./src/__tests__/*"]
    }
  }
}
```

## Benefits of This Architecture

### 1. **Domain-Driven Design**

- Each business domain is self-contained
- Clear boundaries between different feature areas
- Easy to locate and modify domain-specific code

### 2. **Scalability**

- New domains can be added following the same pattern
- Team members can work on different domains independently
- Code splitting and lazy loading by domain

### 3. **Maintainability**

- Consistent structure across all domains
- Shared code properly separated and reusable
- Clear import patterns prevent circular dependencies

### 4. **Testing**

- Domain-specific tests co-located with code
- Shared test utilities for consistency
- Integration tests validate cross-domain interactions

### 5. **Developer Experience**

- Predictable file locations
- Clean barrel imports
- IDE navigation and autocomplete friendly
