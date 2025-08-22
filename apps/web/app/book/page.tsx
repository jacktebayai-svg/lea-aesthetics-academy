'use client'

import { useState, useEffect } from 'react'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CreditCard, 
  User, 
  Phone, 
  Mail, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Star,
  Award,
  Sparkles,
  Crown
} from 'lucide-react'
import { 
  format, 
  addDays, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  isBefore,
  startOfToday,
  parseISO
} from 'date-fns'
import { 
  LuxuryCard, 
  LuxuryButton, 
  LuxuryInput,
  LuxuryLoader,
  LuxuryBadge,
  fadeInUp,
  staggerContainer
} from '@/components/ui/luxury-components'
import { LEAHeader } from '@/components/layout/Header'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/auth/auth-provider'
import { AuthPrompt } from '@/components/auth/auth-prompt'
import { useBookingPersistence } from '@/hooks/use-booking-persistence'

interface Treatment {
  id: string
  name: string
  description: string
  duration: number
  price: number
  depositAmount: number
  category: string
  practitioner: {
    name: string
    title?: string
  }
}

interface TimeSlot {
  time: string
  available: boolean
}

export default function BookingPage() {
  const { user } = useAuth()
  const { bookingState, saveBookingState, clearBookingState, hasBookingData } = useBookingPersistence()
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [treatmentsLoading, setTreatmentsLoading] = useState(true)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)

  // Load treatments on component mount
  useEffect(() => {
    loadTreatments()
  }, [])

  // Restore booking state when available
  useEffect(() => {
    if (bookingState && treatments.length > 0) {
      // Restore treatment selection
      if (bookingState.treatmentId) {
        const treatment = treatments.find(t => t.id === bookingState.treatmentId)
        if (treatment) {
          setSelectedTreatment(treatment)
        }
      }
      
      // Restore date selection
      if (bookingState.selectedDate) {
        try {
          const date = new Date(bookingState.selectedDate)
          setSelectedDate(date)
          setCurrentMonth(date) // Also update calendar month
        } catch (error) {
          console.error('Failed to restore selected date:', error)
        }
      }
      
      // Restore time selection
      if (bookingState.selectedTime) {
        setSelectedTime(bookingState.selectedTime)
      }
    }
  }, [bookingState, treatments])

  // Load available time slots when date changes
  useEffect(() => {
    if (selectedDate && selectedTreatment) {
      loadAvailableSlots(selectedDate, selectedTreatment.id)
    }
  }, [selectedDate, selectedTreatment])

  const loadTreatments = async () => {
    try {
      setTreatmentsLoading(true)
      const response = await fetch('/api/public/treatments')
      const data = await response.json()
      
      // Mock data for development
      const mockTreatments: Treatment[] = [
        {
          id: '1',
          name: 'Anti-Wrinkle Treatment',
          description: 'Smooth fine lines and wrinkles with our premium anti-wrinkle treatment.',
          duration: 30,
          price: 25000,
          depositAmount: 5000,
          category: 'Injectables',
          practitioner: { name: 'Dr. Sarah Johnson', title: 'MD' }
        },
        {
          id: '2', 
          name: 'Dermal Fillers',
          description: 'Restore volume and enhance facial contours with dermal fillers.',
          duration: 45,
          price: 35000,
          depositAmount: 10000,
          category: 'Injectables',
          practitioner: { name: 'Dr. Sarah Johnson', title: 'MD' }
        },
        {
          id: '3',
          name: 'Luxury Facial',
          description: 'Rejuvenating facial treatment with premium skincare products.',
          duration: 60,
          price: 15000,
          depositAmount: 3000,
          category: 'Facial Treatments',
          practitioner: { name: 'Emma Thompson', title: 'Aesthetician' }
        },
        {
          id: '4',
          name: 'Chemical Peel',
          description: 'Professional chemical peel for skin renewal and brightening.',
          duration: 45,
          price: 20000,
          depositAmount: 5000,
          category: 'Facial Treatments',
          practitioner: { name: 'Emma Thompson', title: 'Aesthetician' }
        }
      ]
      
      setTreatments(data.treatments || mockTreatments)
    } catch (error) {
      console.error('Failed to load treatments:', error)
    } finally {
      setTreatmentsLoading(false)
    }
  }

  const loadAvailableSlots = async (date: Date, treatmentId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/public/availability?date=${format(date, 'yyyy-MM-dd')}&treatmentId=${treatmentId}`)
      const data = await response.json()
      
      // Mock available slots
      const mockSlots: TimeSlot[] = [
        { time: '09:00', available: true },
        { time: '10:00', available: true },
        { time: '11:00', available: false },
        { time: '14:00', available: true },
        { time: '15:00', available: true },
        { time: '16:00', available: true },
        { time: '17:00', available: false }
      ]
      
      setAvailableSlots(data.slots || mockSlots)
    } catch (error) {
      console.error('Failed to load availability:', error)
      setAvailableSlots([])
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = async () => {
    if (!selectedTreatment || !selectedDate || !selectedTime) {
      alert('Please select a service, date, and time')
      return
    }

    // Check if user is authenticated
    if (!user) {
      // Save current booking state before showing auth prompt
      saveBookingState({
        treatmentId: selectedTreatment.id,
        treatmentName: selectedTreatment.name,
        selectedDate: selectedDate.toISOString(),
        selectedTime: selectedTime,
        returnUrl: '/book'
      })
      setShowAuthPrompt(true)
      return
    }

    await proceedWithBooking()
  }

  const proceedWithBooking = async () => {
    try {
      setLoading(true)
      
      const bookingData = {
        serviceId: selectedTreatment!.id,
        scheduledAt: `${format(selectedDate!, 'yyyy-MM-dd')}T${selectedTime}:00.000Z`,
        notes: '',
        clientInfo: {
          firstName: user?.firstName,
          lastName: user?.lastName,
          email: user?.email,
          phone: user?.phone
        }
      }

      const response = await fetch('/api/public/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      })

      const result = await response.json()

      if (response.ok) {
        // Redirect to payment page
        if (result.appointment?.id) {
          window.location.href = `/payment?appointmentId=${result.appointment.id}`
        } else {
          // Fallback for different API response structure
          window.location.href = `/payment/${result.booking?.id || result.id}`
        }
      } else {
        throw new Error(result.error || 'Failed to create booking')
      }
    } catch (error) {
      console.error('Booking error:', error)
      alert('Failed to create booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAuthSuccess = async () => {
    setShowAuthPrompt(false)
    // Wait a moment for user state to update, then proceed with booking
    setTimeout(async () => {
      await proceedWithBooking()
      // Clear booking state after successful booking
      clearBookingState()
    }, 500)
  }

  // Calendar helper functions
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)
  
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate })
  
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }
  
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }
  
  const selectDate = (date: Date) => {
    if (isBefore(date, startOfToday())) return
    setSelectedDate(date)
    setSelectedTime(null) // Reset time when date changes
  }

  return (
    <div className="min-h-screen lea-gradient-bg">
      <LEAHeader />
      
      <main className="lea-container py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <Crown className="h-8 w-8 text-[#b45309] mr-3" />
            <h1 className="text-4xl font-bold lea-text-gradient">Book Your Treatment</h1>
          </div>
          <p className="text-xl text-[#78716c] max-w-3xl mx-auto">
            Select your desired service and preferred appointment time. Complete your booking with secure payment.
          </p>
          
          {/* Show booking restoration message if data was preserved */}
          {hasBookingData() && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4 inline-flex items-center px-4 py-2 bg-green-50 text-green-800 text-sm rounded-lg border border-green-200"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Your booking selections have been restored
            </motion.div>
          )}
        </motion.div>

        {/* Main Booking Interface */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="max-w-7xl mx-auto"
        >
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Services Selection */}
            <motion.div variants={fadeInUp}>
              <LuxuryCard variant="premium">
                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <Sparkles className="h-6 w-6 text-[#b45309] mr-3" />
                    <h2 className="text-2xl font-bold text-[#1c1917]">Choose Your Service</h2>
                  </div>
                  
                  {treatmentsLoading ? (
                    <div className="flex justify-center py-12">
                      <LuxuryLoader size="lg" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {treatments.map((treatment) => (
                        <motion.div key={treatment.id}>
                          <LuxuryCard 
                            variant={selectedTreatment?.id === treatment.id ? 'premium' : 'default'}
                            className={`cursor-pointer transition-all duration-300 ${
                              selectedTreatment?.id === treatment.id 
                                ? 'ring-2 ring-[#b45309] shadow-lg' 
                                : 'hover:shadow-md'
                            }`}
                            onClick={() => {
                              setSelectedTreatment(treatment)
                              setSelectedTime(null) // Reset time when treatment changes
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <h3 className="text-lg font-semibold text-[#1c1917]">{treatment.name}</h3>
                                  {selectedTreatment?.id === treatment.id && (
                                    <CheckCircle className="h-5 w-5 text-green-600 ml-2" />
                                  )}
                                </div>
                                <p className="text-sm text-[#78716c] mb-3">{treatment.description}</p>
                                <div className="flex items-center space-x-4 text-xs text-[#78716c]">
                                  <span className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {treatment.duration} mins
                                  </span>
                                  <span className="flex items-center">
                                    <User className="w-3 h-3 mr-1" />
                                    {treatment.practitioner.title} {treatment.practitioner.name}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <div className="text-xl font-bold lea-text-gradient">
                                  £{(treatment.price / 100).toFixed(2)}
                                </div>
                                <LuxuryBadge variant="gold" size="sm" className="mt-1">
                                  £{(treatment.depositAmount / 100).toFixed(2)} deposit
                                </LuxuryBadge>
                              </div>
                            </div>
                          </LuxuryCard>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </LuxuryCard>
            </motion.div>

            {/* Calendar and Time Selection */}
            <motion.div variants={fadeInUp}>
              <LuxuryCard variant="premium">
                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <CalendarIcon className="h-6 w-6 text-[#b45309] mr-3" />
                    <h2 className="text-2xl font-bold text-[#1c1917]">Select Date & Time</h2>
                  </div>

                  {/* Calendar */}
                  <div className="mb-8">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-[#1c1917]">
                        {format(currentMonth, 'MMMM yyyy')}
                      </h3>
                      <div className="flex space-x-2">
                        <LuxuryButton 
                          variant="ghost" 
                          size="sm" 
                          onClick={prevMonth}
                          leftIcon={<ChevronLeft className="h-4 w-4" />}
                        >
                          Previous
                        </LuxuryButton>
                        <LuxuryButton 
                          variant="ghost" 
                          size="sm" 
                          onClick={nextMonth}
                          rightIcon={<ChevronRight className="h-4 w-4" />}
                        >
                          Next
                        </LuxuryButton>
                      </div>
                    </div>

                    {/* Days of Week Header */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                        <div key={i} className="text-center text-xs font-medium text-[#78716c] p-2">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {dateRange.map((date, i) => {
                        const isCurrentMonth = isSameMonth(date, currentMonth)
                        const isSelected = selectedDate && isSameDay(date, selectedDate)
                        const isPast = isBefore(date, startOfToday())
                        const isCurrentDay = isToday(date)

                        return (
                          <button
                            key={i}
                            onClick={() => selectDate(date)}
                            disabled={isPast || !isCurrentMonth}
                            className={`
                              p-2 text-sm transition-all duration-200 rounded-lg
                              ${
                                isSelected
                                  ? 'bg-gradient-to-r from-[#b45309] to-[#d97706] text-white shadow-md'
                                  : isCurrentDay && isCurrentMonth
                                  ? 'bg-[#fef3c7] text-[#b45309] font-semibold'
                                  : isCurrentMonth && !isPast
                                  ? 'hover:bg-[#fefce8] text-[#1c1917]'
                                  : 'text-[#d6d3d1] cursor-not-allowed'
                              }
                            `}
                          >
                            {format(date, 'd')}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Time Slots */}
                  {selectedDate && selectedTreatment && (
                    <div>
                      <h3 className="text-lg font-semibold text-[#1c1917] mb-4">Available Times</h3>
                      {loading ? (
                        <div className="flex justify-center py-8">
                          <LuxuryLoader size="md" />
                        </div>
                      ) : availableSlots.length > 0 ? (
                        <div className="grid grid-cols-3 gap-3">
                          {availableSlots
                            .filter(slot => slot.available)
                            .map((slot) => (
                              <LuxuryButton
                                key={slot.time}
                                variant={selectedTime === slot.time ? 'primary' : 'ghost'}
                                size="sm"
                                className="py-3"
                                onClick={() => setSelectedTime(slot.time)}
                                leftIcon={<Clock className="h-3 w-3" />}
                              >
                                {slot.time}
                              </LuxuryButton>
                            ))}
                        </div>
                      ) : (
                        <LuxuryCard variant="glass" className="text-center py-6">
                          <Clock className="h-8 w-8 text-[#78716c] mx-auto mb-2" />
                          <p className="text-[#78716c]">No available times for this date.</p>
                        </LuxuryCard>
                      )}
                    </div>
                  )}

                  {/* Booking Summary & Action */}
                  {selectedTreatment && selectedDate && selectedTime && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="mt-8 pt-6 border-t border-[#e7e5e4]"
                    >
                      <div className="bg-gradient-to-r from-[#fefce8] to-[#fef3c7] rounded-lg p-4 mb-6">
                        <div className="flex items-center mb-3">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                          <h4 className="font-semibold text-[#1c1917]">Booking Summary</h4>
                        </div>
                        <div className="space-y-2 text-sm">
                          {user && (
                            <div className="flex justify-between">
                              <span className="text-[#78716c]">Client:</span>
                              <span className="font-medium text-[#1c1917]">
                                {user.firstName} {user.lastName}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-[#78716c]">Service:</span>
                            <span className="font-medium text-[#1c1917]">{selectedTreatment.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#78716c]">Date:</span>
                            <span className="font-medium text-[#1c1917]">
                              {format(selectedDate, 'EEEE, MMMM do, yyyy')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#78716c]">Time:</span>
                            <span className="font-medium text-[#1c1917]">{selectedTime}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-[#e7e5e4]">
                            <span className="font-medium text-[#1c1917]">Total:</span>
                            <span className="font-bold text-xl lea-text-gradient">
                              £{(selectedTreatment.price / 100).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <LuxuryButton
                        variant="primary"
                        size="lg"
                        className="w-full"
                        isLoading={loading}
                        onClick={handleBooking}
                        rightIcon={<ArrowRight className="h-4 w-4" />}
                      >
                        {loading ? 'Processing...' : user ? 'Book & Pay' : 'Sign in to Book'}
                      </LuxuryButton>
                    </motion.div>
                  )}

                  {/* Instructions */}
                  {(!selectedTreatment || !selectedDate) && (
                    <div className="mt-8 pt-6 border-t border-[#e7e5e4]">
                      <div className="flex items-center text-[#78716c]">
                        <Star className="h-4 w-4 mr-2" />
                        <p className="text-sm">
                          {!selectedTreatment 
                            ? "Please select a service to see available appointment times."
                            : "Please select a date to see available time slots."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </LuxuryCard>
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* Authentication Prompt */}
      <AuthPrompt
        isOpen={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        onSuccess={handleAuthSuccess}
        mode="signin"
        title="Sign in to complete your booking"
        message="Create an account or sign in to book your appointment and access your treatment history."
      />
    </div>
  )
}
