import React from 'react';
import { cn } from './utils/cn';
import LEALogo from './LEALogo';

interface LEAFooterProps {
  className?: string;
  variant?: 'full' | 'minimal';
  showSocial?: boolean;
}

const LEAFooter: React.FC<LEAFooterProps> = ({
  className,
  variant = 'full',
  showSocial = true
}) => {
  const currentYear = new Date().getFullYear();

  if (variant === 'minimal') {
    return (
      <footer className={cn(
        'w-full py-6 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white',
        className
      )}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <LEALogo size="sm" variant="compact" color="light" />
            <p className="text-sm opacity-80">
              © {currentYear} LEA Aesthetics Clinical Academy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={cn(
      'w-full bg-slate-900 text-white py-16',
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-2">
            <LEALogo size="lg" variant="full" color="light" className="mb-4" />
            <p className="text-sm leading-relaxed mb-4 opacity-90 max-w-md">
              Where clinical precision meets artistic vision. Join our exclusive community 
              of practitioners dedicated to advancing the art and science of medical aesthetics.
            </p>
            {showSocial && (
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
                <a href="#" className="opacity-80 hover:opacity-100 transition-opacity">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.219-.359-1.219c0-1.142.662-1.995 1.488-1.995.219 0 .359.159.359.359 0 .219-.14.578-.219.897-.199.837.419 1.52 1.237 1.52 1.482 0 2.482-1.943 2.482-4.251 0-1.762-1.202-3.085-3.423-3.085-2.482 0-4.006 1.841-4.006 3.901 0 .718.219 1.219.578 1.578.219.199.219.318.159.558-.041.199-.159.638-.199.818-.059.318-.299.419-.578.318-1.021-.399-1.599-1.699-1.599-3.083 0-2.303 2.023-5.036 6.063-5.036 3.204 0 5.306 2.283 5.306 4.725 0 3.204-1.780 5.626-4.407 5.626-.897 0-1.719-.498-2.003-1.078l-.548 2.183c-.199.758-.738 1.697-1.123 2.275C9.026 23.396 10.477 23.838 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </a>
              </div>
            )}
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-serif font-semibold mb-4">Training & Education</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/courses" className="opacity-90 hover:opacity-100 transition-opacity">Training Courses</a></li>
              <li><a href="/certifications" className="opacity-90 hover:opacity-100 transition-opacity">Certifications</a></li>
              <li><a href="/student-portal" className="opacity-90 hover:opacity-100 transition-opacity">Student Portal</a></li>
              <li><a href="/resources" className="opacity-90 hover:opacity-100 transition-opacity">Learning Resources</a></li>
            </ul>
          </div>
          
          {/* Services & Contact */}
          <div>
            <h4 className="text-lg font-serif font-semibold mb-4">Services & Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/treatments" className="opacity-90 hover:opacity-100 transition-opacity">Clinical Treatments</a></li>
              <li><a href="/book-consultation" className="opacity-90 hover:opacity-100 transition-opacity">Book Consultation</a></li>
              <li><a href="/client-portal" className="opacity-90 hover:opacity-100 transition-opacity">Client Portal</a></li>
              <li><a href="/contact" className="opacity-90 hover:opacity-100 transition-opacity">Contact Support</a></li>
            </ul>
            
            <div className="mt-6 space-y-2 text-sm opacity-90">
              <p>London, United Kingdom</p>
              <p>Phone: +44 20 7123 4567</p>
              <p>Email: info@lea-aesthetics.co.uk</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-12 pt-8 text-center text-sm opacity-80">
          <p>© {currentYear} LEA Aesthetics Clinical Academy. All rights reserved. | Privacy Policy | Terms of Service</p>
        </div>
      </div>
    </footer>
  );
};

export default LEAFooter;
