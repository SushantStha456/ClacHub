import { useState, useEffect } from 'react';
import { Eye, EyeOff, Save, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Calculator {
  id: string;
  name: string;
  slug: string;
  category: string;
  is_visible: boolean;
  sort_order: number;
  description: string;
}

export default function CalculatorManagement() {
  const [calculators, setCalculators] = useState<Calculator[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchCalculators();
  }, []);

  const fetchCalculators = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('calculators')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setCalculators(data || []);
    } catch (error) {
      console.error('Error fetching calculators:', error);
      setMessage({ type: 'error', text: 'Failed to load calculators' });
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = (id: string) => {
    setCalculators((prev) =>
      prev.map((calc) => (calc.id === id ? { ...calc, is_visible: !calc.is_visible } : calc))
    );
  };

  const updateSortOrder = (id: string, direction: 'up' | 'down') => {
    const index = calculators.findIndex((calc) => calc.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === calculators.length - 1)
    ) {
      return;
    }

    const newCalculators = [...calculators];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newCalculators[index], newCalculators[targetIndex]] = [
      newCalculators[targetIndex],
      newCalculators[index],
    ];

    newCalculators.forEach((calc, idx) => {
      calc.sort_order = idx;
    });

    setCalculators(newCalculators);
  };

  const saveChanges = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const updates = calculators.map((calc) => ({
        id: calc.id,
        is_visible: calc.is_visible,
        sort_order: calc.sort_order,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('calculators')
          .update({ is_visible: update.is_visible, sort_order: update.sort_order })
          .eq('id', update.id);

        if (error) throw error;
      }

      setMessage({ type: 'success', text: 'Changes saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving changes:', error);
      setMessage({ type: 'error', text: 'Failed to save changes' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Calculator Management</h2>
        <p className="text-gray-600">Control calculator visibility and display order</p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
              <tr>
                <th className="text-left py-4 px-6 font-semibold">Calculator Name</th>
                <th className="text-left py-4 px-6 font-semibold">Category</th>
                <th className="text-left py-4 px-6 font-semibold">Description</th>
                <th className="text-center py-4 px-6 font-semibold">Visibility</th>
                <th className="text-center py-4 px-6 font-semibold">Sort Order</th>
              </tr>
            </thead>
            <tbody>
              {calculators.map((calc, index) => (
                <tr key={calc.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">{calc.name}</div>
                    <div className="text-sm text-gray-500">{calc.slug}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 capitalize">
                      {calc.category}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-gray-600">{calc.description}</p>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => toggleVisibility(calc.id)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        calc.is_visible
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {calc.is_visible ? (
                        <>
                          <Eye className="h-4 w-4" />
                          Visible
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-4 w-4" />
                          Hidden
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => updateSortOrder(calc.id, 'up')}
                        disabled={index === 0}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          index === 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        }`}
                      >
                        ↑
                      </button>
                      <span className="font-medium text-gray-700 w-8 text-center">
                        {calc.sort_order}
                      </span>
                      <button
                        onClick={() => updateSortOrder(calc.id, 'down')}
                        disabled={index === calculators.length - 1}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          index === calculators.length - 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        }`}
                      >
                        ↓
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={saveChanges}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Save Changes
            </>
          )}
        </button>

        <button
          onClick={fetchCalculators}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className="h-5 w-5" />
          Refresh
        </button>
      </div>
    </div>
  );
}
