'use client';

interface NavProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

const Nav = ({ currentView, setCurrentView }: NavProps) => {
  const views = [
    { key: 'register', label: 'Register Account' },
    { key: 'accounts', label: 'View Accounts' },
    { key: 'persons', label: 'Manage Persons' },
    { key: 'access', label: 'Manage Access Levels' },
  ];

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="max-w-6xl mx-auto flex space-x-4">
        {views.map((view) => (
          <button
            key={view.key}
            onClick={() => setCurrentView(view.key)}
            className={`px-4 py-2 rounded ${
              currentView === view.key ? 'bg-blue-800' : 'hover:bg-blue-700'
            }`}
          >
            {view.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Nav;