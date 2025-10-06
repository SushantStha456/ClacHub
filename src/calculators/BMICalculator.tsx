import { useState } from 'react';
import { Activity, TrendingUp, Scale } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function BMICalculator() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [result, setResult] = useState<{
    bmi: number;
    category: string;
    color: string;
  } | null>(null);

  const calculateBMI = async () => {
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (!weightNum || !heightNum || weightNum <= 0 || heightNum <= 0) {
      alert('Please enter valid weight and height values');
      return;
    }

    let bmi: number;

    if (unit === 'metric') {
      const heightInMeters = heightNum / 100;
      bmi = weightNum / (heightInMeters * heightInMeters);
    } else {
      bmi = (weightNum / (heightNum * heightNum)) * 703;
    }

    let category: string;
    let color: string;

    if (bmi < 18.5) {
      category = 'Underweight';
      color = 'text-blue-600';
    } else if (bmi < 25) {
      category = 'Normal weight';
      color = 'text-emerald-600';
    } else if (bmi < 30) {
      category = 'Overweight';
      color = 'text-orange-600';
    } else {
      category = 'Obese';
      color = 'text-red-600';
    }

    const calculationResult = {
      bmi: parseFloat(bmi.toFixed(1)),
      category,
      color,
    };

    setResult(calculationResult);

    await supabase.from('calculator_history').insert({
      calculator_type: 'bmi',
      input_data: { weight: weightNum, height: heightNum, unit },
      result_data: calculationResult,
    });
  };

  const resetForm = () => {
    setWeight('');
    setHeight('');
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-4 shadow-lg">
            <Activity className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">BMI Calculator</h1>
          <p className="text-lg text-gray-600">
            Calculate your Body Mass Index and understand your health status
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Unit System</label>
            <div className="flex gap-4">
              <button
                onClick={() => setUnit('metric')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  unit === 'metric'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Metric (kg, cm)
              </button>
              <button
                onClick={() => setUnit('imperial')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  unit === 'imperial'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Imperial (lbs, in)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Weight {unit === 'metric' ? '(kg)' : '(lbs)'}
              </label>
              <div className="relative">
                <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder={unit === 'metric' ? 'e.g., 70' : 'e.g., 154'}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Height {unit === 'metric' ? '(cm)' : '(inches)'}
              </label>
              <div className="relative">
                <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder={unit === 'metric' ? 'e.g., 175' : 'e.g., 69'}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={calculateBMI}
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Calculate BMI
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Your Results</h2>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 mb-4">
                <span className="text-5xl font-bold text-gray-900">{result.bmi}</span>
              </div>
              <p className={`text-2xl font-bold ${result.color} mb-2`}>{result.category}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <span className="font-medium text-gray-700">Underweight</span>
                <span className="text-blue-600 font-semibold">&lt; 18.5</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                <span className="font-medium text-gray-700">Normal weight</span>
                <span className="text-emerald-600 font-semibold">18.5 - 24.9</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <span className="font-medium text-gray-700">Overweight</span>
                <span className="text-orange-600 font-semibold">25 - 29.9</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <span className="font-medium text-gray-700">Obese</span>
                <span className="text-red-600 font-semibold">&ge; 30</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
