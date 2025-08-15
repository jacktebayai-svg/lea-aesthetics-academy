import React from 'react';
import { cn } from './utils/cn';

interface LEALogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'compact' | 'icon';
  color?: 'dark' | 'light' | 'primary';
}

const sizeClasses = {
  sm: 'h-8',
  md: 'h-12',
  lg: 'h-16',
  xl: 'h-20'
};

const LEALogo: React.FC<LEALogoProps> = ({
  className,
  size = 'md',
  variant = 'full',
  color = 'dark'
}) => {
  const logoClasses = cn(
    'flex items-center',
    sizeClasses[size],
    className
  );

  const textColor = {
    dark: 'text-slate-900',
    light: 'text-white',
    primary: 'text-primary'
  }[color];

  const accentColor = {
    dark: 'text-accent',
    light: 'text-accent-light',
    primary: 'text-accent'
  }[color];

  if (variant === 'icon') {
    return (
      <div className={logoClasses}>
        <div className={cn('relative', sizeClasses[size])}>
          {/* Elegant medical cross with aesthetic flourish */}
          <svg
            viewBox="0 0 48 48"
            fill="none"
            className={cn('w-full h-full', textColor)}
          >
            {/* Main cross */}
            <path
              d="M24 8V40M16 24H32"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Aesthetic flourishes */}
            <circle
              cx="24"
              cy="24"
              r="18"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.3"
            />
            <circle
              cx="24"
              cy="24"
              r="12"
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.5"
            />
            {/* LEA initials integrated */}
            <text
              x="24"
              y="28"
              textAnchor="middle"
              className="text-[6px] font-serif font-semibold"
              fill="currentColor"
            >
              LEA
            </text>
          </svg>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={logoClasses}>
        <div className="flex items-center space-x-2">
          {/* Icon */}
          <div className={cn('relative', sizeClasses[size])}>
            <svg
              viewBox="0 0 48 48"
              fill="none"
              className={cn('w-full h-full', accentColor)}
            >
              <path
                d="M24 8V40M16 24H32"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="24"
                cy="24"
                r="18"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.3"
              />
            </svg>
          </div>
          {/* Compact Text */}
          <div className="flex flex-col">
            <span className={cn('font-serif font-bold text-lg leading-none', textColor)}>
              LEA
            </span>
            <span className={cn('font-sans text-xs uppercase tracking-wide opacity-70', textColor)}>
              Academy
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Full logo
  return (
    <div className={logoClasses}>
      <div className="flex items-center space-x-3">
        {/* Icon */}
        <div className={cn('relative', sizeClasses[size])}>
          <svg
            viewBox="0 0 48 48"
            fill="none"
            className={cn('w-full h-full', accentColor)}
          >
            <path
              d="M24 8V40M16 24H32"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="24"
              cy="24"
              r="18"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.3"
            />
            <circle
              cx="24"
              cy="24"
              r="12"
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.5"
            />
          </svg>
        </div>
        {/* Full Text */}
        <div className="flex flex-col">
          <h1 className={cn(
            'font-serif font-bold leading-none',
            size === 'xl' ? 'text-3xl' : size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-xl' : 'text-lg',
            textColor
          )}>
            LEA Aesthetics
          </h1>
          <p className={cn(
            'font-sans uppercase tracking-wider opacity-80 leading-none',
            size === 'xl' ? 'text-sm' : size === 'lg' ? 'text-xs' : 'text-xs',
            textColor
          )}>
            Clinical Academy
          </p>
        </div>
      </div>
    </div>
  );
};

export default LEALogo;
