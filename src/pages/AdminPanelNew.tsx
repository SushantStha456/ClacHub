import { useState } from 'react';
import { Calculator, Users, LogOut, Menu, X, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CalculatorManagement from './admin/CalculatorManagement';
import UserAccessManagement from './admin/UserAccessManagement';

type AdminView = 'calculators' | 'users';

interface AdminPanelProps {
  onNavigateHome?: () => void;
}

export default function AdminPanel({ onNavigateHome }: AdminPanelProps) {
  const [currentView, setCurrentView] = useState<AdminView>('calculators');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { userProfile, signOut, hasAdminAccess } = useAuth();

  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access the admin panel
          </p>
          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
            >
              Go to Home
            </button>
          )}
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'calculators' as AdminView, name: 'Calculator Management', icon: Calculator },
    { id: 'users' as AdminView, name: 'User Access', icon: Users },
  ];

  const handleSignOut = async () => {
    await signOut();
    if (onNavigateHome) onNavigateHome();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg">
                  <Calculator className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  CalcHub
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-900">{userProfile?.full_name}</p>
              <p className="text-xs text-gray-500">{userProfile?.email}</p>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <div className="text-xs font-semibold text-gray-500 uppercase mb-2 px-2">
              Admin Panel
            </div>
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    currentView === item.id
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 space-y-2">
            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200"
              >
                <Home className="h-5 w-5" />
                <span className="font-medium">Go to Home</span>
              </button>
            )}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="h-6 w-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {menuItems.find((item) => item.id === currentView)?.name}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          {currentView === 'calculators' && <CalculatorManagement />}
          {currentView === 'users' && <UserAccessManagement />}
        </div>
      </main>
    </div>
  );
}
