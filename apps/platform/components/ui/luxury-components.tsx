'use client'

import React, { ReactNode, forwardRef } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { 
  Loader2, 
  Crown, 
  Sparkles, 
  Star,
  ChevronRight,
  Check,
  X,
  AlertCircle,
  Info
} from 'lucide-react'

/* === ANIMATION VARIANTS === */
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
}

export const fadeInLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
}

export const fadeInRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.4, ease: "easeOut" }
}

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

/* === BUTTON COMPONENTS === */
interface LuxuryButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  children: ReactNode
  className?: string
  disabled?: boolean
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  type?: 'button' | 'submit' | 'reset'
}

export const LuxuryButton = forwardRef<HTMLButtonElement, LuxuryButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    isLoading = false, 
    leftIcon, 
    rightIcon, 
    children, 
    className,
    disabled,
    onClick,
    type = 'button',
    ...props 
  }, ref) => {
    const variants = {
      primary: 'lea-button-primary bg-gradient-to-r from-[#b45309] to-[#d97706] text-white shadow-lg hover:shadow-xl',
      secondary: 'lea-button-secondary bg-white border-2 border-[#fcd34d] text-[#92400e] hover:bg-[#fefce8]',
      ghost: 'bg-transparent hover:bg-[#fefce8] text-[#92400e] border border-transparent hover:border-[#fcd34d]',
      accent: 'bg-gradient-to-r from-[#ec4899] to-[#f472b6] text-white shadow-lg hover:shadow-xl'
    }
    
    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
      xl: 'px-8 py-4 text-xl'
    }

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-[#fcd34d] focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        onClick={onClick}
        type={type}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : leftIcon ? (
          <span className="mr-2">{leftIcon}</span>
        ) : null}
        
        {children}
        
        {!isLoading && rightIcon && (
          <span className="ml-2">{rightIcon}</span>
        )}
      </motion.button>
    )
  }
)

LuxuryButton.displayName = 'LuxuryButton'

/* === CARD COMPONENTS === */
interface LuxuryCardProps extends HTMLMotionProps<"div"> {
  variant?: 'default' | 'premium' | 'glass'
  hover?: boolean
  children: ReactNode
  onClick?: () => void
}

export const LuxuryCard = forwardRef<HTMLDivElement, LuxuryCardProps>(
  ({ variant = 'default', hover = true, children, className, ...props }, ref) => {
    const variants = {
      default: 'lea-card bg-white border border-[#e7e5e4] shadow-md',
      premium: 'lea-card-premium bg-gradient-to-br from-white to-[#fefce8] border border-[#fde68a] shadow-lg',
      glass: 'lea-glass backdrop-blur-md bg-white/80 border border-white/20 shadow-xl'
    }

    const hoverProps = hover ? {
      whileHover: { y: -4, scale: 1.02 },
      transition: { duration: 0.2, ease: "easeOut" }
    } : {}

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={cn(
          'rounded-xl p-6 transition-all duration-200',
          variants[variant],
          hover && 'hover:shadow-lg',
          className
        )}
        {...hoverProps}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

LuxuryCard.displayName = 'LuxuryCard'

/* === INPUT COMPONENTS === */
interface LuxuryInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export const LuxuryInput = forwardRef<HTMLInputElement, LuxuryInputProps>(
  ({ label, error, leftIcon, rightIcon, className, ...props }, ref) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-2"
      >
        {label && (
          <label className="block text-sm font-medium text-[#44403c]">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#78716c]">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            className={cn(
              'lea-input w-full rounded-lg border-2 border-[#e7e5e4] bg-white px-3 py-2',
              'focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/20',
              'placeholder:text-[#78716c] placeholder:italic',
              'transition-all duration-200',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-red-400 focus:border-red-400 focus:ring-red-400/20',
              className
            )}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#78716c]">
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="text-sm text-red-600 flex items-center"
          >
            <AlertCircle className="h-4 w-4 mr-1" />
            {error}
          </motion.p>
        )}
      </motion.div>
    )
  }
)

LuxuryInput.displayName = 'LuxuryInput'

