import React from 'react';
import { BookOpen, Shield, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const Info = () => {
  const healthTopics = [
    {
      icon: Shield,
      title: 'Preventive Care',
      description: 'Learn about screenings, vaccinations, and health check-ups',
      topics: ['Annual Physical Exams', 'Cancer Screenings', 'Vaccination Schedules', 'Health Risk Assessments']
    },
    {
      icon: Users,
      title: 'Health for All Ages',
      description: 'Age-specific health information and guidance',
      topics: ['Child Health', 'Teen Wellness', 'Adult Health', 'Senior Care']
    },
    {
      icon: Clock,
      title: 'Healthy Habits',
      description: 'Daily practices for optimal health and wellness',
      topics: ['Sleep Hygiene', 'Stress Management', 'Healthy Eating', 'Regular Exercise']
    }
  ];

  const quickTips = [
    {
      icon: CheckCircle,
      title: 'Stay Hydrated',
      description: 'Drink at least 8 glasses of water daily to maintain proper hydration.',
      color: 'text-blue-600'
    },
    {
      icon: CheckCircle,
      title: 'Regular Exercise',
      description: 'Aim for 150 minutes of moderate exercise or 75 minutes of vigorous exercise weekly.',
      color: 'text-green-600'
    },
    {
      icon: CheckCircle,
      title: 'Quality Sleep',
      description: 'Adults should aim for 7-9 hours of quality sleep each night.',
      color: 'text-purple-600'
    },
    {
      icon: CheckCircle,
      title: 'Balanced Diet',
      description: 'Include a variety of fruits, vegetables, whole grains, and lean proteins.',
      color: 'text-orange-600'
    }
  ];

  const emergencyInfo = [
    {
      situation: 'Chest Pain',
      action: 'Call 911 immediately - could indicate heart attack',
      urgency: 'Emergency'
    },
    {
      situation: 'Severe Bleeding',
      action: 'Apply direct pressure and seek immediate medical attention',
      urgency: 'Emergency'
    },
    {
      situation: 'High Fever (>103°F)',
      action: 'Seek medical attention promptly, especially with other symptoms',
      urgency: 'Urgent'
    },
    {
      situation: 'Persistent Cough',
      action: 'Consult healthcare provider if lasting more than 2 weeks',
      urgency: 'Non-urgent'
    }
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Health Information Hub</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Access reliable, evidence-based health information to make informed decisions about your wellbeing.
          </p>
        </div>

        {/* Health Topics */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Essential Health Topics
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {healthTopics.map((topic, index) => {
              const Icon = topic.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <div className="flex items-center mb-4">
                    <Icon className="h-8 w-8 text-blue-600 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">{topic.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{topic.description}</p>
                  <ul className="space-y-2">
                    {topic.topics.map((item, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* Quick Health Tips */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Daily Health Tips
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickTips.map((tip, index) => {
              const Icon = tip.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <Icon className={`h-8 w-8 ${tip.color} mb-3`} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{tip.title}</h3>
                  <p className="text-gray-600 text-sm">{tip.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Emergency Information */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            When to Seek Medical Care
          </h2>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Situation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Urgency
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {emergencyInfo.map((info, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {info.situation}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{info.action}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          info.urgency === 'Emergency' 
                            ? 'bg-red-100 text-red-800' 
                            : info.urgency === 'Urgent'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {info.urgency}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Medical Disclaimer</h3>
              <p className="text-yellow-700">
                The information provided on this website is for educational purposes only and is not intended 
                to replace professional medical advice, diagnosis, or treatment. Always consult with a qualified 
                healthcare provider before making any changes to your health routine or if you have any concerns 
                about your health.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Info;