import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, ...props }, ref) => {
    const inputId = React.useId();

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-body-regular text-soft-mist-grey font-medium mb-2 uppercase tracking-wide"
          >
            {label}
          </label>
        )}
        
        <input
          type={type}
          id={inputId}
          className={cn(
            // Maerose Input Base Styles
            "w-full px-4 py-3 rounded-maerose",
            "bg-deep-charcoal border border-estate-border-grey",
            "text-ivory-white text-body-regular placeholder:text-[#AAAAAA]",
            "transition-all duration-interaction maerose-ease",
            "focus:border-champagne-gold focus:shadow-[0_0_0_3px_rgba(197,168,128,0.1)] focus:outline-none",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "hover:border-champagne-gold/50",
            // Error state
            error && "border-[#8B2F2F] focus:border-[#8B2F2F] focus:shadow-[0_0_0_3px_rgba(139,47,47,0.1)]",
            className
          )}
          ref={ref}
          {...props}
        />
        
        {/* Error or Helper Text */}
        {(error || helperText) && (
          <p className={cn(
            "mt-2 text-body-small italic",
            error ? "text-[#8B2F2F]" : "text-soft-mist-grey"
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
