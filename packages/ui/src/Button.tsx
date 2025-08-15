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
    "inline-flex items-center justify-center font-ui font-medium px-6 py-3 rounded-xl focus:outline-none focus:shadow-focus transition-all duration-interaction disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary: "bg-deep-charcoal text-pure-white hover:bg-slate shadow-card hover:shadow-elevated",
    secondary:
      "bg-transparent text-deep-charcoal border-2 border-silver-accent hover:border-deep-charcoal hover:bg-elegant-silver",
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
