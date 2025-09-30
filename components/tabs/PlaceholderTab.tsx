import React from 'react';
import { Card } from '../ui/Card';

interface PlaceholderTabProps {
  title: string;
  description: string;
  // FIX: Changed icon prop type from React.ReactNode to React.ReactElement.
  // This provides a more specific type that allows React.cloneElement to work correctly
  // without type errors about props like 'className'.
  // FIX: Changed to React.ReactElement<any> to allow cloning with new props like className.
  // This resolves the overload error for React.cloneElement.
  icon?: React.ReactElement<any>;
}

export const PlaceholderTab: React.FC<PlaceholderTabProps> = ({ title, description, icon }) => {
  return (
    <div className="flex items-center justify-center h-full">
      <Card className="max-w-md text-center">
        <div className="flex justify-center mb-4 text-indigo-400">
          {icon && React.cloneElement(icon, { className: 'h-12 w-12' })}
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-gray-400 mb-1">{description}</p>
        <p className="text-lg text-indigo-400 font-semibold animate-pulse mt-4">Feature Coming Soon!</p>
      </Card>
    </div>
  );
};
