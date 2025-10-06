import { Target, Users, Zap, Heart, Shield, Globe } from 'lucide-react';

export default function About() {
  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Get instant results with our optimized calculation algorithms',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is protected and never shared with third parties',
    },
    {
      icon: Globe,
      title: 'Accessible Anywhere',
      description: 'Use our calculators on any device, anytime, anywhere',
    },
  ];

  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      description:
        'To provide accessible, accurate, and user-friendly calculation tools that empower people to make informed decisions about their health, finances, and daily life.',
    },
    {
      icon: Users,
      title: 'Our Community',
      description:
        'Serving thousands of users worldwide who trust CalcHub for their everyday calculations. Join our growing community of smart decision-makers.',
    },
    {
      icon: Heart,
      title: 'Our Values',
      description:
        'We believe in simplicity, accuracy, and accessibility. Every feature we build is designed with you in mind, ensuring the best user experience possible.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            About{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              CalcHub
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your trusted partner for accurate calculations and smart decision-making
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 mb-4">
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
            What Makes Us Different
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex p-3 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 mb-4">
                    <Icon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Join Thousands of Happy Users</h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Start making smarter decisions today with our suite of powerful calculators
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-4">
              <div className="text-3xl font-bold">50K+</div>
              <div className="text-emerald-100">Calculations Daily</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-4">
              <div className="text-3xl font-bold">15K+</div>
              <div className="text-emerald-100">Active Users</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-4">
              <div className="text-3xl font-bold">99.9%</div>
              <div className="text-emerald-100">Accuracy Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
