import { Calculator, Menu, X, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

interface CalculatorData {
  id: string;
  name: string;
  slug: string;
  category: string;
  is_visible: boolean;
}

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [financialDropdownOpen, setFinancialDropdownOpen] = useState(false);
  const [calculators, setCalculators] = useState<CalculatorData[]>([]);

  useEffect(() => {
    fetchCalculators();
  }, []);

  const fetchCalculators = async () => {
    try {
      const { data, error } = await supabase
        .from('calculators')
        .select('id, name, slug, category, is_visible')
        .eq('is_visible', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setCalculators(data || []);
    } catch (error) {
      console.error('Error fetching calculators:', error);
    }
  };

  const navItems = [{ name: 'Home', id: 'home' }];

  const nonFinancialCalcs = calculators.filter((calc) => calc.category !== 'financial');
  nonFinancialCalcs.forEach((calc) => {
    navItems.push({ name: calc.name, id: calc.slug });
  });

  navItems.push({ name: 'About Us', id: 'about' });

  const financialItems = calculators
    .filter((calc) => calc.category === 'financial')
    .map((calc) => ({ name: calc.name, id: calc.slug }));

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => onNavigate('home')}
          >
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
              <Calculator className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              CalcHub
            </span>
          </div>

          <nav className="hidden md:flex space-x-1 items-center">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage === item.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.name}
              </button>
            ))}

            {financialItems.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setFinancialDropdownOpen(!financialDropdownOpen)}
                  onBlur={() => setTimeout(() => setFinancialDropdownOpen(false), 200)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                    financialItems.some(item => item.id === currentPage)
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Financial
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${financialDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {financialDropdownOpen && (
                  <div className="absolute top-full mt-1 right-0 bg-white rounded-lg shadow-xl border border-gray-100 py-2 min-w-[200px]">
                    {financialItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          onNavigate(item.id);
                          setFinancialDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm font-medium transition-all duration-200 ${
                          currentPage === item.id
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </nav>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage === item.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.name}
              </button>
            ))}

            {financialItems.length > 0 && (
              <div className="space-y-1">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                  Financial Calculators
                </div>
                {financialItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      currentPage === item.id
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
