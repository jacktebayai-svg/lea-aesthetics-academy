import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../cn';

const cardVariants = cva(
  // Base card styles with professional silver aesthetic
  "rounded-card transition-all duration-300 ease-lea",
  {
    variants: {
      variant: {
        // Elegant silver - Primary card style
        elegant: "bg-elegant-silver shadow-card hover:shadow-elevated hover:bg-surface-dark",
        
        // Surface - Clean white with silver border
        surface: "bg-background-paper border border-silver-accent shadow-subtle hover:shadow-card",
        
        // Elevated - Raised appearance with deeper shadow
        elevated: "bg-elegant-silver shadow-elevated",
        
        // Outline - Border only, minimal style
        outline: "border border-silver-accent hover:bg-elegant-silver",
        
        // Ghost - Minimal hover state
        ghost: "hover:bg-elegant-silver hover:shadow-subtle",
      },
      padding: {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
        xl: "p-12",
      },
    },
    defaultVariants: {
      variant: "elegant",
      padding: "md",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, className }))}
      {...props}
    />
  )
);

Card.displayName = "Card";

// Card Header Component
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 pb-4", className)}
    {...props}
  />
));

CardHeader.displayName = "CardHeader";

// Card Title Component  
const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-serif text-heading-4 font-medium text-text-primary leading-none tracking-tight",
      className
    )}
    {...props}
  />
));

CardTitle.displayName = "CardTitle";

// Card Description Component
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-body-sm text-text-secondary font-sans", className)}
    {...props}
  />
));

CardDescription.displayName = "CardDescription";

// Card Content Component
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn("p-6 pt-0 font-sans", className)} 
    {...props} 
  />
));

CardContent.displayName = "CardContent";

// Card Footer Component
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));

CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
};
