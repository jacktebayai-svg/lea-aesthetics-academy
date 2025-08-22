'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

export interface BookingState {
  treatmentId?: string
  treatmentName?: string
  selectedDate?: string
  selectedTime?: string
  returnUrl?: string
}

const BOOKING_STORAGE_KEY = 'lea_booking_state'
const BOOKING_URL_PARAM = 'booking_data'

export function useBookingPersistence() {
  const [bookingState, setBookingState] = useState<BookingState | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Load booking state from localStorage or URL params on mount
  useEffect(() => {
    // First check URL params (higher priority)
    const bookingDataParam = searchParams.get(BOOKING_URL_PARAM)
    if (bookingDataParam) {
      try {
        const decoded = decodeURIComponent(bookingDataParam)
        const parsed = JSON.parse(decoded)
        setBookingState(parsed)
        
        // Also save to localStorage for future use
        localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(parsed))
        
        // Clean up URL to remove booking data param
        const newParams = new URLSearchParams(searchParams.toString())
        newParams.delete(BOOKING_URL_PARAM)
        const newUrl = `${pathname}${newParams.toString() ? '?' + newParams.toString() : ''}`
        router.replace(newUrl, { scroll: false })
        
        return
      } catch (error) {
        console.error('Failed to parse booking data from URL:', error)
      }
    }

    // Fallback to localStorage
    try {
      const stored = localStorage.getItem(BOOKING_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setBookingState(parsed)
      }
    } catch (error) {
      console.error('Failed to load booking state from localStorage:', error)
    }
  }, [searchParams, router, pathname])

  // Save booking state to localStorage
  const saveBookingState = (state: BookingState) => {
    try {
      localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(state))
      setBookingState(state)
    } catch (error) {
      console.error('Failed to save booking state:', error)
    }
  }

  // Clear booking state
  const clearBookingState = () => {
    try {
      localStorage.removeItem(BOOKING_STORAGE_KEY)
      setBookingState(null)
    } catch (error) {
      console.error('Failed to clear booking state:', error)
    }
  }

  // Create a URL with booking data encoded as parameter
  const createBookingUrl = (baseUrl: string, state: BookingState) => {
    try {
      const encoded = encodeURIComponent(JSON.stringify(state))
      const separator = baseUrl.includes('?') ? '&' : '?'
      return `${baseUrl}${separator}${BOOKING_URL_PARAM}=${encoded}`
    } catch (error) {
      console.error('Failed to create booking URL:', error)
      return baseUrl
    }
  }

  // Redirect to auth with booking data preserved
  const redirectToAuth = (mode: 'signin' | 'signup' = 'signin', state?: BookingState) => {
    const currentState = state || bookingState
    if (currentState) {
      // Save current state
      saveBookingState({ ...currentState, returnUrl: pathname })
      
      // Create auth URL with booking data
      const authUrl = mode === 'signin' ? '/auth/signin' : '/auth/signup'
      const urlWithBookingData = createBookingUrl(authUrl, currentState)
      
      router.push(urlWithBookingData)
    } else {
      // No booking data to preserve, just redirect
      router.push(mode === 'signin' ? '/auth/signin' : '/auth/signup')
    }
  }

  // Get return URL from booking state or default to current page
  const getReturnUrl = (fallback: string = '/book') => {
    return bookingState?.returnUrl || fallback
  }

  // Check if there's preserved booking data
  const hasBookingData = () => {
    return bookingState && (
      bookingState.treatmentId || 
      bookingState.selectedDate || 
      bookingState.selectedTime
    )
  }

  // Get booking data as query parameters for forms
  const getBookingParams = () => {
    if (!bookingState) return {}
    
    return {
      treatmentId: bookingState.treatmentId,
      selectedDate: bookingState.selectedDate,
      selectedTime: bookingState.selectedTime,
    }
  }

  return {
    bookingState,
    saveBookingState,
    clearBookingState,
    redirectToAuth,
    createBookingUrl,
    getReturnUrl,
    hasBookingData,
    getBookingParams,
  }
}
