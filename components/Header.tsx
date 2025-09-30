import React from 'react';
import { TABS } from '../constants';
import { useMemo } from 'react';

const UserIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;

export const Header: React.FC = () => {
  // A simple way to get a different "user" on each load
  const user = useMemo(() => {
    const names = ['Alex', 'Jordan', 'Taylor', 'Casey'];
    return names[Math.floor(Math.random() * names.length)];
  }, []);

  return (
    <header className="h-16 flex-shrink-0 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 px-6 flex justify-between items-center">
      <div>
        {/* Potentially add breadcrumbs or current tab title here */}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-300">Welcome, {user}</span>
        <button className="h-9 w-9 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 transition-colors">
            <UserIcon className="h-5 w-5 text-gray-300" />
        </button>
      </div>
    </header>
  );
};
