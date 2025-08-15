'use client';

import React from 'react';
import Link from 'next/link';

interface HeroProps {
  title?: string;
  subtitle?: string;
  description?: string;
  primaryCTA?: {
    text: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
  };
  backgroundImage?: string;
}

export const Hero: React.FC<HeroProps> = ({
  title = "Master the Art of Aesthetic Excellence",
  subtitle = "LEA Aesthetics Clinical Academy",
  description = "Where clinical precision meets artistic vision. Join our exclusive community of practitioners dedicated to advancing the art and science of medical aesthetics.",
  primaryCTA = { text: "Book Consultation", href: "/book-appointment" },
  secondaryCTA = { text: "Explore Courses", href: "/courses" },
  backgroundImage
}) => {
  return (
    <section className="hero-section relative overflow-hidden">
      {/* Background Image Overlay */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-20 lg:py-32">
          {/* Subtitle */}
          <p className="text-sans text-sm md:text-base text-secondary font-medium tracking-wide uppercase mb-4">
            {subtitle}
          </p>
          
          {/* Main Title */}
          <h1 className="text-serif text-4xl md:text-6xl lg:text-7xl font-semibold text-primary mb-6 leading-tight">
            {title}
          </h1>
          
          {/* Description */}
          <p className="text-sans text-lg md:text-xl text-secondary max-w-3xl mx-auto mb-10 leading-relaxed">
            {description}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href={primaryCTA.href}
              className="btn-primary text-lg px-8 py-4 min-w-[200px] text-center"
            >
              {primaryCTA.text}
            </Link>
            <Link 
              href={secondaryCTA.href}
              className="btn-secondary text-lg px-8 py-4 min-w-[200px] text-center"
            >
              {secondaryCTA.text}
            </Link>
          </div>
        </div>
        
        {/* Trust Indicators */}
        <div className="pb-16 lg:pb-20">
          <div className="text-center">
            <p className="text-sans text-sm text-secondary font-medium mb-8">
              Trusted by leading practitioners across the UK
            </p>
            
            <div className="flex flex-col md:flex-row justify-center items-center space-y-6 md:space-y-0 md:space-x-12">
              <div className="flex flex-col items-center">
                <span className="text-serif text-3xl font-semibold text-primary">500+</span>
                <span className="text-sans text-sm text-secondary">Certified Practitioners</span>
              </div>
              
              <div className="flex flex-col items-center">
                <span className="text-serif text-3xl font-semibold text-primary">15+</span>
                <span className="text-sans text-sm text-secondary">Years of Excellence</span>
              </div>
              
              <div className="flex flex-col items-center">
                <span className="text-serif text-3xl font-semibold text-primary">98%</span>
                <span className="text-sans text-sm text-secondary">Client Satisfaction</span>
              </div>
              
              <div className="flex flex-col items-center">
                <span className="text-serif text-3xl font-semibold text-primary">50+</span>
                <span className="text-sans text-sm text-secondary">Advanced Courses</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
