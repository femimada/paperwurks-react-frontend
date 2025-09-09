import React, { useState, useEffect } from 'react';
import { Button, Card } from '@/components/ui';

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
    <div className="flex flex-col gap-6">
      {/* Screen Info */}
      <Card>
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-3">Current Screen Size</h3>
          <p className="text-3xl font-mono mb-2">
            {screenSize.width} × {screenSize.height}
          </p>
          <p className="text-lg text-gray-600">
            {getBreakpointName(screenSize.width)}
          </p>
        </div>
      </Card>

      {/* Grid Responsive Test */}
      <Card header={<h3 className="card__title">Responsive Grid Test</h3>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
            <div
              key={num}
              className="bg-blue-600 text-white p-4 rounded text-center"
            >
              Item {num}
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-600">
          1 column on mobile, 2 on small, 3 on medium, 4 on large screens
        </p>
      </Card>

      {/* Button Responsive Test */}
      <Card header={<h3 className="card__title">Responsive Buttons</h3>}>
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
      <Card header={<h3 className="card__title">Responsive Typography</h3>}>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
          Responsive Heading
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-700">
          This text scales with screen size. On mobile it's smaller, on desktop
          it's larger.
        </p>
      </Card>

      {/* Visibility Test */}
      <Card header={<h3 className="card__title">Responsive Visibility</h3>}>
        <div className="flex flex-col gap-3">
          <div className="alert alert--error block sm:hidden">
            Visible only on mobile
          </div>
          <div className="alert alert--info hidden sm:block md:hidden">
            Visible only on small screens
          </div>
          <div className="alert alert--success hidden md:block lg:hidden">
            Visible only on medium screens
          </div>
          <div className="alert alert--warning hidden lg:block">
            Visible only on large screens and up
          </div>
        </div>
      </Card>

      {/* Spacing Test */}
      <Card header={<h3 className="card__title">Responsive Spacing</h3>}>
        <div className="p-2 sm:p-4 md:p-6 lg:p-8 bg-gray-100 rounded mb-4">
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
