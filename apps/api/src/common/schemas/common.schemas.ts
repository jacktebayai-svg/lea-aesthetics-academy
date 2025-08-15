import { z } from 'zod';

// Common field validations
export const UuidSchema = z.string().uuid('Invalid UUID format');
export const EmailSchema = z.string().email('Invalid email address');
export const PhoneSchema = z.string().regex(
  /^[\+]?[(]?[\+]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{4,6}$/,
  'Invalid phone number format'
);

// Pagination schemas
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const PaginatedResponseSchema = z.object({
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    totalCount: z.number(),
    totalPages: z.number(),
    hasNextPage: z.boolean(),
    hasPreviousPage: z.boolean(),
  }),
});

// Date/time schemas
export const DateTimeSchema = z.string().datetime('Invalid datetime format');
export const DateSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  'Invalid date format (YYYY-MM-DD expected)'
);
export const TimeSchema = z.string().regex(
  /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  'Invalid time format (HH:MM expected)'
);

// Address schema
export const AddressSchema = z.object({
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  county: z.string().optional(),
  postcode: z.string().min(1, 'Postcode is required'),
  country: z.string().min(2).max(2, 'Country code must be 2 characters'),
});

// Personal information schema
export const PersonalInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: EmailSchema,
  phone: PhoneSchema.optional(),
  dateOfBirth: DateSchema.optional(),
});

