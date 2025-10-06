import { useState } from 'react';
import { PiggyBank, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

type InterestType = 'simple' | 'compound';

export default function InterestCalculator() {
  const [interestType, setInterestType] = useState<InterestType>('simple');
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [time, setTime] = useState('');
  const [compoundFrequency, setCompoundFrequency] = useState('12');
  const [result, setResult] = useState<{
    interest: number;
    totalAmount: number;
    yearlyBreakdown?: Array<{ year: number; interest: number; totalAmount: number }>;
  } | null>(null);

  const calculateInterest = async () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100;
    const t = parseFloat(time);

    if (!p || !r || !t || p <= 0 || rate <= 0 || t <= 0) {
      alert('Please enter valid values');
      return;
    }

    let interest: number;
    let totalAmount: number;
    let yearlyBreakdown: Array<{ year: number; interest: number; totalAmount: number }> = [];

    if (interestType === 'simple') {
      interest = p * r * t;
      totalAmount = p + interest;

      for (let year = 1; year <= Math.min(t, 10); year++) {
        const yearInterest = p * r * year;
        yearlyBreakdown.push({
          year,
          interest: parseFloat(yearInterest.toFixed(2)),
          totalAmount: parseFloat((p + yearInterest).toFixed(2)),
        });
      }
    } else {
      const n = parseFloat(compoundFrequency);
      totalAmount = p * Math.pow(1 + r / n, n * t);
      interest = totalAmount - p;

      for (let year = 1; year <= Math.min(t, 10); year++) {
        const yearAmount = p * Math.pow(1 + r / n, n * year);
        const yearInterest = yearAmount - p;
        yearlyBreakdown.push({
          year,
          interest: parseFloat(yearInterest.toFixed(2)),
          totalAmount: parseFloat(yearAmount.toFixed(2)),
        });
      }
    }

    const calculationResult = {
      interest: parseFloat(interest.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      yearlyBreakdown,
    };

    setResult(calculationResult);

    await supabase.from('calculator_history').insert({
      calculator_type: 'financial',
      input_data: {
        type: 'interest',
        interestType,
        principal: p,
        rate,
        time: t,
        compoundFrequency: interestType === 'compound' ? compoundFrequency : null,
      },
      result_data: { interest: calculationResult.interest, totalAmount: calculationResult.totalAmount },
    });
  };

  const resetForm = () => {
    setPrincipal('');
    setRate('');
    setTime('');
    setResult(null);
  };

  const frequencyOptions = [
    { value: '1', label: 'Annually' },
    { value: '2', label: 'Semi-Annually' },
    { value: '4', label: 'Quarterly' },
    { value: '12', label: 'Monthly' },
    { value: '365', label: 'Daily' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
            <PiggyBank className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Interest Calculator
          </h1>
          <p className="text-lg text-gray-600">
            Calculate simple and compound interest on your investments
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Interest Type
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setInterestType('simple')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  interestType === 'simple'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Simple Interest
              </button>
              <button
                onClick={() => setInterestType('compound')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  interestType === 'compound'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Compound Interest
              </button>
            </div>
          </div>

          <div className="space-y-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Principal Amount ($)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  placeholder="e.g., 10000"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Interest Rate (% per annum)
              </label>
              <div className="relative">
                <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="e.g., 7.5"
                  step="0.1"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Time Period (Years)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="e.g., 5"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                />
              </div>
            </div>

            {interestType === 'compound' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Compounding Frequency
                </label>
                <select
                  value={compoundFrequency}
                  onChange={(e) => setCompoundFrequency(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                >
                  {frequencyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={calculateInterest}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Calculate Interest
            </button>
            <button
              onClick={resetForm}
              className="px-6 py-4 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200"
            >
              Reset
            </button>
          </div>
        </div>

        {result && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Results</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="text-center p-6 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl">
                  <div className="text-sm font-medium text-gray-600 mb-2">Total Interest</div>
                  <div className="text-4xl font-bold text-emerald-600">
                    ${result.interest.toLocaleString()}
                  </div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl">
                  <div className="text-sm font-medium text-gray-600 mb-2">Total Amount</div>
                  <div className="text-4xl font-bold text-emerald-600">
                    ${result.totalAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Interest Type</span>
                  <span className="text-emerald-600 font-semibold capitalize">
                    {interestType} Interest
                  </span>
                </div>
              </div>
            </div>

            {result.yearlyBreakdown && result.yearlyBreakdown.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Year-by-Year Breakdown
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Year</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">
                          Interest Earned
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">
                          Total Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.yearlyBreakdown.map((row) => (
                        <tr key={row.year} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-700">{row.year}</td>
                          <td className="py-3 px-4 text-right text-emerald-600 font-medium">
                            ${row.interest.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-900 font-medium">
                            ${row.totalAmount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
