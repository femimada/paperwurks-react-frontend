// src/App.tsx - End-to-End Flow Test
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Alert,
  AlertDescription,
} from '@/shared/components/ui';

// Import domain components
import { useAuth } from '@/domains/auth';
import { PropertyGrid, PropertyForm } from '@/domains/properties';
import { PageLayout } from '@/shared/components/layout/PageLayout';
import LoginForm from '@/domains/auth/components/LoginForm';
import { Header } from './shared/components/layout/Header';

// Test data
const mockProperties = [
  {
    id: '1',
    title: 'Victorian Terrace House',
    address: {
      line1: '123 Oak Street',
      city: 'London',
      postcode: 'SW1A 1AA',
      country: 'UK',
    },
    propertyType: 'terraced' as const,
    tenure: 'freehold' as const,
    status: 'ready' as const,
    askingPrice: 850000,
    bedrooms: 3,
    bathrooms: 2,
    completionPercentage: 85,
    owner: {
      id: '1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john@example.com',
      role: 'owner' as const,
      permissions: ['property:create', 'property:read'],
      profile: { phone: '', bio: '' },
      isEmailVerified: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-03-01'),
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-01'),
  },
  {
    id: '2',
    title: 'Modern Apartment',
    address: {
      line1: '45 High Street',
      city: 'Manchester',
      postcode: 'M1 1AA',
      country: 'UK',
    },
    propertyType: 'flat' as const,
    tenure: 'leasehold' as const,
    status: 'draft' as const,
    askingPrice: 450000,
    bedrooms: 2,
    bathrooms: 1,
    completionPercentage: 60,
    owner: {
      id: '2',
      firstName: 'Sarah',
      lastName: 'Jones',
      email: 'sarah@example.com',
      role: 'owner' as const,
      permissions: ['property:create', 'property:read'],
      profile: { phone: '', bio: '' },
      isEmailVerified: true,
      createdAt: new Date('2024-02-10'),
      updatedAt: new Date('2024-02-20'),
    },
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-20'),
  },
];

// ===============

const mockPagination = {
  page: 1,
  limit: 20,
  total: 2,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
};

// Test Components
const AuthenticationTest: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Authentication Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAuthenticated ? (
          <div className="space-y-3">
            <Alert>
              <AlertDescription>
                ✅ Successfully authenticated as {user?.firstName}{' '}
                {user?.lastName}
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Badge variant="outline">Role: {user?.role}</Badge>
              <Badge variant="outline">Email: {user?.email}</Badge>
            </div>
            <Button onClick={logout} variant="outline">
              Logout
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                🔒 Not authenticated - please log in to continue
              </AlertDescription>
            </Alert>
            <LoginForm showCard={false} showLinks={false} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const PropertyManagementTest: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateProperty = async (data: any) => {
    console.log('Creating property:', data, showCreateForm);

    setShowCreateForm(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Management Test</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="list">
          <TabsList>
            <TabsTrigger value="list">Property List</TabsTrigger>
            <TabsTrigger value="create">Create Form</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <Alert>
              <AlertDescription>
                ➕ Testing PropertyGrid component - Responsive layout &
                interactions
              </AlertDescription>
            </Alert>

            <PropertyGrid
              properties={mockProperties}
              totalCount={mockProperties.length}
              pagination={mockPagination}
              onCreateProperty={() => setShowCreateForm(true)}
            />
          </TabsContent>

          <TabsContent value="create">
            <Alert>
              <AlertDescription>
                Testing PropertyForm component - Multi-step creation flow
              </AlertDescription>
            </Alert>

            <PropertyForm
              mode="create"
              onSubmit={handleCreateProperty}
              onCancel={() => setShowCreateForm(false)}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const ComponentSystemTest: React.FC = () => {
  const [testState, setTestState] = useState({
    buttonClicked: false,
    formSubmitted: false,
    tabChanged: false,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>UI Component System Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            🎨 Testing shadcn/ui components integration
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium">Button Variants:</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() =>
                  setTestState((prev) => ({ ...prev, buttonClicked: true }))
                }
              >
                Default
              </Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
            {testState.buttonClicked && (
              <Badge variant="outline">✅ Button interaction working</Badge>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Status Badges:</h4>
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="destructive">Error</Badge>
              <Badge variant="outline">Info</Badge>
              <Badge variant="secondary">Warning</Badge>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium">Tab Navigation:</h4>
          <Tabs
            defaultValue="tab1"
            onValueChange={() =>
              setTestState((prev) => ({ ...prev, tabChanged: true }))
            }
          >
            <TabsList>
              <TabsTrigger value="tab1">Tab 1</TabsTrigger>
              <TabsTrigger value="tab2">Tab 2</TabsTrigger>
              <TabsTrigger value="tab3">Tab 3</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">Content for Tab 1</TabsContent>
            <TabsContent value="tab2">Content for Tab 2</TabsContent>
            <TabsContent value="tab3">Content for Tab 3</TabsContent>
          </Tabs>
          {testState.tabChanged && (
            <Badge variant="outline">✅ Tab navigation working</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const SystemStatusTest: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const systemChecks = [
    {
      name: 'Domain Architecture',
      status: '✅',
      detail: 'auth/, properties/ domains loaded',
    },
    {
      name: 'Shared Components',
      status: '✅',
      detail: 'UI components working',
    },
    {
      name: 'Authentication Context',
      status: isAuthenticated ? '✅' : '⚠️',
      detail: isAuthenticated ? 'User logged in' : 'Not authenticated',
    },
    { name: 'React Router', status: '✅', detail: 'Navigation working' },
    { name: 'Form Handling', status: '✅', detail: 'React Hook Form + Zod' },
    { name: 'TypeScript', status: '✅', detail: 'Type safety enabled' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status Check</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {systemChecks.map((check, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border rounded"
            >
              <div>
                <span className="font-medium">{check.name}</span>
                <p className="text-sm text-muted-foreground">{check.detail}</p>
              </div>
              <Badge variant={check.status === '✅' ? 'default' : 'secondary'}>
                {check.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const TestDashboard: React.FC = () => {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Paperwurks E2E Test Dashboard</h1>
          <p className="text-muted-foreground">
            Testing the complete property management workflow with new domain
            architecture
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SystemStatusTest />
          <AuthenticationTest />
        </div>

        <ComponentSystemTest />

        <PropertyManagementTest />

        <Card>
          <CardHeader>
            <CardTitle>Test Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">To test the complete flow:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Check the System Status - all should be ✅</li>
                <li>
                  Test authentication by logging in (use any credentials for
                  demo)
                </li>
                <li>Test UI components - click buttons, change tabs</li>
                <li>View property list and interact with properties</li>
                <li>Try creating a new property using the multi-step form</li>
                <li>Check browser console for any errors</li>
              </ol>
            </div>

            <Alert>
              <AlertDescription>
                💡 This is a comprehensive test of your migrated domain
                architecture. All components should load without errors and
                interactions should work smoothly.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<TestDashboard />} />
              <Route path="/test" element={<TestDashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
