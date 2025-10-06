import { useState } from 'react';
import { Calendar, Cake, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AgeCalculator() {
  const [birthDate, setBirthDate] = useState('');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [result, setResult] = useState<{
    years: number;
    months: number;
    days: number;
    totalDays: number;
    totalHours: number;
    totalMinutes: number;
    nextBirthday: string;
  } | null>(null);

  const calculateAge = async () => {
    if (!birthDate) {
      alert('Please enter your birth date');
      return;
    }

    const birth = new Date(birthDate);
    const target = new Date(targetDate);

    if (birth > target) {
      alert('Birth date cannot be in the future');
      return;
    }

    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    const timeDiff = target.getTime() - birth.getTime();
    const totalDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const totalHours = Math.floor(timeDiff / (1000 * 60 * 60));
    const totalMinutes = Math.floor(timeDiff / (1000 * 60));

    const nextBirthdayYear =
      target.getMonth() > birth.getMonth() ||
      (target.getMonth() === birth.getMonth() && target.getDate() >= birth.getDate())
        ? target.getFullYear() + 1
        : target.getFullYear();

    const nextBirthday = new Date(nextBirthdayYear, birth.getMonth(), birth.getDate());
    const daysUntilBirthday = Math.ceil(
      (nextBirthday.getTime() - target.getTime()) / (1000 * 60 * 60 * 24)
    );

    const calculationResult = {
      years,
      months,
      days,
      totalDays,
      totalHours,
      totalMinutes,
      nextBirthday: `${daysUntilBirthday} days`,
    };

    setResult(calculationResult);

    await supabase.from('calculator_history').insert({
      calculator_type: 'age',
      input_data: { birthDate, targetDate },
      result_data: calculationResult,
    });
  };

  const resetForm = () => {
    setBirthDate('');
    setTargetDate(new Date().toISOString().split('T')[0]);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-lg">
            <Calendar className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Age Calculator</h1>
          <p className="text-lg text-gray-600">
            Calculate your exact age in years, months, days, and more
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date of Birth
              </label>
              <div className="relative">
                <Cake className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Calculate Age On
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={calculateAge}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Calculate Age
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Your Age</h2>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                <div className="text-4xl font-bold text-purple-600 mb-2">{result.years}</div>
                <div className="text-gray-700 font-medium">Years</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                <div className="text-4xl font-bold text-purple-600 mb-2">{result.months}</div>
                <div className="text-gray-700 font-medium">Months</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                <div className="text-4xl font-bold text-purple-600 mb-2">{result.days}</div>
                <div className="text-gray-700 font-medium">Days</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <span className="font-medium text-gray-700">Total Days</span>
                <span className="text-purple-600 font-bold text-lg">
                  {result.totalDays.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-pink-50 rounded-lg">
                <span className="font-medium text-gray-700">Total Hours</span>
                <span className="text-pink-600 font-bold text-lg">
                  {result.totalHours.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <span className="font-medium text-gray-700">Total Minutes</span>
                <span className="text-purple-600 font-bold text-lg">
                  {result.totalMinutes.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                <span className="font-medium text-gray-700">Next Birthday</span>
                <span className="text-purple-700 font-bold text-lg">{result.nextBirthday}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
