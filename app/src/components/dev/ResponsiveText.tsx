import React, { useState, useEffect } from 'react';
import { Button, Card } from '../ui';

export const ResponsiveTest: React.FC = () => {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getBreakpointName = (width: number): string => {
    if (width < 640) return 'Mobile (< 640px)';
    if (width < 768) return 'Small (640px - 767px)';
    if (width < 1024) return 'Medium (768px - 1023px)';
    if (width < 1280) return 'Large (1024px - 1279px)';
    return 'Extra Large (≥ 1280px)';
  };

  return (
    <div className="space-y-6">
      {/* Screen Info */}
      <Card>
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Current Screen Size</h3>
          <p className="text-2xl font-mono">
            {screenSize.width} × {screenSize.height}
          </p>
          <p className="text-lg text-secondary mt-2">
            {getBreakpointName(screenSize.width)}
          </p>
        </div>
      </Card>

      {/* Grid Responsive Test */}
      <Card
        header={<h3 className="text-lg font-semibold">Responsive Grid Test</h3>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
            <div
              key={num}
              className="bg-primary text-white p-4 rounded text-center"
            >
              Item {num}
            </div>
          ))}
        </div>
        <p className="text-sm text-secondary mt-4">
          1 column on mobile, 2 on small, 3 on medium, 4 on large screens
        </p>
      </Card>

      {/* Button Responsive Test */}
      <Card
        header={<h3 className="text-lg font-semibold">Responsive Buttons</h3>}
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="primary" className="flex-1">
            Full Width on Mobile
          </Button>
          <Button variant="secondary" className="flex-1">
            Inline on Desktop
          </Button>
          <Button variant="outline" className="flex-1">
            Responsive Button
          </Button>
        </div>
      </Card>

      {/* Typography Responsive Test */}
      <Card
        header={
          <h3 className="text-lg font-semibold">Responsive Typography</h3>
        }
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
          Responsive Heading
        </h1>
        <p className="text-sm sm:text-base md:text-lg">
          This text scales with screen size. On mobile it's smaller, on desktop
          it's larger.
        </p>
      </Card>

      {/* Visibility Test */}
      <Card
        header={
          <h3 className="text-lg font-semibold">Responsive Visibility</h3>
        }
      >
        <div className="space-y-2">
          <div className="block sm:hidden bg-red-100 text-red-800 p-2 rounded">
            Visible only on mobile (block sm:hidden)
          </div>
          <div className="hidden sm:block md:hidden bg-blue-100 text-blue-800 p-2 rounded">
            Visible only on small screens (hidden sm:block md:hidden)
          </div>
          <div className="hidden md:block lg:hidden bg-green-100 text-green-800 p-2 rounded">
            Visible only on medium screens (hidden md:block lg:hidden)
          </div>
          <div className="hidden lg:block bg-purple-100 text-purple-800 p-2 rounded">
            Visible only on large screens and up (hidden lg:block)
          </div>
        </div>
      </Card>

      {/* Spacing Test */}
      <Card
        header={<h3 className="text-lg font-semibold">Responsive Spacing</h3>}
      >
        <div className="p-2 sm:p-4 md:p-6 lg:p-8 bg-tertiary rounded">
          <p>This container has responsive padding: p-2 sm:p-4 md:p-6 lg:p-8</p>
        </div>
        <div className="mt-2 sm:mt-4 md:mt-6 lg:mt-8">
          <p>
            This element has responsive margin-top: mt-2 sm:mt-4 md:mt-6 lg:mt-8
          </p>
        </div>
      </Card>
    </div>
  );
};
