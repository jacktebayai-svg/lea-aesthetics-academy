import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Maerose Card Variants
const cardVariants = cva(
  // Base Maerose card styles
  "maerose-card",
  {
    variants: {
      variant: {
        default: "",
        elevated: "shadow-maerose-elevated",
        flat: "shadow-none border-none",
        service: "overflow-hidden relative group cursor-pointer",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6", 
        lg: "p-8",
        xl: "p-12",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "lg",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, className }))}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

// Card Header Component
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mb-6", className)}
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
    className={cn("text-heading-3 text-ivory-white font-semibold uppercase tracking-wide", className)}
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
    className={cn("text-body-regular text-soft-mist-grey leading-relaxed mt-2", className)}
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
    className={cn("", className)}
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
    className={cn("mt-6 pt-4 border-t border-estate-border-grey", className)}
    {...props}
  />
));

CardFooter.displayName = "CardFooter";

// Service Card Component - Special Maerose variant
export interface ServiceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  image?: string;
  title: string;
  price?: string;
  description?: string;
}

const ServiceCard = React.forwardRef<HTMLDivElement, ServiceCardProps>(
  ({ className, image, title, price, description, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        variant="service"
        padding="none"
        className={cn("", className)}
        {...props}
      >
        {/* Image Section */}
        {image && (
          <div className="relative overflow-hidden h-48">
            <img 
              src={image} 
              alt={title}
              className="w-full h-full object-cover transition-all duration-interaction maerose-ease group-hover:opacity-92"
            />
            {/* Gold overlay on hover */}
            <div className="absolute inset-0 bg-champagne-gold/0 group-hover:bg-champagne-gold/20 transition-all duration-interaction maerose-ease" />
            
            {/* Price badge */}
            {price && (
              <div className="absolute top-4 left-4 bg-champagne-gold text-primary-noir px-3 py-1 rounded-maerose text-body-small font-semibold uppercase tracking-wide">
                {price}
              </div>
            )}
          </div>
        )}
        
        {/* Content Section */}
        <div className="p-6">
          <h3 className="text-heading-3 text-ivory-white font-bold uppercase tracking-wide mb-2">
            {title}
          </h3>
          {description && (
            <p className="text-body-regular text-soft-mist-grey leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </Card>
    );
  }
);

ServiceCard.displayName = "ServiceCard";

export { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  ServiceCard,
  cardVariants 
};