/* === BADGE COMPONENTS === */
interface LuxuryBadgeProps {
  variant?: 'gold' | 'rose' | 'success' | 'warning' | 'info'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  className?: string
}

export const LuxuryBadge: React.FC<LuxuryBadgeProps> = ({ 
  variant = 'gold', 
  size = 'md', 
  children, 
  className 
}) => {
  const variants = {
    gold: 'lea-badge-gold bg-[#fef3c7] text-[#78350f] border-[#fde68a]',
    rose: 'lea-badge-rose bg-[#fce7f3] text-[#9d174d] border-[#fbcfe8]',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200'
  }
  
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        'lea-badge inline-flex items-center rounded-full border font-medium',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </motion.span>
  )
}

/* === AVATAR COMPONENTS === */
interface LuxuryAvatarProps {
  src?: string
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fallback?: string
  className?: string
}

export const LuxuryAvatar: React.FC<LuxuryAvatarProps> = ({ 
  src, 
  alt, 
  size = 'md', 
  fallback, 
  className 
}) => {
  const sizes = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-12 w-12 text-base',
    lg: 'h-16 w-16 text-lg',
    xl: 'h-24 w-24 text-2xl'
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={cn(
        'relative inline-flex items-center justify-center rounded-full bg-gradient-to-br from-[#fcd34d] to-[#f59e0b]',
        'text-white font-medium shadow-md ring-2 ring-white',
        sizes[size],
        className
      )}
    >
      {src ? (
        <img 
          src={src} 
          alt={alt} 
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <span className="uppercase">
          {fallback || '?'}
        </span>
      )}
    </motion.div>
  )
}

/* === LOADING COMPONENTS === */
export const LuxuryLoader: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className={cn(
          'rounded-full border-2 border-[#fde68a] border-t-[#d97706]',
          sizes[size]
        )}
      />
    </motion.div>
  )
}

/* === SKELETON COMPONENTS === */
interface LuxurySkeletonProps {
  className?: string
  lines?: number
  circle?: boolean
}

export const LuxurySkeleton: React.FC<LuxurySkeletonProps> = ({ 
  className, 
  lines = 1, 
  circle = false 
}) => {
  if (lines === 1) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          'lea-skeleton animate-shimmer',
          circle ? 'rounded-full aspect-square' : 'h-4 rounded',
          className
        )}
      />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'lea-skeleton animate-shimmer h-4 rounded',
            i === lines - 1 && 'w-3/4', // Last line shorter
            className
          )}
        />
      ))}
    </motion.div>
  )
}

/* === NOTIFICATION COMPONENTS === */
interface LuxuryToastProps {
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  onClose?: () => void
}

