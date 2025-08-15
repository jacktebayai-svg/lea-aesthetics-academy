"use client";

import React, { useState, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils/cn';

// Enterprise-grade Card component with premium interactions
const cardVariants = cva(
  // Base styles - Production-ready foundation
  [
    "relative overflow-hidden backdrop-blur-sm",
    "transition-all duration-300 ease-out transform-gpu",
    "group cursor-default",
    "before:absolute before:inset-0 before:rounded-[inherit]",
    "before:bg-gradient-to-br before:from-pure-white/5 before:via-transparent before:to-transparent",
    "before:opacity-0 before:transition-opacity before:duration-300",
    "after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset",
    "after:ring-silver-accent/20 after:transition-all after:duration-300",
  ],
  {
    variants: {
      variant: {
        // Default: Elegant silver with subtle interactions
        default: [
          "bg-elegant-silver/80 backdrop-blur-sm",
          "shadow-card hover:shadow-elevated",
          "hover:bg-elegant-silver/90",
          "hover:before:opacity-100",
          "hover:after:ring-silver-accent/30",
        ],
        // Premium: Enhanced visual hierarchy
        premium: [
          "bg-gradient-to-br from-elegant-silver via-elegant-silver/95 to-silver-accent/30",
          "shadow-elevated hover:shadow-[0_20px_40px_rgba(17,17,17,0.15)]",
          "hover:before:opacity-100",
          "hover:after:ring-silver-accent/40",
          "border border-silver-accent/20 hover:border-silver-accent/40",
        ],
        // Glass: Modern glassmorphism effect
        glass: [
          "bg-pure-white/20 backdrop-blur-xl border border-pure-white/30",
          "shadow-glow hover:shadow-[0_8px_32px_rgba(184,184,184,0.25)]",
          "hover:bg-pure-white/30",
          "hover:before:opacity-100",
          "hover:border-pure-white/40",
        ],
        // Outline: Minimalist border-focused design
        outline: [
          "bg-transparent border-2 border-silver-accent/40",
          "hover:border-silver-accent hover:bg-elegant-silver/20",
          "shadow-subtle hover:shadow-card",
          "hover:before:opacity-100",
        ],
        // Flat: Clean, minimal appearance
        flat: [
          "bg-light-platinum",
          "hover:bg-elegant-silver/50",
          "shadow-none hover:shadow-subtle",
          "hover:before:opacity-100",
        ],
      },
      size: {
        sm: "p-4 rounded-lg",
        default: "p-6 sm:p-8 rounded-2xl",
        lg: "p-8 sm:p-12 rounded-3xl",
        xl: "p-12 sm:p-16 rounded-3xl",
      },
      interactive: {
        true: [
          "cursor-pointer select-none",
          "hover:scale-[1.02] active:scale-[0.98]",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-silver-accent focus-visible:ring-offset-2",
        ],
        false: "",
      },
      loading: {
        true: "pointer-events-none animate-pulse",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      interactive: false,
      loading: false,
    },
  }
);

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  children: React.ReactNode;
  interactive?: boolean;
  loading?: boolean;
  glowEffect?: boolean;
  onCardClick?: () => void;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant,
      size,
      children,
      interactive = false,
      loading = false,
      glowEffect = false,
      onCardClick,
      onClick,
      ...props
    },
    ref
  ) => {
    const [isPressed, setIsPressed] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseDown = () => {
      if (interactive) setIsPressed(true);
    };
    
    const handleMouseUp = () => {
      setIsPressed(false);
    };
    
    const handleMouseLeave = () => {
      setIsPressed(false);
      setIsHovered(false);
    };
    
    const handleMouseEnter = () => {
      if (interactive) setIsHovered(true);
    };

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (onClick) onClick(e);
      if (onCardClick) onCardClick();
    };

    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ variant, size, interactive, loading }),
          isPressed && interactive && "scale-[0.98] shadow-subtle",
          glowEffect && isHovered && "shadow-glow",
          className
        )}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        onClick={interactive ? handleClick : onClick}
        tabIndex={interactive ? 0 : undefined}
        role={interactive ? "button" : undefined}
        {...props}
      >
        {/* Premium shine effect overlay */}
        {interactive && (
          <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-r from-transparent via-pure-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
        )}
        
        {/* Content container with proper spacing */}
        <div className="relative z-10">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-silver-accent/30 rounded-lg w-3/4"></div>
              <div className="h-4 bg-silver-accent/30 rounded-lg w-1/2"></div>
              <div className="h-20 bg-silver-accent/30 rounded-lg"></div>
            </div>
          ) : (
            children
          )}
        </div>

        {/* Subtle border glow effect */}
        <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-br from-silver-accent/10 via-transparent to-silver-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;
export { cardVariants };
