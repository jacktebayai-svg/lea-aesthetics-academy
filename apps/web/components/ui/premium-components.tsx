'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  Star, 
  Check, 
  X, 
  ChevronDown,
  ChevronRight,
  User,
  Mail,
  Phone,
  CreditCard,
  Award,
  TrendingUp,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] }
  }
}

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] }
  }
}

// Premium Button Component
interface PremiumButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  className?: string
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  loading = false,
  className = ''
}) => {
  const baseClasses = 'font-semibold transition-all duration-300 relative overflow-hidden group'
  
  const variants = {
    primary: 'bg-gradient-to-r from-champagne-gold to-warm-gold text-ivory hover:from-warm-gold hover:to-champagne-gold shadow-luxury hover:shadow-xl transform hover:-translate-y-0.5',
    secondary: 'border-2 border-champagne-gold text-champagne-gold hover:bg-champagne-gold hover:text-ivory',
    ghost: 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-md',
    md: 'px-6 py-3 text-base rounded-lg',
    lg: 'px-8 py-4 text-lg rounded-xl'
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </span>
      
      {/* Shimmer Effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </motion.button>
  )
}

// Luxury Card Component
interface LuxuryCardProps {
  children: React.ReactNode
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg'
  className?: string
}

export const LuxuryCard: React.FC<LuxuryCardProps> = ({
  children,
  hover = true,
  padding = 'md',
  className = ''
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
      variants={fadeInUp}
      whileHover={hover ? { y: -4, boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)' } : {}}
      className={cn(
        'bg-ivory border border-champagne-gold/10 rounded-2xl shadow-luxury transition-all duration-300 relative overflow-hidden',
        paddingClasses[padding],
        className
      )}
    >
      {/* Golden Border Top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-champagne-gold to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      {children}
    </motion.div>
  )
}

// Premium Input Component
interface PremiumInputProps {
  label: string
  type?: 'text' | 'email' | 'password' | 'tel'
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  error?: string
  required?: boolean
  icon?: React.ReactNode
  className?: string
}

export const PremiumInput: React.FC<PremiumInputProps> = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  icon,
  className = ''
}) => {
  const [focused, setFocused] = useState(false)

  return (
    <div className={cn('form-group', className)}>
      <label className="form-label">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
      
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
            {icon}
          </div>
        )}
        
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            'form-input',
            icon && 'pl-12',
            error && 'border-error',
            focused && 'border-champagne-gold shadow-glow'
          )}
        />
        
        {/* Focus Ring */}
        <AnimatePresence>
          {focused && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 border-2 border-champagne-gold/50 rounded-lg pointer-events-none"
            />
          )}
        </AnimatePresence>
      </div>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-error text-sm mt-2"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}

// Status Badge Component
interface StatusBadgeProps {
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  size?: 'sm' | 'md'
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', className = '' }) => {
  const statusConfig = {
    confirmed: { 
      label: 'Confirmed', 
      className: 'bg-success/10 text-success border-success/20',
      icon: <Check className="w-3 h-3" />
    },
    pending: { 
      label: 'Pending', 
      className: 'bg-warning/10 text-warning border-warning/20',
      icon: <Clock className="w-3 h-3" />
    },
    cancelled: { 
      label: 'Cancelled', 
      className: 'bg-error/10 text-error border-error/20',
      icon: <X className="w-3 h-3" />
    },
    completed: { 
      label: 'Completed', 
      className: 'bg-success/10 text-success border-success/20',
      icon: <Check className="w-3 h-3" />
    }
  }

  const config = statusConfig[status]
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full border font-semibold uppercase tracking-wide',
      config.className,
      sizeClasses,
      className
    )}>
      {config.icon}
      {config.label}
    </span>
  )
}

// Metric Card Component
interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
  className?: string
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trend = 'neutral',
  icon,
  className = ''
}) => {
  const trendColors = {
    up: 'text-success',
    down: 'text-error',
    neutral: 'text-stone-500'
  }

  return (
    <LuxuryCard padding="md" className={className}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="caption mb-2">{title}</p>
          <p className="display-2 mb-1">{value}</p>
          {change && (
            <p className={cn('caption flex items-center gap-1', trendColors[trend])}>
              {trend === 'up' && <TrendingUp className="w-3 h-3" />}
              {trend === 'down' && <Activity className="w-3 h-3 rotate-180" />}
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="p-3 rounded-xl bg-gradient-to-br from-champagne-gold/10 to-warm-gold/10 text-champagne-gold">
            {icon}
          </div>
        )}
      </div>
    </LuxuryCard>
  )
}

