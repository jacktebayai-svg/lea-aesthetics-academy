import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Maerose Button Variants - Following Design Specification
const buttonVariants = cva(
  // Base styles - Common to all buttons
  "inline-flex items-center justify-center font-inter font-semibold rounded-maerose transition-all duration-interaction maerose-ease maerose-focus disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wide",
  {
    variants: {
      variant: {
        // Primary: Champagne gold fill, white text
        primary: "maerose-button-primary",
        
        // Secondary: Transparent with 2px gold border
        secondary: "maerose-button-secondary",
        
        // Tertiary: Simple text button
        tertiary: "bg-transparent text-champagne-gold hover:text-champagne-highlight border-none shadow-none",
      },
      size: {
        sm: "px-4 py-2 text-body-small",
        md: "px-6 py-3 text-body-regular", 
        lg: "px-10 py-4 text-body-regular",
        xl: "px-12 py-5 text-body-large",
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
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
