import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';
import { Button } from './Button';
import { cn } from '../utils/cn';

export interface ServiceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  price?: number;
  duration?: number;
  image?: string;
  category?: string;
  featured?: boolean;
  onBook?: () => void;
  onLearnMore?: () => void;
  currency?: string;
}

const ServiceCard = React.forwardRef<HTMLDivElement, ServiceCardProps>(
  ({ 
    className, 
    title, 
    description, 
    price, 
    duration, 
    image, 
    category, 
    featured, 
    onBook, 
    onLearnMore,
    currency = 'GBP',
    ...props 
  }, ref) => {
    const formatPrice = (amount: number) => {
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: currency,
      }).format(amount / 100); // Assuming price is in pence
    };

    const formatDuration = (minutes: number) => {
      if (minutes < 60) return `${minutes}min`;
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
    };

    return (
      <Card
        ref={ref}
        variant={featured ? "elevated" : "elegant"}
        className={cn(
          'group cursor-pointer transition-all duration-300 ease-lea hover:scale-[1.02] hover:shadow-elevated',
          featured && 'ring-2 ring-silver-accent ring-opacity-50',
          className
        )}
        {...props}
      >
        {/* Service Image */}
        {image && (
          <div className="relative h-48 w-full overflow-hidden rounded-t-card">
            <img 
              src={image} 
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 ease-lea group-hover:scale-105"
            />
            {featured && (
              <div className="absolute top-4 right-4">
                <span className="bg-deep-charcoal text-pure-white px-2 py-1 rounded-button text-body-xs font-medium">
                  Featured
                </span>
              </div>
            )}
          </div>
        )}

        <CardHeader>
          {/* Category Badge */}
          {category && (
            <div className="mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-button text-body-xs font-medium bg-surface-light text-text-secondary">
                {category}
              </span>
            </div>
          )}

          <CardTitle className="group-hover:text-primary-600 transition-colors duration-300 ease-lea">
            {title}
          </CardTitle>
          
          <CardDescription className="mt-2">
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Service Details */}
          <div className="flex items-center justify-between text-body-sm text-text-secondary">
            {duration && (
              <div className="flex items-center space-x-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formatDuration(duration)}</span>
              </div>
            )}
            
            {price && (
              <div className="flex items-center space-x-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span className="font-medium text-text-primary">
                  {formatPrice(price)}
                </span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <div className="flex w-full space-x-2">
            {onLearnMore && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onLearnMore}
                className="flex-1"
              >
                Learn More
              </Button>
            )}
            {onBook && (
              <Button 
                variant="primary" 
                size="sm" 
                onClick={onBook}
                className="flex-1"
              >
                Book Now
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    );
  }
);

ServiceCard.displayName = 'ServiceCard';

export { ServiceCard };
