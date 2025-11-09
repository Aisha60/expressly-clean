import React from 'react';
import { ArrowRight, CheckCircle, MessageSquare, FileText, Activity, Users, BarChart, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Navigation Configuration
const navigation = {
  main: [
    { name: 'Features', href: '/features' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' }
  ]
};

// Header Component
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 
            className="text-2xl font-bold text-[#4651B5] cursor-pointer" 
            onClick={() => handleNavigation('/')}
          >
          Expressly
          </h1>
        </div>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navigation.main.map((item) => (
            <button
              key={item.name}
              className="text-gray-600 hover:text-[#4651B5] transition duration-300"
              onClick={() => handleNavigation(item.href)}
            >
              {item.name}
            </button>
          ))}
          <button 
            className="px-5 py-2 border border-[#4651B5] text-[#4651B5] font-semibold rounded hover:bg-gray-50 transition duration-300"
            onClick={() => handleNavigation('/login')}
          >
            Login
          </button>
          <button 
            className="px-5 py-2 bg-[#4651B5] text-white font-semibold rounded hover:bg-[#3a44a0] transition duration-300"
            onClick={() => handleNavigation('/signup')}
          >
            Sign Up
          </button>
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="focus:outline-none">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4">
          <div className="flex flex-col space-y-3">
            {navigation.main.map((item) => (
              <button
                key={item.name}
                className="text-gray-600 hover:text-[#4651B5] transition duration-300 text-left py-2"
                onClick={() => handleNavigation(item.href)}
              >
                {item.name}
              </button>
            ))}
            <button 
              className="w-full px-5 py-2 border border-[#4651B5] text-[#4651B5] font-semibold rounded hover:bg-gray-50 transition duration-300"
              onClick={() => handleNavigation('/login')}
            >
              Login
            </button>
            <button 
              className="w-full px-5 py-2 bg-[#4651B5] text-white font-semibold rounded hover:bg-[#3a44a0] transition duration-300"
              onClick={() => handleNavigation('/signup')}
            >
              Sign Up
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

// Hero Component
const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-[#4651B5] text-white py-20 md:py-32">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
          Unlock the Power of Your Communication
        </h1>
        <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8">
          Welcome to Expressly, the ultimate platform designed to enhance your communication across every medium.
        </p>
        <button 
          className="bg-white text-[#4651B5] py-3 px-8 rounded-full font-semibold text-lg hover:shadow-lg transform hover:-translate-y-1 transition duration-300"
          onClick={() => navigate('/signup')}
        >
          Get Started
        </button>
      </div>
    </section>
  );
};

