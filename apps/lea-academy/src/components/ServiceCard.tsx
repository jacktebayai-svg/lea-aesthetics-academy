'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface Service {
  id: string;
  title: string;
  description: string;
  duration?: string;
  price?: string;
  image?: string;
  category: 'treatment' | 'course' | 'consultation';
  featured?: boolean;
  bookingUrl?: string;
}

interface ServiceCardProps {
  service: Service;
  className?: string;
  showPrice?: boolean;
  showDuration?: boolean;
  variant?: 'default' | 'featured' | 'compact';
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  className = '',
  showPrice = true,
  showDuration = true,
  variant = 'default'
}) => {
  const cardClasses = `
    service-card group cursor-pointer
    ${variant === 'featured' ? 'ring-2 ring-primary' : ''}
    ${variant === 'compact' ? 'p-4' : 'p-6'}
    ${className}
  `.trim();

  const getCategoryColor = (category: Service['category']) => {
    switch (category) {
      case 'treatment':
        return 'bg-primary text-white';
      case 'course':
        return 'bg-border text-primary';
      case 'consultation':
        return 'bg-surface text-secondary';
      default:
        return 'bg-surface text-secondary';
    }
  };

  const getCategoryLabel = (category: Service['category']) => {
    switch (category) {
      case 'treatment':
        return 'Treatment';
      case 'course':
        return 'Course';
      case 'consultation':
        return 'Consultation';
      default:
        return 'Service';
    }
  };

  return (
    <div className={cardClasses}>
      {/* Image */}
      {service.image && (
        <div className="relative mb-4 overflow-hidden rounded-lg">
          <Image
            src={service.image}
            alt={service.title}
            width={400}
            height={240}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {service.featured && (
            <div className="absolute top-3 right-3 bg-primary text-white text-xs font-medium px-3 py-1 rounded-full">
              Featured
            </div>
          )}
        </div>
      )}

      {/* Category Badge */}
      <div className="mb-3">
        <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${getCategoryColor(service.category)}`}>
          {getCategoryLabel(service.category)}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1">
        {/* Title */}
        <h3 className="text-serif text-xl font-semibold text-primary mb-2 group-hover:text-secondary transition-colors">
          {service.title}
        </h3>

        {/* Description */}
        <p className="text-sans text-secondary text-sm leading-relaxed mb-4">
          {service.description}
        </p>

        {/* Duration and Price */}
        <div className="flex justify-between items-center mb-4 text-sm">
          <div className="flex space-x-4">
            {showDuration && service.duration && (
              <div className="flex items-center text-secondary">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{service.duration}</span>
              </div>
            )}
          </div>
          
          {showPrice && service.price && (
            <div className="text-serif text-lg font-semibold text-primary">
              {service.price}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-auto">
          {service.bookingUrl ? (
            <Link 
              href={service.bookingUrl}
              className="btn-primary w-full text-center"
            >
              {service.category === 'course' ? 'Enroll Now' : 'Book Now'}
            </Link>
          ) : (
            <Link 
              href={`/services/${service.id}`}
              className="btn-secondary w-full text-center"
            >
              Learn More
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

// Grid container for service cards
interface ServiceGridProps {
  services: Service[];
  className?: string;
  columns?: 1 | 2 | 3 | 4;
  showFilters?: boolean;
}

export const ServiceGrid: React.FC<ServiceGridProps> = ({
  services,
  className = '',
  columns = 3,
  showFilters = false
}) => {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(service => service.category === selectedCategory);

  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  const categories = [
    { key: 'all', label: 'All Services' },
    { key: 'treatment', label: 'Treatments' },
    { key: 'course', label: 'Courses' },
    { key: 'consultation', label: 'Consultations' }
  ];

  return (
    <div className={className}>
      {/* Filters */}
      {showFilters && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.key
                    ? 'bg-primary text-white'
                    : 'bg-surface text-secondary hover:bg-border'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      <div className={`grid ${gridClasses[columns]} gap-6`}>
        {filteredServices.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
          />
        ))}
      </div>
    </div>
  );
};

export default ServiceCard;
