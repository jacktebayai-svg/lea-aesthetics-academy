'use client';

import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import Link from 'next/link';

interface BaseButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

interface ButtonProps extends BaseButtonProps, ButtonHTMLAttributes<HTMLButtonElement> {
  href?: never;
}

interface LinkButtonProps extends BaseButtonProps {
  href: string;
  external?: boolean;
  onClick?: never;
  type?: never;
  disabled?: never;
}

type ButtonOrLinkProps = ButtonProps | LinkButtonProps;

const getButtonClasses = (
  variant: NonNullable<BaseButtonProps['variant']>,
  size: NonNullable<BaseButtonProps['size']>,
  loading: boolean,
  fullWidth: boolean,
  disabled: boolean,
  className: string
) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Size classes
  const sizeClasses = {
    sm: 'text-sm px-3 py-2 rounded-md',
    md: 'text-base px-4 py-2.5 rounded-lg',
    lg: 'text-lg px-6 py-3 rounded-lg',
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'btn-primary focus:ring-primary/20',
    secondary: 'btn-secondary focus:ring-primary/20',
    outline: 'bg-transparent border-2 border-border text-primary hover:bg-surface hover:border-primary focus:ring-primary/20',
    ghost: 'bg-transparent text-primary hover:bg-surface focus:ring-primary/20',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/20',
  };
  
  // Full width
  const widthClass = fullWidth ? 'w-full' : '';
  
  // Loading/disabled state
  const stateClass = (loading || disabled) ? 'cursor-not-allowed' : '';
  
  return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${stateClass} ${className}`.trim();
};

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonOrLinkProps>(
  ({
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    children,
    className = '',
    ...props
  }, ref) => {
    const buttonClasses = getButtonClasses(
      variant,
      size,
      loading,
      fullWidth,
      'disabled' in props ? props.disabled || false : false,
      className
    );

    const content = (
      <>
        {loading && (
          <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
        )}
        {!loading && leftIcon && (
          <span className="-ml-1 mr-2">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!loading && rightIcon && (
          <span className="ml-2 -mr-1">{rightIcon}</span>
        )}
      </>
    );

    // Link button
    if ('href' in props) {
      const { href, external, ...linkProps } = props;
      
      if (external || href.startsWith('http')) {
        return (
          <a
            ref={ref as React.ForwardedRef<HTMLAnchorElement>}
            href={href}
            className={buttonClasses}
            target="_blank"
            rel="noopener noreferrer"
            {...linkProps}
          >
            {content}
          </a>
        );
      }
      
      return (
        <Link
          ref={ref as React.ForwardedRef<HTMLAnchorElement>}
          href={href}
          className={buttonClasses}
          {...linkProps}
        >
          {content}
        </Link>
      );
    }

    // Regular button
    return (
      <button
        ref={ref as React.ForwardedRef<HTMLButtonElement>}
        className={buttonClasses}
        disabled={loading || props.disabled}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Convenience components for common button types
export const PrimaryButton: React.FC<Omit<ButtonOrLinkProps, 'variant'>> = (props) => (
  <Button variant="primary" {...props} />
);

export const SecondaryButton: React.FC<Omit<ButtonOrLinkProps, 'variant'>> = (props) => (
  <Button variant="secondary" {...props} />
);

export const OutlineButton: React.FC<Omit<ButtonOrLinkProps, 'variant'>> = (props) => (
  <Button variant="outline" {...props} />
);

export const GhostButton: React.FC<Omit<ButtonOrLinkProps, 'variant'>> = (props) => (
  <Button variant="ghost" {...props} />
);

export const DangerButton: React.FC<Omit<ButtonOrLinkProps, 'variant'>> = (props) => (
  <Button variant="danger" {...props} />
);

// Icon Button Component
interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost';
  'aria-label': string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(({
  icon,
  size = 'md',
  variant = 'ghost',
  className = '',
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };
  
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };
  
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary/90',
    secondary: 'bg-surface text-primary hover:bg-border',
    ghost: 'text-secondary hover:text-primary hover:bg-surface',
  };
  
  return (
    <button
      ref={ref}
      className={`
        inline-flex items-center justify-center rounded-full transition-colors
        focus:outline-none focus:ring-2 focus:ring-primary/20
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      <span className={iconSizes[size]}>{icon}</span>
    </button>
  );
});

IconButton.displayName = 'IconButton';

// Button Group Component
interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'tight' | 'normal' | 'loose';
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  className = '',
  orientation = 'horizontal',
  spacing = 'normal'
}) => {
  const orientationClasses = {
    horizontal: 'flex-row',
    vertical: 'flex-col',
  };
  
  const spacingClasses = {
    tight: orientation === 'horizontal' ? 'space-x-1' : 'space-y-1',
    normal: orientation === 'horizontal' ? 'space-x-2' : 'space-y-2',
    loose: orientation === 'horizontal' ? 'space-x-4' : 'space-y-4',
  };
  
  return (
    <div className={`flex ${orientationClasses[orientation]} ${spacingClasses[spacing]} ${className}`}>
      {children}
    </div>
  );
};