// What We Do Component
const WhatWeDo = () => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-[#4651B5] mb-12 relative inline-block">
          What We Do
          <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-4 w-16 h-1 bg-[#4651B5]"></span>
        </h2>
        <div className="max-w-4xl mx-auto">
          <p className="text-lg mb-6">
            At Expressly, we provide an all-in-one platform designed to enhance your communication skills through innovative technology. From speech analysis to body language feedback, we offer custom solutions for individuals, teams, and organizations. Our AI-driven approach and personalized learning paths to help you improve.
          </p>
          <p className="text-lg">
            We are committed to helping you become the best communicator you can be, and we're excited to be a part of your growth.
          </p>
        </div>
      </div>
    </section>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl hover:-translate-y-2 transition duration-300">
      <div className="bg-[#4651B5]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-[#4651B5] mb-4">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

// Features Section Component
const Features = () => {
  const featuresList = [
    {
      icon: <MessageSquare size={30} className="text-[#4651B5]" />,
      title: "Speech Analysis",
      description: "Get detailed feedback on your speech patterns, tone, pace, and clarity to enhance your verbal communication skills."
    },
    {
      icon: <Users size={30} className="text-[#4651B5]" />,
      title: "Body Language Analysis",
      description: "Learn to improve your non-verbal communication with our advanced body posture and gesture analysis tools."
    },
    {
      icon: <FileText size={30} className="text-[#4651B5]" />,
      title: "Document Analysis",
      description: "Enhance your written communication with our powerful document analysis that provides suggestions for clarity and impact."
    },
    {
      icon: <MessageSquare size={30} className="text-[#4651B5]" />,
      title: "Converse Bot",
      description: "Practice your communication skills with our AI-powered conversation partner that provides real-time feedback."
    },
    {
      icon: <Users size={30} className="text-[#4651B5]" />,
      title: "Conversation Coach",
      description: "Get personalized coaching and strategies to improve your daily conversations and public speaking abilities."
    },
    {
      icon: <BarChart size={30} className="text-[#4651B5]" />,
      title: "Report Generation",
      description: "Track your progress with comprehensive reports that highlight improvements and areas for continued growth."
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[#4651B5] mb-12 relative inline-block">
            Features
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-4 w-16 h-1 bg-[#4651B5]"></span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresList.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title} 
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// How It Works Component
const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: "Sign Up",
      description: "Create your account and complete a brief assessment to establish your baseline communication skills."
    },
    {
      number: 2,
      title: "Practice & Learn",
      description: "Use our suite of tools to practice in a safe environment with real-time feedback and guidance."
    },
    {
      number: 3,
      title: "Track Progress",
      description: "Monitor your improvement over time with detailed analytics and personalized recommendations."
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[#4651B5] mb-12 relative inline-block">
            How It Works
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-4 w-16 h-1 bg-[#4651B5]"></span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto">Improving your communication is just three simple steps away</p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          {steps.map((step) => (
            <div key={step.number} className="bg-gray-50 rounded-lg p-8 relative max-w-xs flex-1 min-w-[250px]">
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-[#4651B5] text-white rounded-full flex items-center justify-center font-bold">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold text-[#4651B5] mt-4 mb-4">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Testimonial Card Component
const TestimonialCard = ({ quote, name, title }) => {
  // Get initials for avatar
  const initials = name.split(' ').map(word => word[0]).join('');
  
  return (
    <div className="bg-white/10 rounded-lg p-6 relative">
      <div className="text-4xl absolute top-2 left-4 opacity-30">"</div>
      <p className="italic text-white mb-6 relative z-10">{quote}</p>
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold mr-4">
          {initials}
        </div>
        <div>
          <h4 className="font-semibold text-white">{name}</h4>
          <p className="text-sm text-white/70">{title}</p>
        </div>
      </div>
    </div>
  );
};

// Testimonials Section Component
const Testimonials = () => {
  const testimonialsList = [
    {
      quote: "Expressly has completely transformed my public speaking abilities. I'm now confident when presenting to large groups and have received numerous compliments on my improved communication.",
      name: "John Doe",
      title: "Marketing Director"
    },
    {
      quote: "As someone who struggled with social anxiety, the conversational practice tools have been invaluable. I've seen a remarkable improvement in my day-to-day interactions.",
      name: "Sarah Miller",
      title: "Software Engineer"
    },
    {
      quote: "Our team's communication has improved dramatically since implementing Expressly. Our meetings are more productive and our client presentations have never been better.",
      name: "Robert Johnson",
      title: "Team Lead"
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-[#4651B5]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-12 relative inline-block">
            What Our Users Say
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-4 w-16 h-1 bg-white"></span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonialsList.map((testimonial, index) => (
            <TestimonialCard 
              key={index}
              quote={testimonial.quote}
              name={testimonial.name}
              title={testimonial.title}
            />
          ))}
        </div>
      </div>
    </section>
  );
};


// CTA Component
const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-24 bg-[#4651B5] text-white text-center">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Communication Skills?</h2>
        <p className="text-lg max-w-2xl mx-auto mb-8">
          Join thousands of individuals and organizations who have already improved their communication with Expressly.
        </p>
        <button 
          className="bg-white text-[#4651B5] py-3 px-8 rounded-full font-semibold text-lg hover:shadow-lg transform hover:-translate-y-1 transition duration-300 flex items-center mx-auto"
          onClick={() => navigate('/signup')}
        >
          Start Your Free Trial
          <ArrowRight size={20} className="ml-2" />
        </button>
      </div>
    </section>
  );
};

// Footer Component
const Footer = () => {
  const navigate = useNavigate();

  const footerLinks = {
    features: [
      { name: "Speech Analysis", href: "/features#speech" },
      { name: "Body Language Analysis", href: "/features#body-language" },
      { name: "Document Analysis", href: "/features#document" },
      { name: "Converse Bot", href: "/features#bot" },
      { name: "Conversation Coach", href: "/features#coach" }
    ],
    company: [
      { name: "About Us", href: "/about" },
      // { name: "Careers", href: "/careers" },
      // { name: "Blog", href: "/blog" },
      // { name: "Press", href: "/press" },
      // { name: "Partners", href: "/partners" }
    ],
    // resources: [
    //   { name: "Help Center", href: "/help" },
    //   { name: "Community", href: "/community" },
    //   { name: "Tutorials", href: "/tutorials" },
    //   { name: "Webinars", href: "/webinars" },
    //   { name: "API Documentation", href: "/api-docs" }
    // ],
    contact: [
      { name: "Email: info@expressly.com", href: "mailto:info@expressly.com" },
      { name: "Phone: +1 (555) 123-4567", href: "tel:+15551234567" },
      // { name: "123 Communication St, San Francisco, CA 94105", href: "https://maps.google.com" }
      ]
  };

  const socialLinks = [
    { name: "Facebook", href: "https://facebook.com/expressly", icon: "F" },
    { name: "Twitter", href: "https://twitter.com/expressly", icon: "T" },
    { name: "Instagram", href: "https://instagram.com/expressly", icon: "I" },
    { name: "LinkedIn", href: "https://linkedin.com/company/expressly", icon: "L" }
  ];

  const handleNavigation = (href) => {
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      window.open(href, '_blank');
    } else {
      navigate(href);
    }
  };

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-16">
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold mb-6 relative pb-4">
              Expressly
              <span className="absolute bottom-0 left-0 w-12 h-1 bg-[#4651B5]"></span>
            </h3>
            <p className="mb-6">
              Unlock the power of effective communication with our comprehensive platform designed to enhance your skills across every medium.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#4651B5] transition duration-300"
                  aria-label={link.name}
                >
                  {link.icon}
                    </a>
                  ))}
                </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-6 relative pb-4">
              Features
              <span className="absolute bottom-0 left-0 w-12 h-1 bg-[#4651B5]"></span>
            </h3>
            <ul className="space-y-3">
              {footerLinks.features.map((link, index) => (
                <li key={index}>
                  <button 
                    onClick={() => handleNavigation(link.href)}
                    className="text-gray-300 hover:text-white transition duration-300"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-6 relative pb-4">
              Company
              <span className="absolute bottom-0 left-0 w-12 h-1 bg-[#4651B5]"></span>
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                    <li key={index}>
                  <button 
                    onClick={() => handleNavigation(link.href)}
                    className="text-gray-300 hover:text-white transition duration-300"
                  >
                    {link.name}
                  </button>
                    </li>
                  ))}
                </ul>
            </div>
          
          <div>
            <h3 className="text-lg font-bold mb-6 relative pb-4">
              Contact
              <span className="absolute bottom-0 left-0 w-12 h-1 bg-[#4651B5]"></span>
            </h3>
            <ul className="space-y-3">
              {footerLinks.contact.map((link, index) => (
                <li key={index}>
                  <button 
                    onClick={() => handleNavigation(link.href)}
                    className="text-gray-300 hover:text-white transition duration-300 text-left"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 text-center text-gray-400 text-sm">
          <p>
            &copy; {new Date().getFullYear()} Expressly. All rights reserved. 
          </p>
        </div>
      </div>
    </footer>
  );
};

// Main App Component
const App = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <WhatWeDo />
        <Features />
        <Testimonials />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default App;