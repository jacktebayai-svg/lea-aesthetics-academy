'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { z } from 'zod';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Form validation schema
const enrollmentSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  emergency_contact: z.object({
    name: z.string().min(1, 'Emergency contact name is required'),
    phone: z.string().min(10, 'Emergency contact phone is required'),
    relationship: z.string().min(1, 'Relationship is required')
  })
});

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  duration_hours: number;
  max_students: number;
  curriculum: any;
  prerequisites: any;
  available_slots: number | null;
}

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  emergency_contact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

function EnrollmentForm({ course }: { course: Course }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const supabase = createClient();
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phone: '',
    emergency_contact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processingPayment, setProcessingPayment] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, any>),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    try {
      enrollmentSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          const path = err.path.join('.');
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setProcessingPayment(true);

    try {
      // For free courses, enroll directly
      if (course.price === 0) {
        const response = await fetch(`/api/courses/${course.id}/enroll`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            student_info: formData
          })
        });

        if (!response.ok) {
          throw new Error('Enrollment failed');
        }

        const { data } = await response.json();
        
        // Redirect to success page
        router.push(`/academy/courses/${course.slug}/enroll/success?enrollment_id=${data.enrollment_id}`);
        return;
      }

      // For paid courses, process payment with Stripe
      if (!stripe || !elements) {
        throw new Error('Stripe not loaded');
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
        },
      });

      if (paymentMethodError) {
        throw new Error(paymentMethodError.message);
      }

      // Create enrollment with payment
      const response = await fetch(`/api/courses/${course.id}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_method_id: paymentMethod.id,
          student_info: formData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Enrollment failed');
      }

      const { data } = await response.json();

      if (data.requires_payment && data.client_secret) {
        // Confirm payment
        const { error: confirmError } = await stripe.confirmCardPayment(data.client_secret);
        
        if (confirmError) {
          throw new Error(confirmError.message);
        }
      }

      // Redirect to success page
      router.push(`/academy/courses/${course.slug}/enroll/success?enrollment_id=${data.enrollment_id}`);

    } catch (error) {
      console.error('Enrollment error:', error);
      setErrors({ 
        form: error instanceof Error ? error.message : 'An error occurred during enrollment'
      });
    } finally {
      setLoading(false);
      setProcessingPayment(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.form && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{errors.form}</p>
        </div>
      )}

      {/* Personal Information */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                errors.firstName ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            />
            {errors.firstName && <p className="text-red-600 text-xs mt-1">{errors.firstName}</p>}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                errors.lastName ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            />
            {errors.lastName && <p className="text-red-600 text-xs mt-1">{errors.lastName}</p>}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                errors.phone ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            />
            {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="emergencyName" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="emergencyName"
              value={formData.emergency_contact.name}
              onChange={(e) => handleInputChange('emergency_contact.name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                errors['emergency_contact.name'] ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            />
            {errors['emergency_contact.name'] && (
              <p className="text-red-600 text-xs mt-1">{errors['emergency_contact.name']}</p>
            )}
          </div>

          <div>
            <label htmlFor="emergencyPhone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              id="emergencyPhone"
              value={formData.emergency_contact.phone}
              onChange={(e) => handleInputChange('emergency_contact.phone', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                errors['emergency_contact.phone'] ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            />
            {errors['emergency_contact.phone'] && (
              <p className="text-red-600 text-xs mt-1">{errors['emergency_contact.phone']}</p>
            )}
          </div>

          <div>
            <label htmlFor="emergencyRelationship" className="block text-sm font-medium text-gray-700 mb-2">
              Relationship *
            </label>
            <select
              id="emergencyRelationship"
              value={formData.emergency_contact.relationship}
              onChange={(e) => handleInputChange('emergency_contact.relationship', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                errors['emergency_contact.relationship'] ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Select relationship</option>
              <option value="parent">Parent</option>
              <option value="spouse">Spouse/Partner</option>
              <option value="sibling">Sibling</option>
              <option value="friend">Friend</option>
              <option value="other">Other</option>
            </select>
            {errors['emergency_contact.relationship'] && (
              <p className="text-red-600 text-xs mt-1">{errors['emergency_contact.relationship']}</p>
            )}
          </div>
        </div>
      </div>

      {/* Payment Information */}
      {course.price > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
          
          <div className="mb-4">
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <span className="font-medium text-gray-900">Total Amount:</span>
              <span className="text-2xl font-bold text-purple-600">
                £{(course.price / 100).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                },
              }}
            />
          </div>
          
          <p className="text-sm text-gray-500 mt-2">
            Your payment is secure and encrypted. We accept all major credit and debit cards.
          </p>
        </div>
      )}

      {/* Terms and Conditions */}
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="terms"
            required
            className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
          <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
            I agree to the <a href="/terms" className="text-purple-600 underline">Terms and Conditions</a> and 
            <a href="/privacy" className="text-purple-600 underline ml-1">Privacy Policy</a>. 
            I understand that this enrollment is subject to LEA Aesthetics Academy's cancellation policy.
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200"
        >
          Back
        </button>
        
        <button
          type="submit"
          disabled={loading || !stripe}
          className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {processingPayment ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </span>
          ) : course.price === 0 ? (
            'Enroll Free'
          ) : (
            `Pay £${(course.price / 100).toFixed(2)} & Enroll`
          )}
        </button>
      </div>
    </form>
  );
}

export default function EnrollPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourse();
  }, [slug]);

  const fetchCourse = async () => {
    try {
      setLoading(true);

      // Fetch course by slug
      const response = await fetch(`/api/courses?active=true`);
      if (!response.ok) {
        throw new Error('Failed to fetch course');
      }

      const { data: courses } = await response.json();
      const foundCourse = courses?.find((c: Course) => c.slug === slug);
      
      if (!foundCourse) {
        throw new Error('Course not found');
      }

      // Check if course is available
      if (foundCourse.available_slots !== null && foundCourse.available_slots <= 0) {
        setError('This course is currently full. Please check back later.');
        return;
      }

      setCourse(foundCourse);
    } catch (err) {
      console.error('Error fetching course:', err);
      setError('Failed to load course information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">😞</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Course Unavailable</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/academy')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Browse Other Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Enroll in Course</h1>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-purple-600 mb-2">{course.title}</h2>
            <p className="text-gray-600 mb-4">{course.description}</p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <span>⏱️ {course.duration_hours} hours</span>
              <span>💰 {course.price === 0 ? 'Free' : `£${(course.price / 100).toFixed(2)}`}</span>
              {course.max_students && (
                <span>📍 {course.available_slots} spots remaining</span>
              )}
            </div>
          </div>
        </div>

        {/* Enrollment Form */}
        <Elements stripe={stripePromise}>
          <EnrollmentForm course={course} />
        </Elements>
      </div>
    </div>
  );
}
