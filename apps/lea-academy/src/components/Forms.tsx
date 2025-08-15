'use client';

import React, { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, forwardRef } from 'react';

// Base Input Component
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'search';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helper,
  icon,
  variant = 'default',
  className = '',
  ...props
}, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-primary">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`
            form-input
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:border-red-500' : ''}
            ${variant === 'search' ? 'rounded-full' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {helper && !error && (
        <p className="text-sm text-secondary">{helper}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Textarea Component
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helper,
  className = '',
  rows = 4,
  ...props
}, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-primary">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={`
          form-input resize-vertical
          ${error ? 'border-red-500 focus:border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {helper && !error && (
        <p className="text-sm text-secondary">{helper}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

// Select Component
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helper?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  helper,
  options,
  placeholder,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-primary">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={`
          form-input cursor-pointer
          ${error ? 'border-red-500 focus:border-red-500' : ''}
          ${className}
        `}
        {...props}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {helper && !error && (
        <p className="text-sm text-secondary">{helper}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

// Checkbox Component
interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helper?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  error,
  helper,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center">
        <input
          ref={ref}
          type="checkbox"
          className={`
            h-4 w-4 text-primary focus:ring-primary border-border rounded
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        <label className="ml-2 text-sm font-medium text-primary">
          {label}
        </label>
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {helper && !error && (
        <p className="text-sm text-secondary">{helper}</p>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

// Radio Group Component
interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  helper?: string;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  value,
  onChange,
  label,
  error,
  helper,
  className = ''
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <legend className="block text-sm font-medium text-primary">
          {label}
        </legend>
      )}
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-start">
            <input
              type="radio"
              id={`${name}-${option.value}`}
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange?.(e.target.value)}
              className={`
                h-4 w-4 mt-0.5 text-primary focus:ring-primary border-border
                ${error ? 'border-red-500' : ''}
              `}
            />
            <div className="ml-2">
              <label
                htmlFor={`${name}-${option.value}`}
                className="text-sm font-medium text-primary cursor-pointer"
              >
                {option.label}
              </label>
              {option.description && (
                <p className="text-sm text-secondary">{option.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {helper && !error && (
        <p className="text-sm text-secondary">{helper}</p>
      )}
    </div>
  );
};

// Form Section Component
interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {(title || description) && (
        <div className="border-b border-border pb-4">
          {title && (
            <h3 className="text-serif text-lg font-semibold text-primary">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-secondary mt-1">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

// Form Layout Component
interface FormLayoutProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const FormLayout: React.FC<FormLayoutProps> = ({
  title,
  description,
  children,
  actions,
  className = ''
}) => {
  return (
    <div className={`card ${className}`}>
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h2 className="text-serif text-2xl font-semibold text-primary mb-2">{title}</h2>
          )}
          {description && (
            <p className="text-secondary">{description}</p>
          )}
        </div>
      )}
      
      <form className="space-y-6">
        {children}
        
        {actions && (
          <div className="pt-6 border-t border-border">
            {actions}
          </div>
        )}
      </form>
    </div>
  );
};
