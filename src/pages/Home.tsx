import { useState, useEffect } from 'react';
import { Calculator, TrendingUp, Calendar, DollarSign, ArrowRight, CreditCard, PiggyBank } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface HomeProps {
  onNavigate: (page: string) => void;
}

interface CalculatorData {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_visible: boolean;
}

const iconMap: Record<string, any> = {
  bmi: Calculator,
  age: Calendar,
  emi: CreditCard,
  interest: PiggyBank,
  investment: DollarSign,
};

const gradientMap: Record<string, string> = {
  bmi: 'from-blue-500 to-cyan-500',
  age: 'from-purple-500 to-pink-500',
  emi: 'from-emerald-500 to-teal-500',
  interest: 'from-emerald-500 to-teal-500',
  investment: 'from-emerald-500 to-teal-500',
};

export default function Home({ onNavigate }: HomeProps) {
  const [calculators, setCalculators] = useState<CalculatorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCalculators();
  }, []);

  const fetchCalculators = async () => {
    try {
      const { data, error } = await supabase
        .from('calculators')
        .select('id, name, slug, description, is_visible')
        .eq('is_visible', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setCalculators(data || []);
    } catch (error) {
      console.error('Error fetching calculators:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calculators...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-6 shadow-lg">
            <TrendingUp className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              CalcHub
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your all-in-one platform for essential calculations. Simple, accurate, and free to use.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {calculators.map((calc) => {
            const Icon = iconMap[calc.slug] || Calculator;
            const gradient = gradientMap[calc.slug] || 'from-emerald-500 to-teal-500';
            return (
              <div
                key={calc.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-1"
                onClick={() => onNavigate(calc.slug)}
              >
                <div className={`h-2 bg-gradient-to-r ${gradient}`} />
                <div className="p-8">
                  <div
                    className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${gradient} mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{calc.name}</h3>
                  <p className="text-gray-600 mb-6">{calc.description}</p>
                  <div className="flex items-center text-emerald-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    Try it now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose CalcHub?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div>
              <div className="text-4xl font-bold mb-2">100%</div>
              <div className="text-emerald-100">Free Forever</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">Instant</div>
              <div className="text-emerald-100">Real-time Results</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">Accurate</div>
              <div className="text-emerald-100">Precise Calculations</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
