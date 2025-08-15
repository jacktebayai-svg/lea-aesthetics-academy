import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';
import { Button } from './Button';
import { cn } from '../utils/cn';

export interface CourseCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  level: 'Level 2' | 'Level 3' | 'Level 4';
  duration?: string;
  modules?: number;
  enrolled?: boolean;
  progress?: number; // 0-100
  price?: number;
  image?: string;
  onEnroll?: () => void;
  onContinue?: () => void;
  onView?: () => void;
  currency?: string;
}

const CourseCard = React.forwardRef<HTMLDivElement, CourseCardProps>(
  ({ 
    className, 
    title, 
    description, 
    level, 
    duration, 
    modules, 
    enrolled, 
    progress = 0, 
    price, 
    image, 
    onEnroll, 
    onContinue, 
    onView,
    currency = 'GBP',
    ...props 
  }, ref) => {
    const formatPrice = (amount: number) => {
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: currency,
      }).format(amount / 100);
    };

    const getLevelColor = (level: string) => {
      switch (level) {
        case 'Level 2':
          return 'bg-info text-info-light';
        case 'Level 3':
          return 'bg-warning text-warning-light';
        case 'Level 4':
          return 'bg-success text-success-light';
        default:
          return 'bg-surface text-text-secondary';
      }
    };

    return (
      <Card
        ref={ref}
        variant="elegant"
        className={cn(
          'group transition-all duration-300 ease-lea hover:shadow-elevated hover:scale-[1.02]',
          enrolled && 'ring-2 ring-silver-accent ring-opacity-30',
          className
        )}
        {...props}
      >
        {/* Course Image */}
        {image && (
          <div className="relative h-48 w-full overflow-hidden rounded-t-card">
            <img 
              src={image} 
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 ease-lea group-hover:scale-105"
            />
            <div className="absolute top-4 left-4">
              <span className={cn(
                'px-3 py-1 rounded-button text-body-xs font-medium',
                getLevelColor(level)
              )}>
                {level}
              </span>
            </div>
            {enrolled && (
              <div className="absolute top-4 right-4">
                <span className="bg-success text-success-light px-2 py-1 rounded-button text-body-xs font-medium">
                  Enrolled
                </span>
              </div>
            )}
          </div>
        )}

        <CardHeader>
          {!image && (
            <div className="mb-2">
              <span className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-button text-body-xs font-medium',
                getLevelColor(level)
              )}>
                {level}
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
          {/* Course Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-body-sm text-text-secondary">
              {duration && (
                <div className="flex items-center space-x-1">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{duration}</span>
                </div>
              )}
              
              {modules && (
                <div className="flex items-center space-x-1">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>{modules} modules</span>
                </div>
              )}

              {price && !enrolled && (
                <div className="flex items-center space-x-1">
                  <span className="font-medium text-text-primary">
                    {formatPrice(price)}
                  </span>
                </div>
              )}
            </div>

            {/* Progress Bar (for enrolled courses) */}
            {enrolled && progress !== undefined && (
              <div className="space-y-1">
                <div className="flex justify-between text-body-xs text-text-secondary">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-surface-light rounded-full h-2">
                  <div 
                    className="bg-deep-charcoal h-2 rounded-full transition-all duration-300 ease-lea"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <div className="flex w-full space-x-2">
            {enrolled ? (
              <>
                {onView && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onView}
                    className="flex-1"
                  >
                    View Details
                  </Button>
                )}
                {onContinue && (
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={onContinue}
                    className="flex-1"
                  >
                    {progress > 0 ? 'Continue' : 'Start Course'}
                  </Button>
                )}
              </>
            ) : (
              <>
                {onView && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onView}
                    className="flex-1"
                  >
                    Learn More
                  </Button>
                )}
                {onEnroll && (
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={onEnroll}
                    className="flex-1"
                  >
                    Enroll Now
                  </Button>
                )}
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    );
  }
);

CourseCard.displayName = 'CourseCard';

export { CourseCard };
