import { useState } from 'react';
import { Avatar, Badge, Button, Card, Input, Spinner } from '@/components/ui';
import { CSSVerification } from '@/components/dev/CssVerification';
import { ResponsiveTest } from '@/components/dev/ResponsiveText';

const App = () => {
  const [activeTab, setActiveTab] = useState<
    'components' | 'verification' | 'responsive'
  >('components');

  return (
    <div className="min-h-screen bg-secondary">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-primary mb-8">
          Paperwurks CSS Integration Test
        </h1>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-primary">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'components' as const, label: 'UI Components' },
                { id: 'verification' as const, label: 'CSS Verification' },
                { id: 'responsive' as const, label: 'Responsive Test' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-secondary hover:text-primary hover:border-secondary'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'components' && (
          <div className="space-y-8">
            {/* Button Testing */}
            <Card header={<h2 className="text-xl font-semibold">Buttons</h2>}>
              <div className="d-flex gap-4 flex-wrap">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="primary" loading>
                  Loading
                </Button>
              </div>

              <div className="d-flex gap-4 flex-wrap mt-4">
                <Button size="sm">Small</Button>
                <Button size="base">Base</Button>
                <Button size="lg">Large</Button>
              </div>
            </Card>

            {/* Input Testing */}
            <Card header={<h2 className="text-xl font-semibold">Inputs</h2>}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Basic Input" placeholder="Enter text here" />
                <Input
                  label="Input with Error"
                  placeholder="Invalid input"
                  error="This field is required"
                />
                <Input
                  label="Input with Helper Text"
                  placeholder="Enter email"
                  helperText="We'll never share your email"
                />
                <Input label="Disabled Input" placeholder="Disabled" disabled />
              </div>
            </Card>

            {/* Badge Testing */}
            <Card header={<h2 className="text-xl font-semibold">Badges</h2>}>
              <div className="d-flex gap-4 flex-wrap items-center">
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="error">Error</Badge>
                <Badge variant="info">Info</Badge>
                <Badge variant="neutral">Neutral</Badge>
                <Badge variant="success" dot>
                  With Dot
                </Badge>
              </div>
            </Card>

            {/* Avatar Testing */}
            <Card header={<h2 className="text-xl font-semibold">Avatars</h2>}>
              <div className="d-flex gap-4 flex-wrap items-center">
                <Avatar fallback="JD" size="sm" />
                <Avatar fallback="JD" size="base" />
                <Avatar fallback="JD" size="lg" />
                <Avatar fallback="JD" size="xl" />
                <Avatar
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
                  alt="John Doe"
                  size="lg"
                />
              </div>
            </Card>

            {/* Spinner Testing */}
            <Card header={<h2 className="text-xl font-semibold">Spinners</h2>}>
              <div className="d-flex gap-4 flex-wrap items-center">
                <Spinner size="sm" />
                <Spinner size="base" />
                <Spinner size="lg" />
                <Spinner size="xl" />
                <Spinner color="var(--color-primary-600)" />
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'verification' && <CSSVerification />}
        {activeTab === 'responsive' && <ResponsiveTest />}
      </div>
    </div>
  );
};

export default App;
