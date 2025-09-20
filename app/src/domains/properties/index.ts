// src/domains/properties/index.ts - Updated exports
// Components
export { PropertyGrid } from './components/PropertyGrid';
export { PropertyForm } from './components/PropertyForm';
export { PropertyCard } from './components/PropertyCard';
export { PropertyFileDashboard } from './components/PropertyDetails';
export { PropertySummary } from './components/PropertySummary'; // NEW: Simplified property display

// Hooks
export { useProperties } from './hooks/useProperties';

// Services
export { propertyService } from './services/propertyService';

// Pages
export { PropertyCreatePage } from './pages/PropertyCreatePage';
export { PropertyDetailsPage } from './pages/PropertyDetailsPage';
export { PropertyEditPage } from './pages/PropertyEditPage';
export { PropertyListPage } from './pages/PropertyListPage';

// Types
export type {
  Property,
  CreatePropertyData,
  UpdatePropertyData,
  PropertyFilters,
  PropertyListItem,
  DocumentInvitation, // NEW: For seller document invitations
} from './types';