// Medical information schemas
export const MedicalHistoryItemSchema = z.object({
  condition: z.string().min(1, 'Medical condition is required'),
  diagnosedDate: DateSchema.optional(),
  medications: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export const AllergySchema = z.object({
  substance: z.string().min(1, 'Allergen substance is required'),
  severity: z.enum(['mild', 'moderate', 'severe']),
  reaction: z.string().optional(),
});

// Service and appointment schemas
export const ServiceCategorySchema = z.enum([
  'BOTOX',
  'DERMAL_FILLERS',
  'CHEMICAL_PEELS',
  'MICRONEEDLING',
  'LASER_TREATMENTS',
  'SKIN_ANALYSIS',
  'CONSULTATION',
  'TRAINING_COURSE',
  'OTHER'
]);

export const ServiceSchema = z.object({
  name: z.string().min(1, 'Service name is required').max(100),
  description: z.string().max(500).optional(),
  category: ServiceCategorySchema,
  durationMin: z.number().int().min(15, 'Minimum duration is 15 minutes').max(480),
  basePrice: z.number().int().min(0, 'Price must be non-negative'),
  bufferTimeMin: z.number().int().min(0).max(60).default(0),
  requiresConsultation: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const AppointmentStatusSchema = z.enum([
  'DRAFT',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW'
]);

// User and authentication schemas
export const UserRoleSchema = z.enum([
  'OWNER',
  'MANAGER',
  'PRACTITIONER',
  'FRONTDESK',
  'FINANCE',
  'STUDENT',
  'CLIENT'
]);

export const CreateUserSchema = z.object({
  email: EmailSchema,
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  role: UserRoleSchema,
  phone: PhoneSchema.optional(),
});

// Payment and financial schemas
export const CurrencySchema = z.enum(['GBP', 'USD', 'EUR']);

export const PaymentStatusSchema = z.enum([
  'PENDING',
  'PROCESSING',
  'SUCCEEDED',
  'FAILED',
  'CANCELLED',
  'REFUNDED',
  'PARTIALLY_REFUNDED'
]);

export const PaymentIntentSchema = z.object({
  amount: z.number().int().min(100, 'Minimum amount is £1.00'), // Amount in pence
  currency: CurrencySchema.default('GBP'),
  description: z.string().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

// File upload schemas
export const FileTypeSchema = z.enum([
  'CONSENT_FORM',
  'MEDICAL_HISTORY',
  'TREATMENT_PLAN',
  'CERTIFICATE',
  'INVOICE',
  'COURSE_MATERIAL',
  'PROFILE_IMAGE',
  'BEFORE_AFTER_PHOTO',
  'OTHER'
]);

export const FileUploadSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  contentType: z.string().min(1, 'Content type is required'),
  fileType: FileTypeSchema,
  clientId: UuidSchema.optional(),
  appointmentId: UuidSchema.optional(),
  courseId: UuidSchema.optional(),
  isPublic: z.boolean().default(false),
});

// Learning Management System schemas
export const CourseLevelSchema = z.enum([
  'BEGINNER',
  'INTERMEDIATE',
  'ADVANCED',
  'EXPERT'
]);

export const CourseStatusSchema = z.enum([
  'DRAFT',
  'PUBLISHED',
  'ARCHIVED'
]);

export const AssessmentTypeSchema = z.enum([
  'MULTIPLE_CHOICE',
  'TRUE_FALSE',
  'SHORT_ANSWER',
  'ESSAY',
  'PRACTICAL'
]);

export const CreateCourseSchema = z.object({
  title: z.string().min(1, 'Course title is required').max(200),
  description: z.string().max(1000).optional(),
  level: CourseLevelSchema,
  durationHours: z.number().min(0.5).max(1000),
  price: z.number().int().min(0),
  maxStudents: z.number().int().min(1).max(1000).optional(),
  prerequisites: z.array(UuidSchema).default([]),
  isAccredited: z.boolean().default(false),
  accreditationBody: z.string().optional(),
});

// Error response schema
export const ErrorResponseSchema = z.object({
  statusCode: z.number(),
  timestamp: z.string(),
  path: z.string(),
  method: z.string(),
  message: z.union([z.string(), z.array(z.string())]),
  error: z.string(),
  correlationId: z.string(),
  details: z.any().optional(),
});

// Success response wrapper
export const SuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean().default(true),
    data: dataSchema,
    message: z.string().optional(),
  });

// Tenant configuration schema
export const TenantConfigSchema = z.object({
  name: z.string().min(1, 'Tenant name is required'),
  slug: z.string().min(1, 'Tenant slug is required').regex(
    /^[a-z0-9-]+$/,
    'Slug must contain only lowercase letters, numbers, and hyphens'
  ),
  domain: z.string().min(1, 'Domain is required'),
  settings: z.object({
    timezone: z.string().default('Europe/London'),
    currency: CurrencySchema.default('GBP'),
    locale: z.string().default('en-GB'),
    businessHours: z.object({
      monday: z.object({ start: TimeSchema, end: TimeSchema }).nullable(),
      tuesday: z.object({ start: TimeSchema, end: TimeSchema }).nullable(),
      wednesday: z.object({ start: TimeSchema, end: TimeSchema }).nullable(),
      thursday: z.object({ start: TimeSchema, end: TimeSchema }).nullable(),
      friday: z.object({ start: TimeSchema, end: TimeSchema }).nullable(),
      saturday: z.object({ start: TimeSchema, end: TimeSchema }).nullable(),
      sunday: z.object({ start: TimeSchema, end: TimeSchema }).nullable(),
    }),
    bookingSettings: z.object({
      allowOnlineBooking: z.boolean().default(true),
      requireDeposit: z.boolean().default(true),
      depositPercentage: z.number().min(0).max(100).default(20),
      cancellationHours: z.number().int().min(0).max(168).default(24),
      maxAdvanceBookingDays: z.number().int().min(1).max(365).default(90),
    }),
  }),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
export type PaginatedResponse<T> = {
  data: T[];
  pagination: z.infer<typeof PaginatedResponseSchema>['pagination'];
};
export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;
export type Address = z.infer<typeof AddressSchema>;
export type MedicalHistoryItem = z.infer<typeof MedicalHistoryItemSchema>;
export type ServiceCategory = z.infer<typeof ServiceCategorySchema>;
export type AppointmentStatus = z.infer<typeof AppointmentStatusSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
export type FileType = z.infer<typeof FileTypeSchema>;
export type CourseLevel = z.infer<typeof CourseLevelSchema>;
export type TenantConfig = z.infer<typeof TenantConfigSchema>;
