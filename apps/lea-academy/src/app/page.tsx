import Navigation from '../components/Navigation';
import Hero from '../components/Hero';
import { ServiceGrid, type Service } from '../components/ServiceCard';
import { LEAHeader, LEAFooter } from '@leas-academy/ui';

// Sample services data
const featuredServices: Service[] = [
  {
    id: 'dermal-fillers',
    title: 'Advanced Dermal Fillers',
    description: 'Master the art of facial contouring and volume restoration with our comprehensive dermal filler training program.',
    duration: '2 days',
    price: 'From £1,200',
    category: 'course',
    featured: true,
    bookingUrl: '/courses/dermal-fillers'
  },
  {
    id: 'botulinum-toxin',
    title: 'Botulinum Toxin Training',
    description: 'Learn safe and effective botulinum toxin injection techniques for facial rejuvenation and medical applications.',
    duration: '1 day',
    price: 'From £850',
    category: 'course',
    featured: true,
    bookingUrl: '/courses/botulinum-toxin'
  },
  {
    id: 'aesthetic-consultation',
    title: 'Aesthetic Consultation',
    description: 'Professional consultation to assess your aesthetic goals and create a personalized treatment plan.',
    duration: '60 mins',
    price: '£150',
    category: 'consultation',
    bookingUrl: '/book-consultation'
  },
  {
    id: 'pdp-threads',
    title: 'PDO Thread Training',
    description: 'Comprehensive training in PDO thread lift techniques for non-surgical facial lifting and contouring.',
    duration: '1 day',
    price: 'From £950',
    category: 'course',
    bookingUrl: '/courses/pdo-threads'
  },
  {
    id: 'chemical-peels',
    title: 'Chemical Peel Treatments',
    description: 'Professional chemical peel treatments for skin rejuvenation and texture improvement.',
    duration: '45 mins',
    price: 'From £120',
    category: 'treatment',
    bookingUrl: '/book-treatment/chemical-peels'
  },
  {
    id: 'microneedling',
    title: 'Microneedling Therapy',
    description: 'Advanced microneedling treatments for skin regeneration and scar reduction.',
    duration: '60 mins',
    price: 'From £200',
    category: 'treatment',
    bookingUrl: '/book-treatment/microneedling'
  }
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <Hero />
      
      {/* Featured Services Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-serif text-4xl font-semibold text-primary mb-4">
              Our Signature Services
            </h2>
            <p className="text-sans text-lg text-secondary max-w-3xl mx-auto">
              From advanced training courses to premium aesthetic treatments, 
              discover the comprehensive range of services that define excellence in medical aesthetics.
            </p>
          </div>
          
          <ServiceGrid 
            services={featuredServices}
            columns={3}
            showFilters={true}
          />
        </div>
      </section>
      
      {/* Why Choose LEA Section */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-serif text-4xl font-semibold text-primary mb-4">
              Why Choose LEA Aesthetics Academy
            </h2>
            <p className="text-sans text-lg text-secondary max-w-3xl mx-auto">
              We combine clinical excellence with educational authority to deliver 
              unparalleled training and treatment experiences.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-serif text-xl font-semibold text-primary mb-3">
                Clinical Excellence
              </h3>
              <p className="text-sans text-secondary leading-relaxed">
                Our training programs are developed by leading practitioners with decades 
                of experience in medical aesthetics and clinical practice.
              </p>
            </div>
            
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-serif text-xl font-semibold text-primary mb-3">
                Educational Authority
              </h3>
              <p className="text-sans text-secondary leading-relaxed">
                Comprehensive curriculum backed by scientific research and regulatory compliance, 
                ensuring you receive the highest quality education.
              </p>
            </div>
            
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-serif text-xl font-semibold text-primary mb-3">
                Professional Community
              </h3>
              <p className="text-sans text-secondary leading-relaxed">
                Join an exclusive network of practitioners committed to advancing 
                the art and science of medical aesthetics through continuous learning.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call-to-Action Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-serif text-4xl font-semibold text-primary mb-6">
            Ready to Advance Your Practice?
          </h2>
          <p className="text-sans text-lg text-secondary mb-8">
            Whether you're seeking advanced training or premium aesthetic treatments, 
            our expert team is here to guide your journey to excellence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/courses" className="btn-primary text-lg px-8 py-4">
              Explore Training Courses
            </a>
            <a href="/book-consultation" className="btn-secondary text-lg px-8 py-4">
              Book Consultation
            </a>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <h3 className="text-serif text-2xl font-semibold mb-4">
                LEA Aesthetics Clinical Academy
              </h3>
              <p className="text-sm leading-relaxed mb-4 opacity-90">
                Where clinical precision meets artistic vision. Join our exclusive community 
                of practitioners dedicated to advancing the art and science of medical aesthetics.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="opacity-80 hover:opacity-100 transition-opacity">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="opacity-80 hover:opacity-100 transition-opacity">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="opacity-80 hover:opacity-100 transition-opacity">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-serif text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/courses" className="opacity-90 hover:opacity-100 transition-opacity">Training Courses</a></li>
                <li><a href="/services" className="opacity-90 hover:opacity-100 transition-opacity">Treatment Services</a></li>
                <li><a href="/about" className="opacity-90 hover:opacity-100 transition-opacity">About Us</a></li>
                <li><a href="/contact" className="opacity-90 hover:opacity-100 transition-opacity">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-serif text-lg font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-sm opacity-90">
                <p>London, United Kingdom</p>
                <p>Phone: +44 20 7123 4567</p>
                <p>Email: info@lea-aesthetics.co.uk</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-12 pt-8 text-center text-sm opacity-80">
            <p>&copy; 2025 LEA Aesthetics Clinical Academy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
