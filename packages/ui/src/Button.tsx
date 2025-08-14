"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  leftIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  leftIcon,
  className,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold px-6 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold transition-all duration-300 ease-out-quint disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary: "bg-slate text-ivory hover:bg-charcoal shadow-elevated",
    secondary:
      "bg-transparent text-slate border-2 border-smoke hover:border-slate",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
    </button>
  );
};

export default Button;
