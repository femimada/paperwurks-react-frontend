# Paperwurks React Application - Folder Structure

## Project Root Structure

```
paperwurks-react/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   ├── manifest.json
│   ├── robots.txt
│   └── assets/
│       ├── icons/
│       └── images/
├── src/
│   ├── components/           # Reusable UI components
│   ├── pages/               # Page-level components
│   ├── features/            # Feature-specific modules
│   ├── hooks/               # Custom React hooks
│   ├── context/             # React context providers
│   ├── services/            # API and external service calls
│   ├── utils/               # Utility functions and helpers
│   ├── types/               # TypeScript type definitions
│   ├── constants/           # Application constants
│   ├── styles/              # CSS files
│   ├── assets/              # Static assets (images, icons)
│   ├── App.tsx              # Root application component
│   ├── main.tsx             # Application entry point
│   └── vite-env.d.ts        # Vite type definitions
├── tests/
│   ├── __mocks__/           # Mock files for testing
│   ├── fixtures/            # Test data fixtures
│   ├── utils/               # Test utility functions
│   └── setup.ts             # Test environment setup
├── docs/                    # Documentation
├── .env.example             # Environment variables template
├── .env.local               # Local environment variables
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── eslint.config.js
├── prettier.config.js
└── README.md
```

## Detailed Source Structure

### `/src/components/` - Reusable UI Components

```
components/
├── ui/                      # Basic UI components (atoms)
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── index.ts
│   ├── Input/
│   │   ├── Input.tsx
│   │   ├── Input.test.tsx
│   │   └── index.ts
│   ├── Card/
│   │   ├── Card.tsx
│   │   ├── Card.test.tsx
│   │   └── index.ts
│   ├── Badge/
│   │   ├── Badge.tsx
│   │   ├── Badge.test.tsx
│   │   └── index.ts
│   ├── Modal/
│   │   ├── Modal.tsx
│   │   ├── Modal.test.tsx
│   │   └── index.ts
│   ├── Spinner/
│   │   ├── Spinner.tsx
│   │   ├── Spinner.test.tsx
│   │   └── index.ts
│   ├── Avatar/
│   │   ├── Avatar.tsx
│   │   ├── Avatar.test.tsx
│   │   └── index.ts
│   ├── ProgressBar/
│   │   ├── ProgressBar.tsx
│   │   ├── ProgressBar.test.tsx
│   │   └── index.ts
│   └── index.ts             # Export all UI components
├── forms/                   # Form-specific components
│   ├── FormField/
│   │   ├── FormField.tsx
│   │   ├── FormField.test.tsx
│   │   └── index.ts
│   ├── FormError/
│   │   ├── FormError.tsx
│   │   ├── FormError.test.tsx
│   │   └── index.ts
│   ├── FileUpload/
│   │   ├── FileUpload.tsx
│   │   ├── FileUpload.test.tsx
│   │   └── index.ts
│   ├── PropertyForm/
│   │   ├── PropertyForm.tsx
│   │   ├── PropertyForm.test.tsx
│   │   └── index.ts
│   └── index.ts
├── layout/                  # Layout components
│   ├── Header/
│   │   ├── Header.tsx
│   │   ├── Header.test.tsx
│   │   └── index.ts
│   ├── Sidebar/
│   │   ├── Sidebar.tsx
│   │   ├── Sidebar.test.tsx
│   │   └── index.ts
│   ├── Navigation/
│   │   ├── Navigation.tsx
│   │   ├── Navigation.test.tsx
│   │   └── index.ts
│   ├── Footer/
│   │   ├── Footer.tsx
│   │   ├── Footer.test.tsx
│   │   └── index.ts
│   ├── PageLayout/
│   │   ├── PageLayout.tsx
│   │   ├── PageLayout.test.tsx
│   │   └── index.ts
│   └── index.ts
├── common/                  # Common composite components
│   ├── NotificationCenter/
│   │   ├── NotificationCenter.tsx
│   │   ├── NotificationItem.tsx
│   │   ├── NotificationCenter.test.tsx
│   │   └── index.ts
│   ├── StatusBadge/
│   │   ├── StatusBadge.tsx
│   │   ├── StatusBadge.test.tsx
│   │   └── index.ts
│   ├── Timeline/
│   │   ├── Timeline.tsx
│   │   ├── TimelineItem.tsx
│   │   ├── Timeline.test.tsx
│   │   └── index.ts
│   ├── DataTable/
│   │   ├── DataTable.tsx
│   │   ├── DataTableRow.tsx
│   │   ├── DataTable.test.tsx
│   │   └── index.ts
│   ├── Breadcrumbs/
│   │   ├── Breadcrumbs.tsx
│   │   ├── Breadcrumbs.test.tsx
│   │   └── index.ts
│   └── index.ts
└── index.ts                 # Export all components
```

### `/src/pages/` - Page Components

