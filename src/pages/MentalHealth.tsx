import React from 'react';
import { Brain, Heart, Smile, Moon, Users, Phone, BookOpen, Headphones } from 'lucide-react';

const MentalHealth = () => {
  const mentalHealthTopics = [
    {
      icon: Brain,
      title: 'Understanding Mental Health',
      description: 'Learn about common mental health conditions and their symptoms',
      resources: ['Depression & Anxiety', 'Stress Management', 'Coping Strategies', 'Mental Health Myths']
    },
    {
      icon: Heart,
      title: 'Self-Care Practices',
      description: 'Daily practices to maintain and improve mental wellbeing',
      resources: ['Mindfulness Meditation', 'Journaling', 'Gratitude Practice', 'Breathing Exercises']
    },
    {
      icon: Users,
      title: 'Support Systems',
      description: 'Building and maintaining healthy relationships',
      resources: ['Family Support', 'Friend Networks', 'Professional Help', 'Support Groups']
    }
  ];

  const mentalHealthTips = [
    {
      icon: Smile,
      title: 'Practice Gratitude',
      description: 'Write down three things you\'re grateful for each day',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      icon: Moon,
      title: 'Prioritize Sleep',
      description: 'Maintain a consistent sleep schedule for better mental health',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      icon: Headphones,
      title: 'Take Mental Breaks',
      description: 'Step away from stressful situations and practice mindfulness',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: Users,
      title: 'Stay Connected',
      description: 'Maintain relationships with family and friends',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const crisisResources = [
    {
      name: 'National Suicide Prevention Lifeline',
      number: '988',
      description: '24/7 crisis support for suicidal thoughts',
      availability: '24/7'
    },
    {
      name: 'Crisis Text Line',
      number: 'Text HOME to 741741',
      description: 'Free, confidential crisis support via text',
      availability: '24/7'
    },
    {
      name: 'SAMHSA National Helpline',
      number: '1-800-662-4357',
      description: 'Treatment referral and information service',
      availability: '24/7'
    }
  ];

  const wellnessActivities = [
    {
      category: 'Mindfulness',
      activities: [
        'Daily meditation (10-20 minutes)',
        'Deep breathing exercises',
        'Progressive muscle relaxation',
        'Mindful walking'
      ]
    },
    {
      category: 'Physical Wellness',
      activities: [
        'Regular exercise routine',
        'Yoga or stretching',
        'Outdoor activities',
        'Dance or movement therapy'
      ]
    },
    {
      category: 'Creative Expression',
      activities: [
        'Art therapy or drawing',
        'Music therapy',
        'Creative writing',
        'Crafting or DIY projects'
      ]
    },
    {
      category: 'Social Connection',
      activities: [
        'Join support groups',
        'Volunteer in community',
        'Regular social activities',
        'Practice active listening'
      ]
    }
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Brain className="h-12 w-12 text-purple-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Mental Health Resources</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Supporting your mental wellbeing with evidence-based resources, tools, and professional guidance.
          </p>
        </div>

        {/* Mental Health Topics */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Mental Health Education
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {mentalHealthTopics.map((topic, index) => {
              const Icon = topic.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <div className="flex items-center mb-4">
                    <Icon className="h-8 w-8 text-purple-600 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">{topic.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{topic.description}</p>
                  <ul className="space-y-2">
                    {topic.resources.map((resource, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-700">
                        <BookOpen className="h-4 w-4 text-purple-500 mr-2" />
                        {resource}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* Mental Health Tips */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Daily Mental Wellness Tips
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mentalHealthTips.map((tip, index) => {
              const Icon = tip.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <div className={`inline-flex p-3 rounded-lg ${tip.bgColor} mb-4`}>
                    <Icon className={`h-6 w-6 ${tip.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{tip.title}</h3>
                  <p className="text-gray-600 text-sm">{tip.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Crisis Resources */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Crisis Support Resources
          </h2>
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-start">
              <Phone className="h-6 w-6 text-red-600 mr-3 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">Need Immediate Help?</h3>
                <p className="text-red-700">
                  If you're in crisis or having thoughts of self-harm, please reach out for help immediately. 
                  You're not alone, and help is available 24/7.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {crisisResources.map((resource, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.name}</h3>
                <div className="text-2xl font-bold text-red-600 mb-2">{resource.number}</div>
                <p className="text-gray-600 mb-2">{resource.description}</p>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  {resource.availability}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Wellness Activities */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Mental Wellness Activities
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {wellnessActivities.map((category, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{category.category}</h3>
                <ul className="space-y-3">
                  {category.activities.map((activity, idx) => (
                    <li key={idx} className="flex items-center text-gray-700">
                      <Heart className="h-4 w-4 text-purple-500 mr-3" />
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Professional Help */}
        <section className="bg-purple-50 border border-purple-200 rounded-xl p-8">
          <div className="text-center">
            <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-purple-900 mb-4">
              When to Seek Professional Help
            </h3>
            <p className="text-purple-700 mb-6 max-w-3xl mx-auto">
              Mental health professionals can provide personalized support and treatment. Consider reaching out if you're 
              experiencing persistent symptoms that interfere with daily life, work, or relationships.
            </p>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">Types of Mental Health Professionals</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Psychiatrists (medication management)</li>
                  <li>• Psychologists (therapy and assessment)</li>
                  <li>• Licensed therapists (counseling)</li>
                  <li>• Social workers (support services)</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">When to Seek Help</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Persistent sadness or anxiety</li>
                  <li>• Changes in sleep or appetite</li>
                  <li>• Difficulty concentrating</li>
                  <li>• Thoughts of self-harm</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MentalHealth;