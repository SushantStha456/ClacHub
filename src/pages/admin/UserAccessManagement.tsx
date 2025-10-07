import { useState, useEffect } from 'react';
import { Shield, ShieldOff, Save, RefreshCw, Calculator as CalcIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  has_admin_panel_access: boolean;
  created_at: string;
}

interface Calculator {
  id: string;
  name: string;
  slug: string;
}

interface UserAccess {
  user_id: string;
  calculator_id: string;
  has_access: boolean;
}

export default function UserAccessManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [calculators, setCalculators] = useState<Calculator[]>([]);
  const [userAccess, setUserAccess] = useState<UserAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, calcsRes, accessRes] = await Promise.all([
        supabase.from('user_profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('calculators').select('id, name, slug').order('sort_order'),
        supabase.from('user_calculator_access').select('*'),
      ]);

      if (usersRes.error) throw usersRes.error;
      if (calcsRes.error) throw calcsRes.error;

      setUsers(usersRes.data || []);
      setCalculators(calcsRes.data || []);
      setUserAccess(accessRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage({ type: 'error', text: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminAccess = (userId: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, has_admin_panel_access: !user.has_admin_panel_access } : user
      )
    );
  };

  const toggleAdminRole = (userId: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? { ...user, is_admin: !user.is_admin, has_admin_panel_access: !user.is_admin || user.has_admin_panel_access }
          : user
      )
    );
  };

  const getUserCalculatorAccess = (userId: string, calculatorId: string): boolean => {
    const access = userAccess.find((a) => a.user_id === userId && a.calculator_id === calculatorId);
    return access?.has_access ?? true;
  };

  const toggleCalculatorAccess = (userId: string, calculatorId: string) => {
    const existingAccess = userAccess.find(
      (a) => a.user_id === userId && a.calculator_id === calculatorId
    );

    if (existingAccess) {
      setUserAccess((prev) =>
        prev.map((access) =>
          access.user_id === userId && access.calculator_id === calculatorId
            ? { ...access, has_access: !access.has_access }
            : access
        )
      );
    } else {
      setUserAccess((prev) => [
        ...prev,
        { user_id: userId, calculator_id: calculatorId, has_access: false },
      ]);
    }
  };

  const saveChanges = async () => {
    setSaving(true);
    setMessage(null);
    try {
      for (const user of users) {
        const { error: userError } = await supabase
          .from('user_profiles')
          .update({
            is_admin: user.is_admin,
            has_admin_panel_access: user.has_admin_panel_access,
          })
          .eq('id', user.id);

        if (userError) throw userError;
      }

      for (const access of userAccess) {
        const { error: accessError } = await supabase.from('user_calculator_access').upsert(
          {
            user_id: access.user_id,
            calculator_id: access.calculator_id,
            has_access: access.has_access,
          },
          { onConflict: 'user_id,calculator_id' }
        );

        if (accessError) throw accessError;
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">User Access Management</h2>
        <p className="text-gray-600">Manage user roles and calculator access permissions</p>
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

      {users.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <p className="text-gray-500">No users registered yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {users.map((user) => (
            <div key={user.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{user.full_name || 'Unnamed User'}</h3>
                    <p className="text-emerald-100 text-sm">{user.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleAdminRole(user.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        user.is_admin
                          ? 'bg-white text-emerald-600'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      {user.is_admin ? 'Admin' : 'User'}
                    </button>
                    <button
                      onClick={() => toggleAdminAccess(user.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                        user.has_admin_panel_access
                          ? 'bg-white text-emerald-600'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      {user.has_admin_panel_access ? (
                        <>
                          <Shield className="h-4 w-4" />
                          Admin Access
                        </>
                      ) : (
                        <>
                          <ShieldOff className="h-4 w-4" />
                          No Admin Access
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <CalcIcon className="h-4 w-4" />
                  Calculator Access
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {calculators.map((calc) => {
                    const hasAccess = getUserCalculatorAccess(user.id, calc.id);
                    return (
                      <button
                        key={calc.id}
                        onClick={() => toggleCalculatorAccess(user.id, calc.id)}
                        className={`p-3 rounded-lg text-left transition-all duration-200 ${
                          hasAccess
                            ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-700'
                            : 'bg-gray-100 border-2 border-gray-300 text-gray-500'
                        }`}
                      >
                        <div className="font-medium text-sm">{calc.name}</div>
                        <div className="text-xs mt-1">
                          {hasAccess ? 'Access Granted' : 'Access Denied'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-4 mt-6">
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
          onClick={fetchData}
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