```
pages/
├── auth/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── ForgotPasswordPage.tsx
│   └── index.ts
├── dashboard/
│   ├── AgentDashboard.tsx
│   ├── OwnerDashboard.tsx
│   ├── SolicitorDashboard.tsx
│   └── index.ts
├── properties/
│   ├── PropertyListPage.tsx
│   ├── PropertyDetailsPage.tsx
│   ├── PropertyCreatePage.tsx
│   ├── PropertyEditPage.tsx
│   └── index.ts
├── documents/
│   ├── DocumentViewerPage.tsx
│   ├── DocumentUploadPage.tsx
│   ├── DocumentListPage.tsx
│   └── index.ts
├── notifications/
│   ├── NotificationCenterPage.tsx
│   └── index.ts
├── settings/
│   ├── SettingsPage.tsx
│   ├── ProfilePage.tsx
│   └── index.ts
├── sharing/
│   ├── SharePackPage.tsx
│   ├── SharedPackViewPage.tsx
│   └── index.ts
├── welcome/
│   ├── WelcomePage.tsx
│   ├── LandingPage.tsx
│   └── index.ts
├── errors/
│   ├── NotFoundPage.tsx
│   ├── ErrorPage.tsx
│   └── index.ts
└── index.ts
```

### `/src/features/` - Feature-Specific Modules

```
features/
├── auth/
│   ├── components/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── PasswordResetForm.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useLogin.ts
│   │   └── useRegister.ts
│   ├── services/
│   │   └── authService.ts
│   ├── types/
│   │   └── auth.types.ts
│   └── index.ts
├── properties/
│   ├── components/
│   │   ├── PropertyCard.tsx
│   │   ├── PropertyGrid.tsx
│   │   ├── PropertyDetails.tsx
│   │   ├── PropertyForm.tsx
│   │   └── PropertyStatusTracker.tsx
│   ├── hooks/
│   │   ├── useProperties.ts
│   │   ├── usePropertyCreate.ts
│   │   ├── usePropertyUpdate.ts
│   │   └── usePropertyDelete.ts
│   ├── services/
│   │   └── propertyService.ts
│   ├── types/
│   │   └── property.types.ts
│   └── index.ts
├── documents/
│   ├── components/
│   │   ├── DocumentViewer.tsx
│   │   ├── DocumentList.tsx
│   │   ├── DocumentUploader.tsx
│   │   ├── DocumentAnnotations.tsx
│   │   └── DocumentThumbnail.tsx
│   ├── hooks/
│   │   ├── useDocuments.ts
│   │   ├── useDocumentUpload.ts
│   │   ├── useDocumentViewer.ts
│   │   └── useAnnotations.ts
│   ├── services/
│   │   └── documentService.ts
│   ├── types/
│   │   └── document.types.ts
│   └── index.ts
├── notifications/
│   ├── components/
│   │   ├── NotificationList.tsx
│   │   ├── NotificationItem.tsx
│   │   └── NotificationBell.tsx
│   ├── hooks/
│   │   ├── useNotifications.ts
│   │   └── useNotificationActions.ts
│   ├── services/
│   │   └── notificationService.ts
│   ├── types/
│   │   └── notification.types.ts
│   └── index.ts
├── sharing/
│   ├── components/
│   │   ├── ShareModal.tsx
│   │   ├── ShareLinkGenerator.tsx
│   │   ├── AccessControlPanel.tsx
│   │   └── SharedPackViewer.tsx
│   ├── hooks/
│   │   ├── useSharing.ts
│   │   ├── useShareLink.ts
│   │   └── useAccessControl.ts
│   ├── services/
│   │   └── sharingService.ts
│   ├── types/
│   │   └── sharing.types.ts
│   └── index.ts
├── users/
│   ├── components/
│   │   ├── UserProfile.tsx
│   │   ├── UserList.tsx
│   │   ├── UserRoleSelector.tsx
│   │   └── UserSettings.tsx
│   ├── hooks/
│   │   ├── useUsers.ts
│   │   ├── useUserProfile.ts
│   │   └── useUserSettings.ts
│   ├── services/
│   │   └── userService.ts
│   ├── types/
│   │   └── user.types.ts
│   └── index.ts
└── index.ts
```

### `/src/hooks/` - Custom React Hooks

```
hooks/
├── api/                     # API-related hooks
│   ├── useApi.ts
│   ├── useQuery.ts
│   ├── useMutation.ts
│   └── index.ts
├── auth/                    # Authentication hooks
│   ├── useAuth.ts
│   ├── usePermissions.ts
│   └── index.ts
├── ui/                      # UI-related hooks
│   ├── useModal.ts
│   ├── useToast.ts
│   ├── useLocalStorage.ts
│   ├── useDebounce.ts
│   ├── useClickOutside.ts
│   ├── useKeyboardShortcut.ts
│   └── index.ts
├── form/                    # Form-related hooks
│   ├── useForm.ts
│   ├── useFormValidation.ts
│   └── index.ts
├── data/                    # Data management hooks
│   ├── usePagination.ts
│   ├── useSort.ts
│   ├── useFilter.ts
│   └── index.ts
└── index.ts
```

