import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, isLoading = false, variant = 'primary', icon, ...props }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:ring-indigo-500',
    secondary: 'bg-gray-700 text-gray-200 hover:bg-gray-600 focus-visible:ring-gray-500',
  };

  const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading && <LoadingSpinner />}
      {icon && !isLoading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};
