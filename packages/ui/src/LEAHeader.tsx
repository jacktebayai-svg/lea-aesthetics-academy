import React from 'react';
import { cn } from './utils/cn';
import LEALogo from './LEALogo';

interface LEAHeaderProps {
  className?: string;
  variant?: 'main' | 'student' | 'client' | 'admin';
  children?: React.ReactNode;
  showLogo?: boolean;
  logoSize?: 'sm' | 'md' | 'lg' | 'xl';
}

const LEAHeader: React.FC<LEAHeaderProps> = ({
  className,
  variant = 'main',
  children,
  showLogo = true,
  logoSize = 'md'
}) => {
  const variantStyles = {
    main: 'bg-white border-b border-slate-200',
    student: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200',
    client: 'bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-200',
    admin: 'bg-gradient-to-r from-slate-900 to-slate-800 text-white'
  };

  const logoColor = variant === 'admin' ? 'light' : 'dark';

  return (
    <header className={cn(
      'w-full py-4 px-4 sm:px-6 lg:px-8',
      variantStyles[variant],
      className
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo Section */}
        {showLogo && (
          <div className="flex items-center">
            <LEALogo 
              size={logoSize} 
              variant="full" 
              color={logoColor}
            />
            {variant !== 'main' && (
              <div className="ml-4 pl-4 border-l border-current opacity-50">
                <span className={cn(
                  'text-sm font-sans uppercase tracking-wider',
                  variant === 'admin' ? 'text-white' : 'text-slate-600'
                )}>
                  {variant === 'student' && 'Student Portal'}
                  {variant === 'client' && 'Client Portal'}
                  {variant === 'admin' && 'Admin Dashboard'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Navigation/Actions Section */}
        <div className="flex items-center space-x-4">
          {children}
        </div>
      </div>
    </header>
  );
};

export default LEAHeader;
