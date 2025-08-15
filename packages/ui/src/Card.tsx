import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div
      className={`bg-elegant-silver rounded-2xl shadow-card p-6 sm:p-8 transition-all duration-interaction hover:shadow-elevated ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
