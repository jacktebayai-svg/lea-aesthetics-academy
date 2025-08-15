import React from 'react';
import { cn } from '../utils/cn';

export interface NavigationProps extends React.HTMLAttributes<HTMLElement> {
  brand?: React.ReactNode;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const Navigation = React.forwardRef<HTMLElement, NavigationProps>(
  ({ className, brand, children, variant = 'primary', ...props }, ref) => {
    return (
      <nav
        ref={ref}
        className={cn(
          'w-full border-b transition-all duration-300 ease-lea',
          variant === 'primary' 
            ? 'bg-background-paper border-border shadow-subtle'
            : 'bg-elegant-silver border-silver-accent shadow-card',
          className
        )}
        {...props}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {brand && (
              <div className="flex-shrink-0 flex items-center">
                {brand}
              </div>
            )}
            <div className="flex items-center space-x-8">
              {children}
            </div>
          </div>
        </div>
      </nav>
    );
  }
);

Navigation.displayName = 'Navigation';

// Navigation Link Component
export interface NavLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  active?: boolean;
  children: React.ReactNode;
}

const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, active, children, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn(
          'px-3 py-2 rounded-button text-ui-md font-medium font-sans transition-all duration-300 ease-lea',
          active 
            ? 'text-deep-charcoal bg-elegant-silver shadow-subtle'
            : 'text-text-secondary hover:text-deep-charcoal hover:bg-elegant-silver hover:shadow-subtle',
          className
        )}
        {...props}
      >
        {children}
      </a>
    );
  }
);

NavLink.displayName = 'NavLink';

// Brand Logo Component
export interface BrandLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  title: string;
}

const BrandLogo = React.forwardRef<HTMLDivElement, BrandLogoProps>(
  ({ className, src, alt, title, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center space-x-3', className)}
        {...props}
      >
        {src && (
          <img 
            src={src} 
            alt={alt || title}
            className="h-10 w-auto"
          />
        )}
        <h1 className="font-serif text-heading-4 font-medium text-deep-charcoal">
          {title}
        </h1>
      </div>
    );
  }
);

BrandLogo.displayName = 'BrandLogo';

export { Navigation, NavLink, BrandLogo };
