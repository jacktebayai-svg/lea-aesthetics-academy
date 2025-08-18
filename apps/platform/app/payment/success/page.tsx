'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Calendar, BookOpen, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface PaymentDetails {
  type: 'booking' | 'course'
  itemName: string
  amount: number
  paymentId: string
  status: string
  itemId: string
}

export default function PaymentSuccessPage() {
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentIntentId = searchParams.get('payment_intent')

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (!paymentIntentId) {
        setError('No payment information found')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/payment/verify?payment_intent=${paymentIntentId}`, {
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          setPaymentDetails(data)
        } else {
          setError('Unable to verify payment details')
        }
      } catch (error) {
        console.error('Error fetching payment details:', error)
        setError('Error loading payment information')
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentDetails()
  }, [paymentIntentId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Payment Verification Failed</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push('/dashboard')} 
              className="w-full"
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!paymentDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-slate-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>No Payment Details</CardTitle>
            <CardDescription>Unable to load payment information</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push('/dashboard')} 
              className="w-full"
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isBooking = paymentDetails.type === 'booking'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 px-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-700">
            Payment Successful!
          </CardTitle>
          <CardDescription className="text-lg">
            {isBooking 
              ? 'Your booking has been confirmed'
              : 'Your course enrollment is complete'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold text-lg mb-4">Payment Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {isBooking ? 'Treatment' : 'Course'}:
                </span>
                <span className="font-medium">{paymentDetails.itemName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-semibold text-green-600">
                  £{paymentDetails.amount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment ID:</span>
                <span className="font-mono text-sm">{paymentDetails.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-green-600 capitalize">
                  {paymentDetails.status.toLowerCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              {isBooking ? (
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              ) : (
                <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
              )}
              What's Next?
            </h3>
            
            {isBooking ? (
              <div className="space-y-3">
                <p className="text-blue-800">
                  ✅ Your booking deposit has been processed successfully
                </p>
                <p className="text-blue-800">
                  📧 You'll receive a confirmation email shortly
                </p>
                <p className="text-blue-800">
                  📅 The practitioner will contact you to schedule your appointment
                </p>
                <p className="text-blue-800">
                  💳 The remaining balance will be due on your appointment day
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-blue-800">
                  ✅ Your course enrollment is confirmed
                </p>
                <p className="text-blue-800">
                  📧 Welcome email with course details sent to your inbox
                </p>
                <p className="text-blue-800">
                  📚 Access your course materials in the student dashboard
                </p>
                <p className="text-blue-800">
                  🎓 Start learning at your own pace
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              asChild 
              className="flex-1"
            >
              <Link href="/dashboard">
                Go to Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            
            {isBooking ? (
              <Button 
                variant="outline" 
                asChild 
                className="flex-1"
              >
                <Link href="/bookings">
                  View My Bookings
                </Link>
              </Button>
            ) : (
              <Button 
                variant="outline" 
                asChild 
                className="flex-1"
              >
                <Link href="/courses/my-courses">
                  Access Course
                </Link>
              </Button>
            )}
          </div>

          {/* Contact Information */}
          <div className="text-center text-sm text-gray-600 pt-4 border-t">
            <p>
              Need help? Contact us at{' '}
              <a 
                href="mailto:support@leaaesthetics.com" 
                className="text-blue-600 hover:text-blue-500"
              >
                support@leaaesthetics.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