### `/src/context/` - React Context Providers

```
context/
├── AuthContext.tsx
├── ThemeContext.tsx
├── NotificationContext.tsx
├── ModalContext.tsx
├── ToastContext.tsx
├── AppContext.tsx
└── index.ts
```

### `/src/services/` - API and External Services

```
services/
├── api/
│   ├── client.ts            # Axios configuration
│   ├── endpoints.ts         # API endpoints
│   ├── interceptors.ts      # Request/response interceptors
│   └── index.ts
├── auth/
│   ├── authService.ts
│   ├── tokenService.ts
│   └── index.ts
├── properties/
│   ├── propertyService.ts
│   └── index.ts
├── documents/
│   ├── documentService.ts
│   ├── uploadService.ts
│   └── index.ts
├── notifications/
│   ├── notificationService.ts
│   └── index.ts
├── users/
│   ├── userService.ts
│   └── index.ts
├── sharing/
│   ├── sharingService.ts
│   └── index.ts
├── external/
│   ├── aiService.ts         # AI document analysis
│   ├── emailService.ts      # Email notifications
│   └── index.ts
└── index.ts
```

### `/src/utils/` - Utility Functions

```
utils/
├── api/
│   ├── errorHandler.ts
│   ├── responseHandler.ts
│   └── index.ts
├── auth/
│   ├── permissions.ts
│   ├── roleUtils.ts
│   └── index.ts
├── validation/
│   ├── schemas.ts           # Zod validation schemas
│   ├── validators.ts
│   └── index.ts
├── formatting/
│   ├── dateUtils.ts
│   ├── numberUtils.ts
│   ├── stringUtils.ts
│   └── index.ts
├── file/
│   ├── fileUtils.ts
│   ├── uploadUtils.ts
│   ├── downloadUtils.ts
│   └── index.ts
├── url/
│   ├── urlUtils.ts
│   ├── queryParams.ts
│   └── index.ts
├── storage/
│   ├── localStorage.ts
│   ├── sessionStorage.ts
│   └── index.ts
├── constants.ts
├── logger.ts
├── encryption.ts
└── index.ts
```

### `/src/types/` - TypeScript Definitions

```
types/
├── api/
│   ├── common.types.ts      # Common API types
│   ├── response.types.ts    # API response types
│   ├── error.types.ts       # Error types
│   └── index.ts
├── auth/
│   ├── auth.types.ts
│   ├── user.types.ts
│   ├── permission.types.ts
│   └── index.ts
├── property/
│   ├── property.types.ts
│   ├── pack.types.ts
│   └── index.ts
├── document/
│   ├── document.types.ts
│   ├── annotation.types.ts
│   └── index.ts
├── notification/
│   ├── notification.types.ts
│   └── index.ts
├── sharing/
│   ├── sharing.types.ts
│   └── index.ts
├── ui/
│   ├── component.types.ts
│   ├── form.types.ts
│   └── index.ts
├── global.types.ts          # Global type definitions
└── index.ts
```

### `/src/constants/` - Application Constants

```
constants/
├── api.ts                   # API-related constants
├── routes.ts               # Route paths
├── permissions.ts          # Permission constants
├── storage.ts              # Storage keys
├── validation.ts           # Validation constants
├── ui.ts                   # UI constants
├── roles.ts                # User role constants
├── status.ts               # Status constants
└── index.ts
```

### `/src/styles/` - CSS Files

```
styles/
├── variables.css           # CSS custom properties
├── base.css               # Base styles and reset
├── components.css         # Component styles
├── utilities.css          # Utility classes
├── index.css              # Main import file
└── legacy/                # Legacy CSS (if migrating)
    └── old-styles.css
```

## Configuration Files

### Root Configuration Files

```
├── .env.example           # Environment variables template
├── .env.local            # Local development environment
├── .gitignore            # Git ignore patterns
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite build configuration
├── vitest.config.ts      # Test configuration
├── eslint.config.js      # ESLint configuration
├── prettier.config.js    # Prettier configuration
└── README.md             # Project documentation
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/pages/*": ["src/pages/*"],
      "@/features/*": ["src/features/*"],
      "@/hooks/*": ["src/hooks/*"],
      "@/utils/*": ["src/utils/*"],
      "@/services/*": ["src/services/*"],
      "@/types/*": ["src/types/*"],
      "@/constants/*": ["src/constants/*"],
      "@/styles/*": ["src/styles/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

This folder structure provides:

- **Clear separation of concerns** with dedicated directories for different types of code
- **Feature-based organization** for scalable development
- **Type safety** with comprehensive TypeScript definitions
- **Testing structure** with co-located test files
- **Consistent naming conventions** following React best practices
- **Import path aliases** for cleaner imports
- **Modular architecture** supporting code splitting and lazy loading
