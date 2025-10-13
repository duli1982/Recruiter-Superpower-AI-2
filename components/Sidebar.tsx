import React from 'react';
import { Tab, ViewMode } from '../types';
import { TABS, MANAGER_TABS } from '../constants';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  currentView: ViewMode;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, currentView }) => {
  const tabsToRender = currentView === 'recruiter' ? TABS : MANAGER_TABS;
  
  return (
    <aside className="w-64 flex-shrink-0 bg-gray-900 border-r border-gray-700 flex flex-col">
      <div className="h-16 flex items-center justify-center px-4 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white tracking-tight">Superpower AI</h1>
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {tabsToRender.map((tab) => (
            <li key={tab.id}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(tab.id);
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {React.cloneElement(tab.icon as React.ReactElement<any>, { className: 'h-5 w-5 flex-shrink-0' })}
                <span className="truncate">{tab.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};