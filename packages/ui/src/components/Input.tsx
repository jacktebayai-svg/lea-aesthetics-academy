import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

const inputVariants = cva(
  // Base input styles with professional silver theme
  "flex w-full rounded-input border border-silver-accent bg-background-paper px-3 py-2 text-body-md font-sans text-text-primary placeholder:text-text-muted transition-all duration-300 ease-lea focus:outline-none focus:ring-2 focus:ring-silver-accent/30 focus:border-deep-charcoal disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "h-9 px-2.5 text-body-sm",
        md: "h-10 px-3 text-body-md",
        lg: "h-11 px-4 text-body-lg",
      },
      variant: {
        default: "",
        // Error state with subtle red tint
        error: "border-error focus:border-error focus:ring-error/30",
        // Success state with subtle green tint  
        success: "border-success focus:border-success focus:ring-success/30",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size, variant, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ size, variant, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

// Label Component
const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-ui-md font-medium font-sans text-text-primary leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
));

Label.displayName = "Label";

// Form Field Component
export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, label, description, error, required, children, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-2", className)} {...props}>
      {label && (
        <Label>
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </Label>
      )}
      {children}
      {description && !error && (
        <p className="text-body-xs text-text-secondary font-sans">
          {description}
        </p>
      )}
      {error && (
        <p className="text-body-xs text-error font-sans">
          {error}
        </p>
      )}
    </div>
  )
);

FormField.displayName = "FormField";

// Textarea Component
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "flex min-h-[80px] w-full rounded-input border border-silver-accent bg-background-paper px-3 py-2 text-body-md font-sans text-text-primary placeholder:text-text-muted transition-all duration-300 ease-lea focus:outline-none focus:ring-2 focus:ring-silver-accent/30 focus:border-deep-charcoal disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    ref={ref}
    {...props}
  />
));

Textarea.displayName = "Textarea";

export { Input, Label, FormField, Textarea, inputVariants };