// Appointment Card Component
interface AppointmentCardProps {
  appointment: {
    id: string
    clientName: string
    serviceName: string
    date: string
    time: string
    status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
    price: number
  }
  onClick?: () => void
  className?: string
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onClick,
  className = ''
}) => {
  return (
    <LuxuryCard 
      className={cn('cursor-pointer group', className)}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="heading-2 mb-1">{appointment.clientName}</h3>
          <p className="body-regular text-stone-600">{appointment.serviceName}</p>
        </div>
        <StatusBadge status={appointment.status} size="sm" />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-stone-500">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{appointment.date}</span>
          </div>
          <div className="flex items-center gap-2 text-stone-500">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{appointment.time}</span>
          </div>
        </div>
        <div className="font-semibold text-champagne-gold">
          £{appointment.price}
        </div>
      </div>
      
      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-champagne-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
    </LuxuryCard>
  )
}

// Service Selection Card
interface ServiceCardProps {
  service: {
    id: string
    name: string
    description: string
    duration: number
    price: number
    category: string
  }
  selected?: boolean
  onSelect?: () => void
  className?: string
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  selected = false,
  onSelect,
  className = ''
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={cn(
        'relative cursor-pointer transition-all duration-300 rounded-2xl border-2 p-6',
        selected 
          ? 'border-champagne-gold bg-champagne-gold/5 shadow-glow' 
          : 'border-stone-200 hover:border-champagne-gold/50 hover:shadow-md',
        className
      )}
    >
      {/* Selection Indicator */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute top-4 right-4 w-6 h-6 bg-champagne-gold rounded-full flex items-center justify-center text-ivory"
          >
            <Check className="w-4 h-4" />
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="mb-4">
        <h3 className="heading-2 mb-2">{service.name}</h3>
        <p className="body-regular text-stone-600 mb-3">{service.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-stone-500">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{service.duration} min</span>
            </div>
            <span className="caption px-2 py-1 bg-stone-100 rounded-full">
              {service.category}
            </span>
          </div>
          <div className="font-bold text-lg text-champagne-gold">
            £{service.price}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Loading Skeleton Components
export const LoadingSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={cn('animate-pulse bg-stone-200 rounded', className)} />
)

export const AppointmentCardSkeleton: React.FC = () => (
  <div className="card-luxury space-y-4">
    <div className="flex justify-between items-start">
      <div className="space-y-2 flex-1">
        <LoadingSkeleton className="h-6 w-32" />
        <LoadingSkeleton className="h-4 w-48" />
      </div>
      <LoadingSkeleton className="h-6 w-16 rounded-full" />
    </div>
    <div className="flex justify-between items-center">
      <div className="flex gap-4">
        <LoadingSkeleton className="h-4 w-20" />
        <LoadingSkeleton className="h-4 w-16" />
      </div>
      <LoadingSkeleton className="h-5 w-12" />
    </div>
  </div>
)

// Luxury Divider
export const LuxuryDivider: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={cn('luxury-divider', className)} />
)

// Premium Avatar Component
interface PremiumAvatarProps {
  src?: string
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export const PremiumAvatar: React.FC<PremiumAvatarProps> = ({
  src,
  name,
  size = 'md',
  className = ''
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  }

  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className={cn(
      'rounded-full border-2 border-champagne-gold/20 overflow-hidden flex items-center justify-center font-semibold bg-gradient-to-br from-champagne-gold/10 to-warm-gold/10 text-champagne-gold',
      sizes[size],
      className
    )}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </div>
  )
}

export default {
  PremiumButton,
  LuxuryCard,
  PremiumInput,
  StatusBadge,
  MetricCard,
  AppointmentCard,
  ServiceCard,
  LoadingSkeleton,
  AppointmentCardSkeleton,
  LuxuryDivider,
  PremiumAvatar
}
