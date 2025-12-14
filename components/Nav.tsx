'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface NavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Nav = ({ activeTab, setActiveTab }: NavProps) => {
  const { theme, toggleTheme } = useTheme();
  const views = [
    { key: 'register', label: 'Register Account' },
    { key: 'accounts', label: 'View Accounts' },
    { key: 'persons', label: 'Manage Persons' },
    { key: 'access', label: 'Manage Access Levels' },
  ];

  return (
    <nav className="bg-blue-600 dark:bg-gray-800 text-white p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          {views.map((view) => (
            <button
              key={view.key}
              onClick={() => setActiveTab(view.key)}
              className={`px-4 py-2 rounded ${
                activeTab === view.key ? 'bg-blue-800 dark:bg-gray-700' : 'hover:bg-blue-700 dark:hover:bg-gray-600'
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded hover:bg-blue-700 dark:hover:bg-gray-600 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </div>
    </nav>
  );
};

export default Nav;