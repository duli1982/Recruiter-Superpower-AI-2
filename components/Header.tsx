import React from 'react';
import { TABS } from '../constants';
import { Tab, ViewMode } from '../types';

const UserIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
const SwitchIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/><path d="M21 16.5A5.5 5.5 0 0 0 15.5 11h-7A5.5 5.5 0 0 0 3 16.5"/><path d="M12 3v4M12 17v4"/></svg>;

interface HeaderProps {
  currentUser: string;
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  setActiveTab: (tab: Tab) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, currentView, setCurrentView, setActiveTab }) => {
  const handleViewSwitch = () => {
    const newView = currentView === 'recruiter' ? 'hiringManager' : 'recruiter';
    setCurrentView(newView);
    setActiveTab(Tab.Dashboard); // Reset to dashboard on view switch for a clean transition
  };

  return (
    <header className="h-16 flex-shrink-0 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 px-6 flex justify-between items-center">
      <div>
        {/* Potentially add breadcrumbs or current tab title here */}
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={handleViewSwitch} 
          className="flex items-center gap-2 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-md transition-colors"
          title="Switch View"
        >
          <SwitchIcon className="h-4 w-4" />
          <span>
            {currentView === 'recruiter' ? 'Recruiter View' : 'Manager View'}
          </span>
        </button>
        <span className="w-px h-6 bg-gray-700"></span>
        <span className="text-sm font-medium text-gray-300">Welcome, {currentUser}</span>
        <button className="h-9 w-9 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 transition-colors">
            <UserIcon className="h-5 w-5 text-gray-300" />
        </button>
      </div>
    </header>
  );
};