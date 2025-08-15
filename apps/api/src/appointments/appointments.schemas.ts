import { z } from 'zod';
import { 
  UuidSchema, 
  DateTimeSchema,
  PaginationQuerySchema,
  AppointmentStatusSchema,
} from '../common/schemas/common.schemas';

// Create appointment request schema
export const CreateAppointmentSchema = z.object({
  clientId: UuidSchema,
  practitionerId: UuidSchema,
  serviceId: UuidSchema,
  locationId: UuidSchema.optional(),
  startTs: DateTimeSchema,
  endTs: DateTimeSchema,
  notes: z.string().max(1000).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
}).refine(
  (data) => {
    const start = new Date(data.startTs);
    const end = new Date(data.endTs);
    return end > start;
  },
  {
    message: 'End time must be after start time',
    path: ['endTs'],
  }
).refine(
  (data) => {
    const start = new Date(data.startTs);
    const now = new Date();
    return start > now;
  },
  {
    message: 'Appointment must be scheduled for a future time',
    path: ['startTs'],
  }
);

// Update appointment request schema
export const UpdateAppointmentSchema = z.object({
  practitionerId: UuidSchema.optional(),
  serviceId: UuidSchema.optional(),
  locationId: UuidSchema.optional(),
  startTs: DateTimeSchema.optional(),
  endTs: DateTimeSchema.optional(),
  status: AppointmentStatusSchema.optional(),
  notes: z.string().max(1000).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
}).refine(
  (data) => {
    if (data.startTs && data.endTs) {
      const start = new Date(data.startTs);
      const end = new Date(data.endTs);
      return end > start;
    }
    return true;
  },
  {
    message: 'End time must be after start time',
    path: ['endTs'],
  }
);

// List appointments query schema
export const ListAppointmentsQuerySchema = PaginationQuerySchema.extend({
  status: AppointmentStatusSchema.optional(),
  practitionerId: UuidSchema.optional(),
  clientId: UuidSchema.optional(),
  serviceId: UuidSchema.optional(),
  dateFrom: DateTimeSchema.optional(),
  dateTo: DateTimeSchema.optional(),
  includeCompleted: z.coerce.boolean().default(false),
});

// Appointment response schema
export const AppointmentResponseSchema = z.object({
  id: UuidSchema,
  tenantId: UuidSchema,
  clientId: UuidSchema,
  practitionerId: UuidSchema,
  serviceId: UuidSchema,
  locationId: UuidSchema.nullable(),
  startTs: DateTimeSchema,
  endTs: DateTimeSchema,
  status: AppointmentStatusSchema,
  notes: z.string().nullable(),
  metadata: z.record(z.string(), z.any()).nullable(),
  policyVersion: z.number(),
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema,
  
  // Relations (optional in response)
  client: z.object({
    id: UuidSchema,
    personal: z.object({
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().email(),
      phone: z.string().nullable(),
    }),
  }).optional(),
  
  practitioner: z.object({
    id: UuidSchema,
    profile: z.object({
      displayName: z.string(),
      specialties: z.array(z.string()),
    }),
  }).optional(),
  
  service: z.object({
    id: UuidSchema,
    name: z.string(),
    category: z.string(),
    durationMin: z.number(),
    basePrice: z.number(),
  }).optional(),
  
  location: z.object({
    id: UuidSchema,
    name: z.string(),
    address: z.object({
      line1: z.string(),
      city: z.string(),
      postcode: z.string(),
    }),
  }).nullable().optional(),
});

// Cancel appointment request schema
export const CancelAppointmentSchema = z.object({
  reason: z.enum(['CLIENT_REQUEST', 'PRACTITIONER_UNAVAILABLE', 'EMERGENCY', 'OTHER']),
  notes: z.string().max(500).optional(),
  refundRequested: z.boolean().default(false),
});

// Reschedule appointment request schema
export const RescheduleAppointmentSchema = z.object({
  newStartTs: DateTimeSchema,
  newEndTs: DateTimeSchema,
  reason: z.string().max(500).optional(),
}).refine(
  (data) => {
    const start = new Date(data.newStartTs);
    const end = new Date(data.newEndTs);
    return end > start;
  },
  {
    message: 'New end time must be after new start time',
    path: ['newEndTs'],
  }
).refine(
  (data) => {
    const start = new Date(data.newStartTs);
    const now = new Date();
    return start > now;
  },
  {
    message: 'New appointment time must be in the future',
    path: ['newStartTs'],
  }
);

// Path parameter schemas
export const AppointmentParamsSchema = z.object({
  id: UuidSchema,
});

// Export types for TypeScript
export type CreateAppointmentRequest = z.infer<typeof CreateAppointmentSchema>;
export type UpdateAppointmentRequest = z.infer<typeof UpdateAppointmentSchema>;
export type ListAppointmentsQuery = z.infer<typeof ListAppointmentsQuerySchema>;
export type AppointmentResponse = z.infer<typeof AppointmentResponseSchema>;
export type CancelAppointmentRequest = z.infer<typeof CancelAppointmentSchema>;
export type RescheduleAppointmentRequest = z.infer<typeof RescheduleAppointmentSchema>;
export type AppointmentParams = z.infer<typeof AppointmentParamsSchema>;
