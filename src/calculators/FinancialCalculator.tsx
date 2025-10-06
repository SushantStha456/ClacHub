import { useState } from 'react';
import { DollarSign, TrendingUp, PiggyBank, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabase';

type CalculatorType = 'loan' | 'investment' | 'compound';

export default function FinancialCalculator() {
  const [calculatorType, setCalculatorType] = useState<CalculatorType>('loan');
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [time, setTime] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [result, setResult] = useState<{
    monthlyPayment?: number;
    totalPayment?: number;
    totalInterest?: number;
    futureValue?: number;
    totalReturn?: number;
  } | null>(null);

  const calculateLoan = async () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100 / 12;
    const n = parseFloat(time) * 12;

    if (!p || !r || !n || p <= 0 || rate <= 0 || n <= 0) {
      alert('Please enter valid values');
      return;
    }

    const monthly = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = monthly * n;
    const interest = total - p;

    const calculationResult = {
      monthlyPayment: parseFloat(monthly.toFixed(2)),
      totalPayment: parseFloat(total.toFixed(2)),
      totalInterest: parseFloat(interest.toFixed(2)),
    };

    setResult(calculationResult);

    await supabase.from('calculator_history').insert({
      calculator_type: 'financial',
      input_data: { type: 'loan', principal: p, rate, time },
      result_data: calculationResult,
    });
  };

  const calculateInvestment = async () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100;
    const t = parseFloat(time);
    const pmt = parseFloat(monthlyPayment);

    if (!p || !r || !t || p < 0 || rate <= 0 || t <= 0) {
      alert('Please enter valid values');
      return;
    }

    const monthlyRate = r / 12;
    const months = t * 12;

    let futureValue = p * Math.pow(1 + monthlyRate, months);

    if (pmt > 0) {
      futureValue +=
        pmt * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    }

    const totalContributions = p + pmt * months;
    const totalReturn = futureValue - totalContributions;

    const calculationResult = {
      futureValue: parseFloat(futureValue.toFixed(2)),
      totalReturn: parseFloat(totalReturn.toFixed(2)),
    };

    setResult(calculationResult);

    await supabase.from('calculator_history').insert({
      calculator_type: 'financial',
      input_data: { type: 'investment', principal: p, rate, time: t, monthlyPayment: pmt },
      result_data: calculationResult,
    });
  };

  const calculateCompound = async () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100;
    const t = parseFloat(time);

    if (!p || !r || !t || p <= 0 || rate <= 0 || t <= 0) {
      alert('Please enter valid values');
      return;
    }

    const futureValue = p * Math.pow(1 + r, t);
    const totalReturn = futureValue - p;

    const calculationResult = {
      futureValue: parseFloat(futureValue.toFixed(2)),
      totalReturn: parseFloat(totalReturn.toFixed(2)),
    };

    setResult(calculationResult);

    await supabase.from('calculator_history').insert({
      calculator_type: 'financial',
      input_data: { type: 'compound', principal: p, rate, time: t },
      result_data: calculationResult,
    });
  };

  const handleCalculate = () => {
    if (calculatorType === 'loan') {
      calculateLoan();
    } else if (calculatorType === 'investment') {
      calculateInvestment();
    } else {
      calculateCompound();
    }
  };

  const resetForm = () => {
    setPrincipal('');
    setRate('');
    setTime('');
    setMonthlyPayment('');
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
            <DollarSign className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Financial Calculator
          </h1>
          <p className="text-lg text-gray-600">
            Calculate loans, investments, and compound interest
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Calculator Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => {
                  setCalculatorType('loan');
                  resetForm();
                }}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  calculatorType === 'loan'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <CreditCard className="h-5 w-5" />
                Loan
              </button>
              <button
                onClick={() => {
                  setCalculatorType('investment');
                  resetForm();
                }}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  calculatorType === 'investment'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <TrendingUp className="h-5 w-5" />
                Investment
              </button>
              <button
                onClick={() => {
                  setCalculatorType('compound');
                  resetForm();
                }}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  calculatorType === 'compound'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <PiggyBank className="h-5 w-5" />
                Compound
              </button>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {calculatorType === 'loan' ? 'Loan Amount ($)' : 'Initial Amount ($)'}
              </label>
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                placeholder="e.g., 10000"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {calculatorType === 'loan' ? 'Annual Interest Rate (%)' : 'Annual Return Rate (%)'}
              </label>
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="e.g., 5.5"
                step="0.1"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Time Period (Years)
              </label>
              <input
                type="number"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g., 10"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
              />
            </div>

            {calculatorType === 'investment' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Monthly Contribution ($) - Optional
                </label>
                <input
                  type="number"
                  value={monthlyPayment}
                  onChange={(e) => setMonthlyPayment(e.target.value)}
                  placeholder="e.g., 100"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                />
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleCalculate}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Calculate
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
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Results</h2>

            {calculatorType === 'loan' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg">
                  <span className="font-medium text-gray-700">Monthly Payment</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    ${result.monthlyPayment?.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                  <span className="font-medium text-gray-700">Total Payment</span>
                  <span className="text-xl font-bold text-gray-900">
                    ${result.totalPayment?.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-teal-50 rounded-lg">
                  <span className="font-medium text-gray-700">Total Interest</span>
                  <span className="text-xl font-bold text-gray-900">
                    ${result.totalInterest?.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {(calculatorType === 'investment' || calculatorType === 'compound') && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg">
                  <span className="font-medium text-gray-700">Future Value</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    ${result.futureValue?.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                  <span className="font-medium text-gray-700">Total Return</span>
                  <span className="text-xl font-bold text-gray-900">
                    ${result.totalReturn?.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