export const LuxuryToast: React.FC<LuxuryToastProps> = ({ 
  type = 'info', 
  title, 
  message, 
  onClose 
}) => {
  const variants = {
    success: {
      bg: 'bg-green-50 border-green-200',
      icon: <Check className="h-5 w-5 text-green-600" />,
      title: 'text-green-800',
      message: 'text-green-700'
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      icon: <X className="h-5 w-5 text-red-600" />,
      title: 'text-red-800',
      message: 'text-red-700'
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-200',
      icon: <AlertCircle className="h-5 w-5 text-yellow-600" />,
      title: 'text-yellow-800',
      message: 'text-yellow-700'
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      icon: <Info className="h-5 w-5 text-blue-600" />,
      title: 'text-blue-800',
      message: 'text-blue-700'
    }
  }

  const variant = variants[type]

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.3 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.5 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        'max-w-sm w-full border rounded-lg shadow-lg p-4',
        variant.bg
      )}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {variant.icon}
        </div>
        <div className="ml-3 w-0 flex-1">
          {title && (
            <p className={cn('text-sm font-medium', variant.title)}>
              {title}
            </p>
          )}
          <p className={cn('text-sm', variant.message, !title && 'mt-0')}>
            {message}
          </p>
        </div>
        {onClose && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

/* === LUXURY SECTION COMPONENT === */
interface LuxurySectionProps {
  children: ReactNode
  className?: string
  background?: 'default' | 'gradient' | 'accent'
  padding?: 'sm' | 'md' | 'lg' | 'xl'
}

export const LuxurySection: React.FC<LuxurySectionProps> = ({
  children,
  className,
  background = 'default',
  padding = 'lg'
}) => {
  const backgrounds = {
    default: 'bg-[#fafaf9]',
    gradient: 'lea-gradient-bg',
    accent: 'bg-gradient-to-br from-[#fce7f3] to-[#fefce8]'
  }
  
  const paddings = {
    sm: 'py-8',
    md: 'py-16',
    lg: 'py-24',
    xl: 'py-32'
  }

  return (
    <motion.section
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-100px" }}
      className={cn(
        'lea-section relative overflow-hidden',
        backgrounds[background],
        paddings[padding],
        className
      )}
    >
      {children}
    </motion.section>
  )
}

/* === LUXURY HERO COMPONENT === */
interface LuxuryHeroProps {
  title: ReactNode
  subtitle?: ReactNode
  description?: ReactNode
  primaryAction?: ReactNode
  secondaryAction?: ReactNode
  backgroundImage?: string
  overlay?: boolean
}

export const LuxuryHero: React.FC<LuxuryHeroProps> = ({
  title,
  subtitle,
  description,
  primaryAction,
  secondaryAction,
  backgroundImage,
  overlay = true
}) => {
  return (
    <LuxurySection background="gradient" padding="xl" className="relative min-h-screen flex items-center">
      {backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
      
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/10" />
      )}
      
      <div className="lea-container relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="text-center max-w-4xl mx-auto"
        >
          {subtitle && (
            <motion.div variants={fadeInUp} className="mb-6">
              <LuxuryBadge variant="gold" size="lg">
                {subtitle}
              </LuxuryBadge>
            </motion.div>
          )}
          
          <motion.div variants={fadeInUp} className="mb-6">
            <h1 className="lea-text-heading text-6xl lg:text-7xl">
              {title}
            </h1>
          </motion.div>
          
          {description && (
            <motion.div variants={fadeInUp} className="mb-8">
              <p className="lea-text-subheading max-w-2xl mx-auto">
                {description}
              </p>
            </motion.div>
          )}
          
          {(primaryAction || secondaryAction) && (
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              {primaryAction}
              {secondaryAction}
            </motion.div>
          )}
        </motion.div>
      </div>
      
      {/* Floating Elements */}
      <motion.div
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-20 hidden lg:block"
      >
        <Sparkles className="h-8 w-8 text-[#f59e0b] opacity-60" />
      </motion.div>
      
      <motion.div
        animate={{ y: [10, -10, 10] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 right-20 hidden lg:block"
      >
        <Crown className="h-12 w-12 text-[#ec4899] opacity-40" />
      </motion.div>
    </LuxurySection>
  )
}

/* === FEATURE GRID COMPONENT === */
interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  features: string[]
  action?: ReactNode
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  features,
  action
}) => {
  return (
    <LuxuryCard variant="premium" className="h-full">
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
        className="mb-4"
      >
        {icon}
      </motion.div>
      
      <h3 className="text-xl font-bold text-[#1c1917] mb-3">
        {title}
      </h3>
      
      <p className="text-[#57534e] mb-4">
        {description}
      </p>
      
      <ul className="space-y-2 mb-6">
        {features.map((feature, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="flex items-center text-sm text-[#44403c]"
          >
            <Star className="h-4 w-4 text-[#f59e0b] mr-2 flex-shrink-0" />
            {feature}
          </motion.li>
        ))}
      </ul>
      
      {action && (
        <div className="mt-auto pt-4">
          {action}
        </div>
      )}
    </LuxuryCard>
  )
}

/* === TESTIMONIAL COMPONENT === */
interface TestimonialProps {
  quote: string
  author: string
  role: string
  avatar?: string
  rating?: number
}

export const LuxuryTestimonial: React.FC<TestimonialProps> = ({
  quote,
  author,
  role,
  avatar,
  rating = 5
}) => {
  return (
    <LuxuryCard variant="glass" className="text-center">
      <div className="flex justify-center mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              'h-5 w-5',
              i < rating ? 'text-[#f59e0b] fill-current' : 'text-[#e7e5e4]'
            )}
          />
        ))}
      </div>
      
      <blockquote className="lea-font-accent text-lg text-[#44403c] mb-6">
        "{quote}"
      </blockquote>
      
      <div className="flex items-center justify-center space-x-3">
        <LuxuryAvatar src={avatar} alt={author} fallback={author[0]} size="sm" />
        <div>
          <p className="font-semibold text-[#1c1917]">{author}</p>
          <p className="text-sm text-[#78716c]">{role}</p>
        </div>
      </div>
    </LuxuryCard>
  )
}

