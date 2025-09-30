import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-lg shadow-lg p-6 ${className}`}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, description, icon }) => {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-3">
        {icon && <div className="text-indigo-400">{icon}</div>}
        <h3 className="text-lg font-bold text-white">{title}</h3>
      </div>
      {description && <p className="mt-1 text-sm text-gray-400">{description}</p>}
    </div>
  );
};
