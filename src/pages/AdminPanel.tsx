import { useState, useEffect } from 'react';
import { Settings, Eye, EyeOff, Save, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Calculator {
  id: string;
  name: string;
  slug: string;
  category: string;
  is_visible: boolean;
  sort_order: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export default function AdminPanel() {
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading calculators...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
            <Settings className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Admin Panel</h1>
          <p className="text-lg text-gray-600">Manage calculator visibility and display order</p>
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

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
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

        <div className="flex gap-4 justify-center">
          <button
            onClick={saveChanges}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="flex items-center gap-2 px-8 py-4 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="h-5 w-5" />
            Refresh
          </button>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Admin Panel Instructions</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Click on the visibility button to show or hide calculators from users</li>
            <li>• Use the up/down arrows to change the display order of calculators</li>
            <li>• Click "Save Changes" to apply your modifications to the database</li>
            <li>• Hidden calculators will not appear in the main navigation or home page</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
