import React from 'react';

interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
  id?: string;
}

export function Checkbox({ checked = false, onCheckedChange, className, id }: CheckboxProps) {
  return (
    <button
      id={id}
      role="checkbox"
      aria-checked={checked}
      className={`peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-background'
      } ${className}`}
      onClick={() => onCheckedChange?.(!checked)}
    >
      {checked && (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <polyline points="20,6 9,17 4,12" />
        </svg>
      )}
    </button>
  );
}
