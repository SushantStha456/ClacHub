import { useState } from 'react';
import { CreditCard, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function EMICalculator() {
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [loanTenure, setLoanTenure] = useState('');
  const [tenureType, setTenureType] = useState<'months' | 'years'>('years');
  const [result, setResult] = useState<{
    emi: number;
    totalAmount: number;
    totalInterest: number;
    breakdown: Array<{ month: number; principal: number; interest: number; balance: number }>;
  } | null>(null);

  const calculateEMI = async () => {
    const p = parseFloat(loanAmount);
    const r = parseFloat(interestRate) / 100 / 12;
    const n = tenureType === 'years' ? parseFloat(loanTenure) * 12 : parseFloat(loanTenure);

    if (!p || !r || !n || p <= 0 || r <= 0 || n <= 0) {
      alert('Please enter valid values');
      return;
    }

    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalAmount = emi * n;
    const totalInterest = totalAmount - p;

    const breakdown: Array<{ month: number; principal: number; interest: number; balance: number }> = [];
    let balance = p;

    for (let i = 1; i <= Math.min(n, 12); i++) {
      const interestPayment = balance * r;
      const principalPayment = emi - interestPayment;
      balance -= principalPayment;

      breakdown.push({
        month: i,
        principal: parseFloat(principalPayment.toFixed(2)),
        interest: parseFloat(interestPayment.toFixed(2)),
        balance: parseFloat(balance.toFixed(2)),
      });
    }

    const calculationResult = {
      emi: parseFloat(emi.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      totalInterest: parseFloat(totalInterest.toFixed(2)),
      breakdown,
    };

    setResult(calculationResult);

    await supabase.from('calculator_history').insert({
      calculator_type: 'financial',
      input_data: { type: 'emi', loanAmount: p, interestRate, loanTenure: n, tenureType },
      result_data: { emi: calculationResult.emi, totalAmount: calculationResult.totalAmount, totalInterest: calculationResult.totalInterest },
    });
  };

  const resetForm = () => {
    setLoanAmount('');
    setInterestRate('');
    setLoanTenure('');
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
            <CreditCard className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">EMI Calculator</h1>
          <p className="text-lg text-gray-600">
            Calculate your Equated Monthly Installment for loans
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="space-y-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Loan Amount ($)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  placeholder="e.g., 100000"
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
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  placeholder="e.g., 8.5"
                  step="0.1"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Loan Tenure
              </label>
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    value={loanTenure}
                    onChange={(e) => setLoanTenure(e.target.value)}
                    placeholder={tenureType === 'years' ? 'e.g., 20' : 'e.g., 240'}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTenureType('years')}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      tenureType === 'years'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Years
                  </button>
                  <button
                    onClick={() => setTenureType('months')}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      tenureType === 'months'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Months
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={calculateEMI}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Calculate EMI
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
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Your Monthly EMI
              </h2>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-40 h-40 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 mb-4">
                  <span className="text-5xl font-bold text-emerald-600">
                    ${result.emi.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                  <span className="font-medium text-gray-700">Total Amount Payable</span>
                  <span className="text-xl font-bold text-gray-900">
                    ${result.totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-teal-50 rounded-lg">
                  <span className="font-medium text-gray-700">Total Interest</span>
                  <span className="text-xl font-bold text-gray-900">
                    ${result.totalInterest.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Payment Breakdown (First 12 Months)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Month</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">
                        Principal
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">
                        Interest
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.breakdown.map((row) => (
                      <tr key={row.month} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-700">{row.month}</td>
                        <td className="py-3 px-4 text-right text-emerald-600 font-medium">
                          ${row.principal.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-orange-600 font-medium">
                          ${row.interest.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-900 font-medium">
                          ${row.balance.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
