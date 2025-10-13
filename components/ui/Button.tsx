import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, isLoading = false, variant = 'primary', icon, ...props }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform";
  
  const variantClasses = {
    // New gradient style to match the "Create" button aesthetic from the user's screenshot.
    // This provides a vibrant, modern look for all primary CTAs.
    primary: 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/40 hover:from-indigo-600 hover:to-purple-700 hover:-translate-y-px focus-visible:ring-indigo-500 active:translate-y-0',
    secondary: 'bg-gray-800 border border-gray-600 text-gray-300 shadow-sm hover:bg-gray-700 hover:border-gray-500 focus-visible:ring-gray-500 active:bg-gray-800/50',
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
