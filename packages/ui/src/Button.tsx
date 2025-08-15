"use client";

import React, { useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

// Enterprise-grade Button component with premium interactions
const buttonVariants = cva(
  // Base styles - Production-ready foundation
  [
    "inline-flex items-center justify-center font-ui relative overflow-hidden",
    "text-ui-regular font-medium tracking-tight",
    "transition-all duration-200 ease-out transform-gpu",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "group active:scale-[0.98] hover:scale-[1.01]",
    "before:absolute before:inset-0 before:rounded-[inherit] before:bg-gradient-to-br before:opacity-0 before:transition-opacity before:duration-300",
  ],
  {
    variants: {
      variant: {
        // Primary: Deep charcoal with sophisticated interactions
        primary: [
          "bg-gradient-to-br from-deep-charcoal to-slate text-pure-white",
          "shadow-card hover:shadow-elevated",
          "before:from-silver-accent/20 before:to-transparent",
          "hover:before:opacity-100",
          "focus-visible:ring-silver-accent",
          "border border-deep-charcoal/10",
        ],
        // Secondary: Elegant silver with premium feel
        secondary: [
          "bg-elegant-silver text-deep-charcoal border-2 border-silver-accent/40",
          "hover:bg-gradient-to-br hover:from-elegant-silver hover:to-silver-accent/20",
          "hover:border-silver-accent shadow-subtle hover:shadow-card",
          "before:from-pure-white/40 before:to-transparent",
          "hover:before:opacity-100",
          "focus-visible:ring-deep-charcoal",
        ],
        // Ghost: Minimalist with subtle interactions
        ghost: [
          "bg-transparent text-deep-charcoal hover:bg-elegant-silver/50",
          "hover:shadow-subtle",
          "before:from-silver-accent/10 before:to-transparent",
          "hover:before:opacity-100",
          "focus-visible:ring-silver-accent",
        ],
        // Outline: Professional borders with premium hover
        outline: [
          "bg-transparent text-deep-charcoal border-2 border-current",
          "hover:bg-deep-charcoal hover:text-pure-white",
          "shadow-subtle hover:shadow-card",
          "before:from-deep-charcoal/5 before:to-transparent",
          "hover:before:opacity-0",
          "focus-visible:ring-deep-charcoal",
        ],
        // Destructive: For critical actions
        destructive: [
          "bg-gradient-to-br from-red-600 to-red-700 text-pure-white",
          "shadow-card hover:shadow-elevated",
          "hover:from-red-700 hover:to-red-800",
          "focus-visible:ring-red-500",
          "before:from-red-400/20 before:to-transparent",
          "hover:before:opacity-100",
        ],
      },
      size: {
        sm: "px-4 py-2 text-ui-small min-h-[36px] rounded-lg",
        default: "px-6 py-3 text-ui-regular min-h-[44px] rounded-xl",
        lg: "px-8 py-4 text-ui-large min-h-[52px] rounded-xl",
        xl: "px-10 py-5 text-body-large min-h-[60px] rounded-2xl",
        icon: "p-2 min-h-[44px] min-w-[44px] rounded-xl",
      },
      loading: {
        true: "cursor-wait",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      loading: false,
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
}

// Premium loading spinner component
const LoadingSpinner = ({ size = "default" }: { size?: string }) => {
  const spinnerSizes = {
    sm: "w-4 h-4",
    default: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-7 h-7",
    icon: "w-5 h-5",
  };

  return (
    <svg
      className={cn(
        "animate-spin text-current",
        spinnerSizes[size as keyof typeof spinnerSizes] || spinnerSizes.default
      )}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      children,
      leftIcon,
      rightIcon,
      loading = false,
      loadingText,
      disabled,
      ...props
    },
    ref
  ) => {
    const [isPressed, setIsPressed] = useState(false);

    const handleMouseDown = () => setIsPressed(true);
    const handleMouseUp = () => setIsPressed(false);
    const handleMouseLeave = () => setIsPressed(false);

    const isLoading = loading;
    const isDisabled = disabled || isLoading;

    return (
      <button
        className={cn(
          buttonVariants({ variant, size, loading: isLoading, className }),
          isPressed && !isDisabled && "scale-[0.97] shadow-subtle"
        )}
        ref={ref}
        disabled={isDisabled}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {/* Left Icon */}
        {leftIcon && !isLoading && (
          <span className="mr-2 flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
            {leftIcon}
          </span>
        )}

        {/* Loading State */}
        {isLoading && (
          <span className="mr-2 flex-shrink-0">
            <LoadingSpinner size={size} />
          </span>
        )}

        {/* Content */}
        <span className="flex-1 truncate font-medium">
          {isLoading && loadingText ? loadingText : children}
        </span>

        {/* Right Icon */}
        {rightIcon && !isLoading && (
          <span className="ml-2 flex-shrink-0 transition-transform duration-200 group-hover:scale-105 group-hover:translate-x-0.5">
            {rightIcon}
          </span>
        )}

        {/* Premium shine effect overlay */}
        <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-r from-transparent via-pure-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
export { buttonVariants };
