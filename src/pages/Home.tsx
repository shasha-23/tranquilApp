import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Brain, Activity, Shield, Users, Star } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Brain,
      title: 'Mental Wellness',
      description: 'Comprehensive mental health resources and support',
      link: '/mental-health',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Activity,
      title: 'Physical Health',
      description: 'Exercise routines, nutrition guides, and fitness tips',
      link: '/physical-health',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      icon: Shield,
      title: 'Health Information',
      description: 'Evidence-based health information and preventive care',
      link: '/info',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Wellness Enthusiast',
      content: 'Calmify has transformed my approach to health. The resources are comprehensive and easy to understand.',
      rating: 5
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Healthcare Professional',
      content: 'An excellent platform that provides reliable health information. I recommend it to my patients.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Mental Health Advocate',
      content: 'The mental health resources here are invaluable. Finally, a platform that truly understands wellness.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Heart className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
              Welcome to <span className="text-green-600">Calmify</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Your comprehensive platform for mental and physical wellness. Discover evidence-based resources, 
              expert guidance, and a supportive community on your journey to optimal health.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/mental-health"
              className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors shadow-lg"
            >
              Explore Mental Health
            </Link>
            <Link
              to="/physical-health"
              className="bg-white text-green-600 px-8 py-3 rounded-lg text-lg font-semibold border-2 border-green-600 hover:bg-green-50 transition-colors shadow-lg"
            >
              Physical Wellness
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comprehensive Health Solutions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our range of health and wellness resources designed to support your journey to optimal well-being.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={index}
                  to={feature.link}
                  className="group p-6 rounded-xl border border-gray-200 hover:border-green-300 transition-all duration-300 hover:shadow-lg"
                >
                  <div className={`inline-flex p-3 rounded-lg ${feature.bgColor} mb-4`}>
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">10,000+</div>
              <div className="text-gray-600">Happy Users</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Health Articles</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-3xl font-bold text-orange-600 mb-2">99%</div>
              <div className="text-gray-600">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-gray-600">
              Real stories from people who've transformed their health with Calmify
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-green-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Wellness Journey?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of people who are already living healthier, happier lives with Calmify.
          </p>
          <Link
            to="/contact"
            className="bg-white text-green-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;