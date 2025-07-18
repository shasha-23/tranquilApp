import React from 'react';
import { Activity, Apple, Dumbbell, Heart, Moon, Droplets, Timer, Target } from 'lucide-react';

const PhysicalHealth = () => {
  const fitnessCategories = [
    {
      icon: Dumbbell,
      title: 'Strength Training',
      description: 'Build muscle and improve bone density',
      benefits: ['Increased metabolism', 'Better posture', 'Injury prevention', 'Improved confidence'],
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      icon: Heart,
      title: 'Cardiovascular Health',
      description: 'Improve heart health and endurance',
      benefits: ['Lower blood pressure', 'Better circulation', 'Increased energy', 'Weight management'],
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Timer,
      title: 'Flexibility & Balance',
      description: 'Enhance mobility and prevent injuries',
      benefits: ['Better range of motion', 'Reduced stiffness', 'Improved coordination', 'Stress relief'],
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ];

  const nutritionTips = [
    {
      icon: Apple,
      title: 'Eat the Rainbow',
      description: 'Include colorful fruits and vegetables in every meal',
      details: 'Different colors provide different nutrients and antioxidants'
    },
    {
      icon: Droplets,
      title: 'Stay Hydrated',
      description: 'Drink water throughout the day, not just when thirsty',
      details: 'Aim for 8-10 glasses daily, more if you exercise or live in hot climates'
    },
    {
      icon: Target,
      title: 'Portion Control',
      description: 'Use smaller plates and be mindful of serving sizes',
      details: 'Fill half your plate with vegetables, quarter with protein, quarter with whole grains'
    },
    {
      icon: Moon,
      title: 'Regular Meal Times',
      description: 'Eat at consistent times to regulate metabolism',
      details: 'Don\'t skip meals, especially breakfast, to maintain energy levels'
    }
  ];

  const workoutPlans = [
    {
      level: 'Beginner',
      duration: '20-30 minutes',
      frequency: '3-4 times per week',
      exercises: [
        'Bodyweight squats (2 sets of 10)',
        'Push-ups or wall push-ups (2 sets of 8)',
        'Walking or light jogging (15 minutes)',
        'Basic stretching routine (5 minutes)'
      ]
    },
    {
      level: 'Intermediate',
      duration: '30-45 minutes',
      frequency: '4-5 times per week',
      exercises: [
        'Squats with weights (3 sets of 12)',
        'Push-ups (3 sets of 10)',
        'Planks (3 sets of 30 seconds)',
        'Cardio workout (20 minutes)',
        'Stretching routine (10 minutes)'
      ]
    },
    {
      level: 'Advanced',
      duration: '45-60 minutes',
      frequency: '5-6 times per week',
      exercises: [
        'Compound movements (deadlifts, squats)',
        'High-intensity interval training',
        'Advanced bodyweight exercises',
        'Specific sport training',
        'Recovery and mobility work'
      ]
    }
  ];

  const healthMetrics = [
    {
      metric: 'BMI',
      description: 'Body Mass Index',
      normalRange: '18.5 - 24.9',
      tips: 'Healthy weight range varies by individual'
    },
    {
      metric: 'Blood Pressure',
      description: 'Systolic/Diastolic',
      normalRange: '< 120/80 mmHg',
      tips: 'Regular monitoring is important'
    },
    {
      metric: 'Resting Heart Rate',
      description: 'Beats per minute',
      normalRange: '60-100 bpm',
      tips: 'Lower rates often indicate better fitness'
    },
    {
      metric: 'Sleep Duration',
      description: 'Hours per night',
      normalRange: '7-9 hours',
      tips: 'Quality matters as much as quantity'
    }
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Activity className="h-12 w-12 text-orange-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Physical Health & Wellness</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive resources for fitness, nutrition, and maintaining optimal physical health throughout your life.
          </p>
        </div>

        {/* Fitness Categories */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Types of Physical Activity
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {fitnessCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <div className={`inline-flex p-3 rounded-lg ${category.bgColor} mb-4`}>
                    <Icon className={`h-8 w-8 ${category.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.title}</h3>
                  <p className="text-gray-600 mb-4">{category.description}</p>
                  <ul className="space-y-2">
                    {category.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-700">
                        <div className={`h-2 w-2 rounded-full ${category.color.replace('text-', 'bg-')} mr-2`} />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* Nutrition Tips */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Nutrition Essentials
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {nutritionTips.map((tip, index) => {
              const Icon = tip.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <div className="flex items-center mb-4">
                    <Icon className="h-8 w-8 text-orange-600 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">{tip.title}</h3>
                  </div>
                  <p className="text-gray-700 mb-2">{tip.description}</p>
                  <p className="text-sm text-gray-600">{tip.details}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Workout Plans */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Fitness Programs by Level
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {workoutPlans.map((plan, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.level}</h3>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Duration: {plan.duration}</span>
                    <span>Frequency: {plan.frequency}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {plan.exercises.map((exercise, idx) => (
                    <div key={idx} className="flex items-start text-sm text-gray-700">
                      <Dumbbell className="h-4 w-4 text-orange-500 mr-2 mt-0.5" />
                      {exercise}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Health Metrics */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Key Health Metrics
          </h2>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Metric
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Normal Range
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tips
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {healthMetrics.map((metric, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{metric.metric}</div>
                        <div className="text-sm text-gray-500">{metric.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {metric.normalRange}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{metric.tips}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Exercise Safety */}
        <section className="bg-orange-50 border border-orange-200 rounded-xl p-8">
          <div className="text-center">
            <Activity className="h-12 w-12 text-orange-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-orange-900 mb-4">
              Exercise Safety Guidelines
            </h3>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-4">Before You Start</h4>
                <ul className="text-sm text-orange-700 space-y-2 text-left">
                  <li>• Consult your doctor before starting any new exercise program</li>
                  <li>• Start slowly and gradually increase intensity</li>
                  <li>• Choose activities you enjoy to maintain consistency</li>
                  <li>• Invest in proper equipment and footwear</li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-4">During Exercise</h4>
                <ul className="text-sm text-orange-700 space-y-2 text-left">
                  <li>• Stay hydrated before, during, and after exercise</li>
                  <li>• Listen to your body and rest when needed</li>
                  <li>• Use proper form to prevent injuries</li>
                  <li>• Stop if you feel pain, dizziness, or shortness of breath</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PhysicalHealth;