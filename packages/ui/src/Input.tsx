"use client";

import React, { useState, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils/cn';

// Enterprise-grade Input component with premium interactions
const inputVariants = cva(
  // Base styles - Production-ready foundation
  [
    "flex w-full font-ui text-ui-regular",
    "transition-all duration-200 ease-out",
    "border border-silver-accent/40 rounded-xl",
    "bg-pure-white/80 backdrop-blur-sm",
    "text-deep-charcoal placeholder:text-muted-gray/60",
    "focus:outline-none focus:ring-2 focus:ring-silver-accent focus:ring-offset-2",
    "focus:border-silver-accent focus:bg-pure-white",
    "hover:border-silver-accent/60 hover:bg-pure-white/90",
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-elegant-silver/30",
    "file:border-0 file:bg-transparent file:text-ui-regular file:font-medium",
    "file:mr-4 file:py-2 file:px-4 file:rounded-lg file:bg-elegant-silver",
    "file:text-deep-charcoal file:hover:bg-silver-accent/50",
  ],
  {
    variants: {
      variant: {
        // Default: Standard input styling
        default: [
          "shadow-subtle focus:shadow-card",
          "border-silver-accent/40 focus:border-silver-accent",
        ],
        // Filled: Elevated background styling  
        filled: [
          "bg-elegant-silver/50 border-transparent",
          "hover:bg-elegant-silver/70 focus:bg-pure-white",
          "focus:border-silver-accent shadow-card",
        ],
        // Outline: Prominent border styling
        outline: [
          "border-2 border-silver-accent/60 bg-transparent",
          "hover:border-silver-accent focus:border-deep-charcoal",
          "shadow-subtle focus:shadow-card",
        ],
        // Ghost: Minimal styling
        ghost: [
          "border-transparent bg-transparent",
          "hover:bg-elegant-silver/20 focus:bg-pure-white/50",
          "focus:border-silver-accent/40",
        ],
      },
      size: {
        sm: "px-3 py-2 text-ui-small min-h-[36px] rounded-lg",
        default: "px-4 py-3 text-ui-regular min-h-[44px] rounded-xl", 
        lg: "px-5 py-4 text-ui-large min-h-[52px] rounded-xl",
      },
      state: {
        default: "",
        error: [
          "border-red-500/60 focus:border-red-500 focus:ring-red-500/30",
          "bg-red-50/50 focus:bg-red-50/80",
        ],
        success: [
          "border-green-500/60 focus:border-green-500 focus:ring-green-500/30", 
          "bg-green-50/50 focus:bg-green-50/80",
        ],
        warning: [
          "border-yellow-500/60 focus:border-yellow-500 focus:ring-yellow-500/30",
          "bg-yellow-50/50 focus:bg-yellow-50/80", 
        ],
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default", 
      state: "default",
    },
  }
);

const labelVariants = cva([
  "block text-ui-regular font-medium text-deep-charcoal mb-2",
  "transition-colors duration-200",
], {
  variants: {
    state: {
      default: "text-deep-charcoal",
      error: "text-red-700",
      success: "text-green-700", 
      warning: "text-yellow-700",
    },
    required: {
      true: "after:content-['*'] after:ml-1 after:text-red-500",
      false: "",
    },
  },
  defaultVariants: {
    state: "default",
    required: false,
  },
});

const helperTextVariants = cva([
  "mt-2 text-ui-small transition-colors duration-200",
], {
  variants: {
    state: {
      default: "text-muted-gray",
      error: "text-red-600",
      success: "text-green-600",
      warning: "text-yellow-600", 
    },
  },
  defaultVariants: {
    state: "default",
  },
});

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  helperText?: string;
  error?: string;
  success?: string;
  warning?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      state,
      type = "text",
      label,
      helperText,
      error,
      success,
      warning,
      leftIcon,
      rightIcon,
      loading,
      required,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    // Determine input state based on props
    const inputState = error 
      ? "error" 
      : success 
        ? "success" 
        : warning 
          ? "warning" 
          : state || "default";

    const displayHelperText = error || success || warning || helperText;

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label 
            className={cn(labelVariants({ state: inputState, required }))}
            htmlFor={props.id}
          >
            {label}
          </label>
        )}

        {/* Input Container */}
        <div className="relative group">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-gray transition-colors duration-200 group-focus-within:text-silver-accent pointer-events-none">
              {leftIcon}
            </div>
          )}

          {/* Input Field */}
          <input
            type={type}
            className={cn(
              inputVariants({ variant, size, state: inputState }),
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              loading && "pr-10",
              className
            )}
            ref={ref}
            required={required}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />

          {/* Right Icon or Loading */}
          {(rightIcon || loading) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-gray transition-colors duration-200 group-focus-within:text-silver-accent">
              {loading ? (
                <svg
                  className="animate-spin w-5 h-5 text-silver-accent"
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
              ) : (
                rightIcon
              )}
            </div>
          )}

          {/* Premium focus ring effect */}
          <div 
            className={cn(
              "absolute inset-0 rounded-[inherit] pointer-events-none transition-all duration-200",
              "ring-1 ring-transparent",
              isFocused && "ring-silver-accent/20 bg-gradient-to-r from-silver-accent/5 via-transparent to-silver-accent/5"
            )}
          />
        </div>

        {/* Helper Text */}
        {displayHelperText && (
          <p className={cn(helperTextVariants({ state: inputState }))}>
            {error || success || warning || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
export { inputVariants };
