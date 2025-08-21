// Generated TypeScript types for Master Aesthetics Suite Database Schema

export type UserRole = 'owner' | 'client' | 'student';
export type ServiceCategory = 'treatment' | 'consultation' | 'course' | 'workshop';
export type AppointmentStatus = 'pending_deposit' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded' | 'partial_refund';
export type EnrollmentStatus = 'enrolled' | 'in_progress' | 'completed' | 'cancelled';
export type TemplateType = 'consent' | 'aftercare' | 'policy' | 'certificate' | 'email';
export type DocumentType = 'consent' | 'aftercare_guide' | 'policy_agreement' | 'certificate';
export type DocumentStatus = 'draft' | 'sent' | 'signed' | 'expired';
export type CampaignType = 'email' | 'sms' | 'automated_sequence';
export type CampaignStatus = 'draft' | 'scheduled' | 'sent' | 'cancelled';
export type RecipientType = 'client' | 'student';
export type MessageChannel = 'email' | 'sms';
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'opened' | 'failed';

export interface BusinessSettings {
  id: string;
  business_name: string;
  owner_name: string;
  email: string;
  phone?: string;
  address?: Record<string, any>;
  timezone: string;
  branding?: Record<string, any>;
  policies?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  profile?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  personal_info: Record<string, any>;
  preferences?: Record<string, any>;
  tags?: string[];
  total_spent: number;
  last_visit?: string;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  user_id: string;
  personal_info: Record<string, any>;
  certifications?: Record<string, any>[];
  progress?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  description?: string;
  base_price: number; // in pence
  duration_minutes: number;
  category: ServiceCategory;
  buffer_minutes?: Record<string, any>;
  is_active: boolean;
  settings?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface MedicalHistory {
  id: string;
  client_id: string;
  data: Record<string, any>;
  risk_flags?: string[];
  version: number;
  created_at: string;
}

export interface Appointment {
  id: string;
  client_id?: string;
  student_id?: string;
  service_id: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  notes?: string;
  reminders_sent: number;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string;
  price: number; // in pence
  duration_hours: number;
  max_students?: number;
  curriculum?: Record<string, any>;
  prerequisites?: Record<string, any>;
  certificate_template?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseEnrollment {
  id: string;
  student_id: string;
  course_id: string;
  status: EnrollmentStatus;
  progress?: Record<string, any>;
  completed_at?: string;
  certificate_issued: boolean;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  appointment_id?: string;
  course_enrollment_id?: string;
  stripe_payment_intent_id?: string;
  amount: number; // in pence
  deposit_amount: number;
  currency: string;
  status: PaymentStatus;
  paid_at?: string;
  refunded_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface Template {
  id: string;
  type: TemplateType;
  name: string;
  content: Record<string, any>;
  version: string;
  is_active: boolean;
  mandatory_blocks?: string[];
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  type: DocumentType;
  client_id?: string;
  student_id?: string;
  template_id: string;
  content: Record<string, any>;
  pdf_url?: string;
  status: DocumentStatus;
  signed_at?: string;
  expires_at?: string;
  hash?: string;
  created_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  audience_filter?: Record<string, any>;
  content?: Record<string, any>;
  scheduled_for?: string;
  sent_at?: string;
  status: CampaignStatus;
  stats?: Record<string, any>;
  created_at: string;
}

export interface Message {
  id: string;
  campaign_id?: string;
  recipient_id: string;
  recipient_type: RecipientType;
  channel: MessageChannel;
  content: Record<string, any>;
  status: MessageStatus;
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  error_message?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  resource: string;
  resource_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface FileUpload {
  id: string;
  filename: string;
  original_name: string;
  mimetype: string;
  size: number;
  storage_path: string;
  uploaded_by?: string;
  created_at: string;
}

// Database table definitions for Supabase
export interface Database {
  public: {
    Tables: {
      business_settings: {
        Row: BusinessSettings;
        Insert: Omit<BusinessSettings, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<BusinessSettings, 'id' | 'created_at' | 'updated_at'>>;
      };
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>;
      };
      clients: {
        Row: Client;
        Insert: Omit<Client, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>;
      };
      students: {
        Row: Student;
        Insert: Omit<Student, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Student, 'id' | 'created_at' | 'updated_at'>>;
      };
      services: {
        Row: Service;
        Insert: Omit<Service, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Service, 'id' | 'created_at' | 'updated_at'>>;
      };
      medical_histories: {
        Row: MedicalHistory;
        Insert: Omit<MedicalHistory, 'id' | 'created_at'>;
        Update: Partial<Omit<MedicalHistory, 'id' | 'created_at'>>;
      };
      appointments: {
        Row: Appointment;
        Insert: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Appointment, 'id' | 'created_at' | 'updated_at'>>;
      };
      courses: {
        Row: Course;
        Insert: Omit<Course, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Course, 'id' | 'created_at' | 'updated_at'>>;
      };
      course_enrollments: {
        Row: CourseEnrollment;
        Insert: Omit<CourseEnrollment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<CourseEnrollment, 'id' | 'created_at' | 'updated_at'>>;
      };
      payments: {
        Row: Payment;
        Insert: Omit<Payment, 'id' | 'created_at'>;
        Update: Partial<Omit<Payment, 'id' | 'created_at'>>;
      };
      templates: {
        Row: Template;
        Insert: Omit<Template, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Template, 'id' | 'created_at' | 'updated_at'>>;
      };
      documents: {
        Row: Document;
        Insert: Omit<Document, 'id' | 'created_at'>;
        Update: Partial<Omit<Document, 'id' | 'created_at'>>;
      };
      campaigns: {
        Row: Campaign;
        Insert: Omit<Campaign, 'id' | 'created_at'>;
        Update: Partial<Omit<Campaign, 'id' | 'created_at'>>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, 'id' | 'created_at'>;
        Update: Partial<Omit<Message, 'id' | 'created_at'>>;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Omit<AuditLog, 'id' | 'created_at'>;
        Update: Partial<Omit<AuditLog, 'id' | 'created_at'>>;
      };
      file_uploads: {
        Row: FileUpload;
        Insert: Omit<FileUpload, 'id' | 'created_at'>;
        Update: Partial<Omit<FileUpload, 'id' | 'created_at'>>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>;
        Returns: UserRole;
      };
      is_owner: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      service_category: ServiceCategory;
      appointment_status: AppointmentStatus;
      payment_status: PaymentStatus;
      enrollment_status: EnrollmentStatus;
      template_type: TemplateType;
      document_type: DocumentType;
      document_status: DocumentStatus;
      campaign_type: CampaignType;
      campaign_status: CampaignStatus;
      recipient_type: RecipientType;
      message_channel: MessageChannel;
      message_status: MessageStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
