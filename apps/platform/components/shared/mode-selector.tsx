'use client'

import { useState } from 'react'
import { User, ActiveMode } from '@/lib/auth/auth-provider'
import { cn } from '@/lib/utils'
import { 
  Stethoscope, 
  GraduationCap, 
  ChevronDown,
  Zap,
  Users,
  BookOpen,
  Calendar
} from 'lucide-react'

interface ModeSelectorProps {
  user: User
  activeMode: ActiveMode
  onModeChange: (mode: ActiveMode) => void
}

export function ModeSelector({ user, activeMode, onModeChange }: ModeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const availableModes = user.roles.filter((role): role is ActiveMode => 
    role === 'PRACTITIONER' || role === 'EDUCATOR'
  )

  if (availableModes.length <= 1) {
    return null // Don't show selector if user only has one mode
  }

  const modes = {
    PRACTITIONER: {
      label: 'Practitioner Mode',
      icon: Stethoscope,
      description: 'Manage clients, bookings & treatments',
      color: 'bg-blue-500',
      features: ['Client Management', 'Smart Booking', 'Treatment History']
    },
    EDUCATOR: {
      label: 'Educator Mode', 
      icon: GraduationCap,
      description: 'Manage courses, students & certifications',
      color: 'bg-purple-500',
      features: ['Course Builder', 'Student Progress', 'Certifications']
    }
  }

  return (
    <div className="relative">
      {/* Current Mode Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center space-x-3 px-4 py-2 rounded-lg border transition-all duration-200",
          "bg-surface hover:bg-surface-elevated border-border",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        )}
      >
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white", modes[activeMode].color)}>
          {modes[activeMode].icon && <modes[activeMode].icon className="w-4 h-4" />}
        </div>
        <div className="text-left">
          <div className="text-sm font-medium text-foreground">
            {modes[activeMode].label}
          </div>
          <div className="text-xs text-muted-foreground">
            {modes[activeMode].description}
          </div>
        </div>
        <ChevronDown className={cn(
          "w-4 h-4 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute top-full mt-2 right-0 w-80 bg-surface border border-border rounded-lg shadow-lg z-20 overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-medium text-foreground flex items-center space-x-2">
                <Zap className="w-4 h-4 text-primary" />
                <span>Switch Mode</span>
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Choose your active business mode
              </p>
            </div>
            
            <div className="p-2">
              {availableModes.map((mode) => {
                const modeData = modes[mode]
                const isActive = mode === activeMode
                
                return (
                  <button
                    key={mode}
                    onClick={() => {
                      if (!isActive) {
                        onModeChange(mode)
                      }
                      setIsOpen(false)
                    }}
                    disabled={isActive}
                    className={cn(
                      "w-full p-4 rounded-lg transition-all duration-200 text-left",
                      "hover:bg-surface-elevated focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                      isActive && "bg-primary/10 ring-1 ring-primary/20",
                      !isActive && "hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center text-white",
                        modeData.color,
                        isActive && "ring-2 ring-primary/50"
                      )}>
                        <modeData.icon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className={cn(
                            "font-medium",
                            isActive ? "text-primary" : "text-foreground"
                          )}>
                            {modeData.label}
                          </h4>
                          {isActive && (
                            <span className="px-2 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {modeData.description}
                        </p>
                        
                        <div className="flex items-center space-x-4 mt-2">
                          {modeData.features.map((feature, index) => (
                            <span
                              key={index}
                              className="text-xs text-muted-foreground flex items-center space-x-1"
                            >
                              <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                              <span>{feature}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
            
            <div className="p-4 border-t border-border bg-muted/20">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Mode settings are saved automatically</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>Synced</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
