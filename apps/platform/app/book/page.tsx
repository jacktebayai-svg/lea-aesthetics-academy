'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, CreditCard, User, Phone, Mail } from 'lucide-react'
import { format, addDays, startOfToday } from 'date-fns'

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
  const [step, setStep] = useState(1) // 1: Treatment, 2: Date/Time, 3: Details, 4: Payment
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)

  const [clientDetails, setClientDetails] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  })

  // Load treatments on component mount
  useEffect(() => {
    loadTreatments()
  }, [])

  // Load available time slots when date changes
  useEffect(() => {
    if (selectedDate && selectedTreatment) {
      loadAvailableSlots(selectedDate, selectedTreatment.id)
    }
  }, [selectedDate, selectedTreatment])

  const loadTreatments = async () => {
    try {
      const response = await fetch('/api/public/treatments')
      const data = await response.json()
      setTreatments(data.treatments || [])
    } catch (error) {
      console.error('Failed to load treatments:', error)
    }
  }

  const loadAvailableSlots = async (date: Date, treatmentId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/public/availability?date=${format(date, 'yyyy-MM-dd')}&treatmentId=${treatmentId}`)
      const data = await response.json()
      setAvailableSlots(data.slots || [])
    } catch (error) {
      console.error('Failed to load availability:', error)
      setAvailableSlots([])
    } finally {
      setLoading(false)
    }
  }

  const handleBookingSubmit = async () => {
    if (!selectedTreatment || !selectedDate || !selectedTime || !clientDetails.name || !clientDetails.email) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      
      const bookingData = {
        treatmentId: selectedTreatment.id,
        dateTime: `${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}`,
        clientName: clientDetails.name,
        clientEmail: clientDetails.email,
        clientPhone: clientDetails.phone,
        notes: clientDetails.notes
      }

      const response = await fetch('/api/public/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      })

      const result = await response.json()

      if (response.ok) {
        // Redirect to payment page
        window.location.href = `/payment/${result.booking.id}`
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

  const nextWeek = Array.from({ length: 7 }, (_, i) => addDays(startOfToday(), i))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Book Your Treatment</h1>
          <p className="text-gray-600 mt-2">Professional aesthetic treatments with expert care</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNum 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {stepNum}
              </div>
              {stepNum < 4 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  step > stepNum ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Choose Your Treatment</h2>
              <div className="grid gap-4">
                {treatments.map((treatment) => (
                  <div
                    key={treatment.id}
                    onClick={() => {
                      setSelectedTreatment(treatment)
                      setStep(2)
                    }}
                    className="border rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{treatment.name}</h3>
                        <p className="text-gray-600 mt-1">{treatment.description}</p>
                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {treatment.duration} minutes
                          </span>
                          <span className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {treatment.practitioner.title} {treatment.practitioner.name}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-blue-600">
                          £{(treatment.price / 100).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Deposit: £{(treatment.depositAmount / 100).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && selectedTreatment && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Select Date & Time</h2>
                <button
                  onClick={() => setStep(1)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Change Treatment
                </button>
              </div>

              {/* Selected Treatment Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium">{selectedTreatment.name}</h3>
                <p className="text-sm text-gray-600">
                  {selectedTreatment.duration} minutes • £{(selectedTreatment.price / 100).toFixed(2)}
                </p>
              </div>

              {/* Date Selection */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Choose Date</h3>
                <div className="grid grid-cols-7 gap-2">
                  {nextWeek.map((date) => (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(date)}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        selectedDate?.toDateString() === date.toDateString()
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-sm font-medium">{format(date, 'EEE')}</div>
                      <div className="text-lg">{format(date, 'd')}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div>
                  <h3 className="font-medium mb-3">Choose Time</h3>
                  {loading ? (
                    <div className="text-center py-4">Loading available times...</div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2">
                      {availableSlots
                        .filter(slot => slot.available)
                        .map((slot) => (
                          <button
                            key={slot.time}
                            onClick={() => {
                              setSelectedTime(slot.time)
                              setStep(3)
                            }}
                            className="p-2 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-center transition-all"
                          >
                            {slot.time}
                          </button>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No available times for this date. Please select another date.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Your Details</h2>
                <button
                  onClick={() => setStep(2)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Change Time
                </button>
              </div>

              {/* Booking Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium">{selectedTreatment?.name}</h3>
                <div className="text-sm text-gray-600 mt-1">
                  {selectedDate && format(selectedDate, 'EEEE, MMMM do, yyyy')} at {selectedTime}
                </div>
              </div>

              {/* Client Details Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={clientDetails.name}
                    onChange={(e) => setClientDetails({...clientDetails, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={clientDetails.email}
                    onChange={(e) => setClientDetails({...clientDetails, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={clientDetails.phone}
                    onChange={(e) => setClientDetails({...clientDetails, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="07XXX XXXXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={clientDetails.notes}
                    onChange={(e) => setClientDetails({...clientDetails, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any specific requests or medical information we should know..."
                  />
                </div>

                <button
                  onClick={handleBookingSubmit}
                  disabled={!clientDetails.name || !clientDetails.email || loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Creating Booking...' : 'Proceed to Payment'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
