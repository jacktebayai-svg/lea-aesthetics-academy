import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../cn';

const buttonVariants = cva(
  // Base styles - Professional silver interactions
  "inline-flex items-center justify-center rounded-button font-sans font-medium transition-all duration-300 ease-lea focus:outline-none focus:ring-2 focus:ring-silver-accent/30 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        // Primary - Deep charcoal with silver hover
        primary: "bg-deep-charcoal text-pure-white hover:bg-primary-600 hover:shadow-elevated active:bg-primary-700",
        
        // Secondary - Elegant silver surface
        secondary: "bg-elegant-silver text-deep-charcoal hover:bg-silver-accent hover:shadow-card active:bg-primary-200",
        
        // Outline - Silver border with sophisticated hover
        outline: "border border-silver-accent text-deep-charcoal hover:bg-elegant-silver hover:shadow-subtle active:bg-primary-200",
        
        // Ghost - Subtle silver interactions
        ghost: "text-deep-charcoal hover:bg-elegant-silver hover:shadow-subtle active:bg-primary-200",
        
        // Link - Minimal with silver accent
        link: "text-deep-charcoal underline-offset-4 hover:underline hover:text-primary-600",
      },
      size: {
        sm: "h-9 px-3 text-ui-sm",
        md: "h-10 px-4 text-ui-md", 
        lg: "h-11 px-6 text-ui-lg",
        xl: "h-12 px-8 text-ui-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || disabled}
        {...props}
      >
        {loading && (
          <div className="mr-2 h-4 w-4 animate-pulse-silver rounded-full bg-current opacity-60" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
