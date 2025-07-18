import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, User, MessageCircle } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      content: '1-800-CALMIFY',
      subtext: 'Monday - Friday, 9 AM - 6 PM EST'
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'support@calmify.com',
      subtext: 'We respond within 24 hours'
    },
    {
      icon: MapPin,
      title: 'Address',
      content: '123 Wellness Drive, Health City, HC 12345',
      subtext: 'Virtual consultations available'
    },
    {
      icon: Clock,
      title: 'Hours',
      content: 'Monday - Friday: 9 AM - 6 PM',
      subtext: 'Weekend emergency support available'
    }
  ];

  const frequentlyAsked = [
    {
      question: 'How do I schedule a consultation?',
      answer: 'You can schedule a consultation by filling out the contact form below or calling our support line. We offer both virtual and in-person consultations.'
    },
    {
      question: 'Are your services covered by insurance?',
      answer: 'We work with most major insurance providers. Please contact us with your insurance information to verify coverage.'
    },
    {
      question: 'What should I expect during my first visit?',
      answer: 'Your first visit will include a comprehensive health assessment, discussion of your goals, and development of a personalized wellness plan.'
    },
    {
      question: 'Do you provide emergency support?',
      answer: 'For mental health emergencies, please call 988 (Suicide & Crisis Lifeline) or visit your nearest emergency room. For non-emergency support, use our contact form.'
    }
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <MessageCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're here to support you on your wellness journey. Reach out with questions, 
            schedule a consultation, or learn more about our services.
          </p>
        </div>

        {/* Contact Information */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Get in Touch
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 text-center">
                  <Icon className="h-8 w-8 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{info.title}</h3>
                  <p className="text-gray-700 mb-1">{info.content}</p>
                  <p className="text-sm text-gray-500">{info.subtext}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Contact Form */}
        <section className="mb-16">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select a subject</option>
                    <option value="consultation">Schedule Consultation</option>
                    <option value="mental-health">Mental Health Support</option>
                    <option value="physical-health">Physical Health Inquiry</option>
                    <option value="general">General Question</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Please describe how we can help you..."
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <Send className="h-5 w-5 mr-2" />
                  Send Message
                </button>
              </form>
            </div>

            {/* Additional Information */}
            <div className="space-y-8">
              <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                <h3 className="text-xl font-semibold text-green-900 mb-4">
                  Need Immediate Support?
                </h3>
                <p className="text-green-700 mb-4">
                  If you're experiencing a mental health crisis, please don't wait for a response. 
                  Contact emergency services or these crisis hotlines immediately:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-green-700">
                    <Phone className="h-4 w-4 mr-2" />
                    <span className="font-semibold">988 - Suicide & Crisis Lifeline</span>
                  </div>
                  <div className="flex items-center text-green-700">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    <span className="font-semibold">Text HOME to 741741 - Crisis Text Line</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-xl font-semibold text-blue-900 mb-4">
                  What to Expect
                </h3>
                <ul className="space-y-2 text-blue-700">
                  <li className="flex items-start">
                    <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 mr-3" />
                    Response within 24 hours during business days
                  </li>
                  <li className="flex items-start">
                    <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 mr-3" />
                    Personalized response from our wellness team
                  </li>
                  <li className="flex items-start">
                    <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 mr-3" />
                    Follow-up support as needed
                  </li>
                  <li className="flex items-start">
                    <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 mr-3" />
                    Complete confidentiality and privacy
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {frequentlyAsked.map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Contact;