/* === STATS COMPONENT === */
interface StatsProps {
  stats: Array<{
    value: string
    label: string
    description?: string
  }>
}

export const LuxuryStats: React.FC<StatsProps> = ({ stats }) => {
  return (
    <motion.div 
      variants={staggerContainer}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-8"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          variants={scaleIn}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.6, type: "spring" }}
            className="text-4xl lg:text-5xl font-bold lea-text-gradient mb-2"
          >
            {stat.value}
          </motion.div>
          <h3 className="text-lg font-semibold text-[#1c1917] mb-1">
            {stat.label}
          </h3>
          {stat.description && (
            <p className="text-sm text-[#78716c]">
              {stat.description}
            </p>
          )}
        </motion.div>
      ))}
    </motion.div>
  )
}

/* === CTA SECTION COMPONENT === */
interface LuxuryCTAProps {
  title: ReactNode
  description?: ReactNode
  primaryAction?: ReactNode
  secondaryAction?: ReactNode
  backgroundPattern?: boolean
}

export const LuxuryCTA: React.FC<LuxuryCTAProps> = ({
  title,
  description,
  primaryAction,
  secondaryAction,
  backgroundPattern = true
}) => {
  return (
    <LuxurySection background="accent" className="relative">
      {backgroundPattern && (
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <defs>
              <pattern id="luxury-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="2" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#luxury-pattern)" />
          </svg>
        </div>
      )}
      
      <div className="lea-container relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          <motion.div variants={fadeInUp}>
            <h2 className="text-4xl lg:text-5xl font-bold text-[#1c1917] mb-6">
              {title}
            </h2>
          </motion.div>
          
          {description && (
            <motion.div variants={fadeInUp}>
              <p className="lea-text-subheading mb-8 max-w-2xl mx-auto">
                {description}
              </p>
            </motion.div>
          )}
          
          {(primaryAction || secondaryAction) && (
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              {primaryAction}
              {secondaryAction}
            </motion.div>
          )}
        </motion.div>
      </div>
    </LuxurySection>
  )
}

/* === LAYOUT COMPONENTS === */
interface LuxuryLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
  className?: string
  showNavigation?: boolean
}

export const LuxuryLayout: React.FC<LuxuryLayoutProps> = ({
  children,
  title,
  subtitle,
  className,
  showNavigation = true
}) => {
  return (
    <div className="min-h-screen lea-gradient-bg">
      {showNavigation && (
        <header className="bg-white/95 backdrop-blur-sm border-b border-border sticky top-0 z-50 lea-backdrop">
          <div className="lea-container">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <Crown className="h-8 w-8 text-primary lea-text-gradient" />
                  <Sparkles className="h-3 w-3 text-accent absolute -top-1 -right-1 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-xl font-bold lea-text-gradient">LEA</h1>
                  <p className="text-xs text-muted-foreground -mt-1">Aesthetics Academy</p>
                </div>
              </Link>
            </div>
          </div>
        </header>
      )}
      
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8">
        <div className={cn('w-full max-w-lg', className)}>
          {(title || subtitle) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              {title && (
                <h1 className="text-3xl md:text-4xl font-bold lea-text-gradient mb-2">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-[#78716c] text-lg">
                  {subtitle}
                </p>
              )}
            </motion.div>
          )}
          {children}
        </div>
      </main>
    </div>
  )
}

/* === FORM COMPONENTS === */
interface LuxuryFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode
}

export const LuxuryForm = forwardRef<HTMLFormElement, LuxuryFormProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.form
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={cn('space-y-6', className)}
        {...props}
      >
        {children}
      </motion.form>
    )
  }
)

LuxuryForm.displayName = 'LuxuryForm'

/* === NOTIFICATION COMPONENTS === */
