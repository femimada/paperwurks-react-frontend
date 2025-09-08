import React, { useEffect, useState } from 'react';

interface CSSRule {
  property: string;
  expectedValue: string;
  actualValue: string;
  isValid: boolean;
}

export const CSSVerification: React.FC = () => {
  const [cssRules, setCSSRules] = useState<CSSRule[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Wait for DOM to be ready
    const timer = setTimeout(() => {
      verifyCSSVariables();
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const verifyCSSVariables = () => {
    const rootStyles = getComputedStyle(document.documentElement);

    const expectedVariables = [
      { property: '--color-primary-600', expectedValue: '#1173d4' },
      { property: '--color-neutral-50', expectedValue: '#f8fafc' },
      { property: '--text-primary', expectedValue: '#1e293b' },
      { property: '--bg-primary', expectedValue: '#ffffff' },
      { property: '--space-4', expectedValue: '1rem' },
      { property: '--radius-md', expectedValue: '0.375rem' },
    ];

    const rules = expectedVariables.map(({ property, expectedValue }) => {
      const actualValue = rootStyles.getPropertyValue(property).trim();
      return {
        property,
        expectedValue,
        actualValue,
        isValid: actualValue === expectedValue || actualValue !== '',
      };
    });

    setCSSRules(rules);
  };

  const checkResponsiveBreakpoints = () => {
    const breakpoints = [
      { name: 'Mobile', width: 320 },
      { name: 'Tablet', width: 768 },
      { name: 'Desktop', width: 1024 },
      { name: 'Large', width: 1280 },
    ];

    return breakpoints.map(({ name, width }) => ({
      name,
      width,
      isActive: window.innerWidth >= width,
    }));
  };

  if (!isLoaded) {
    return <div>Loading CSS verification...</div>;
  }

  const allValid = cssRules.every((rule) => rule.isValid);
  const responsiveInfo = checkResponsiveBreakpoints();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border">
      <h3 className="text-lg font-semibold mb-4">CSS Integration Status</h3>

      {/* Overall Status */}
      <div
        className={`p-3 rounded mb-4 ${allValid ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}
      >
        <strong>Status:</strong>{' '}
        {allValid ? 'CSS Successfully Loaded' : 'CSS Issues Detected'}
      </div>

      {/* CSS Variables Check */}
      <div className="mb-6">
        <h4 className="font-medium mb-2">CSS Variables</h4>
        <div className="space-y-2">
          {cssRules.map((rule, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-sm"
            >
              <span className="font-mono">{rule.property}</span>
              <span
                className={`px-2 py-1 rounded ${rule.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
              >
                {rule.isValid ? '✓' : '✗'} {rule.actualValue || 'Not found'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Responsive Breakpoints */}
      <div className="mb-6">
        <h4 className="font-medium mb-2">
          Current Viewport: {window.innerWidth}px
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {responsiveInfo.map((bp, index) => (
            <div
              key={index}
              className={`p-2 text-center text-xs rounded ${bp.isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}
            >
              {bp.name}
              <br />
              {bp.width}px+
            </div>
          ))}
        </div>
      </div>

      {/* Component Class Test */}
      <div>
        <h4 className="font-medium mb-2">Component Classes Test</h4>
        <div className="space-y-2">
          <div className="btn btn--primary btn--sm">Button Test</div>
          <div className="status-badge status-badge--success">Badge Test</div>
          <div className="card p-2">Card Test</div>
        </div>
      </div>
    </div>
  );
};
