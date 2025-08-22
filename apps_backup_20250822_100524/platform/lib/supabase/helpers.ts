import { SupabaseClient } from '@supabase/supabase-js';
import { Database, Service, Course, Appointment, Client, Student, BusinessSettings } from './types';

type Tables = Database['public']['Tables'];
type DbClient = SupabaseClient<Database>;

// Generic error handling
export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export function handleDatabaseError(error: any): never {
  console.error('Database operation failed:', error);
  throw new DatabaseError(
    error.message || 'Database operation failed',
    error.code,
    error.details
  );
}

// Generic CRUD operations
export async function findById<T extends keyof Tables>(
  supabase: DbClient,
  table: T,
  id: string
): Promise<Tables[T]['Row'] | null> {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = not found
    handleDatabaseError(error);
  }

  return data as Tables[T]['Row'] | null;
}

export async function findMany<T extends keyof Tables>(
  supabase: DbClient,
  table: T,
  options: {
    where?: Record<string, any>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
    offset?: number;
  } = {}
): Promise<Tables[T]['Row'][]> {
  let query = supabase.from(table).select('*');

  if (options.where) {
    Object.entries(options.where).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }

  if (options.orderBy) {
    query = query.order(options.orderBy.column, { 
      ascending: options.orderBy.ascending ?? true 
    });
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
  }

  const { data, error } = await query;

  if (error) {
    handleDatabaseError(error);
  }

  return data as Tables[T]['Row'][];
}

export async function create<T extends keyof Tables>(
  supabase: DbClient,
  table: T,
  data: Tables[T]['Insert']
): Promise<Tables[T]['Row']> {
  const { data: result, error } = await supabase
    .from(table)
    .insert(data)
    .select()
    .single();

  if (error) {
    handleDatabaseError(error);
  }

  return result as Tables[T]['Row'];
}

export async function update<T extends keyof Tables>(
  supabase: DbClient,
  table: T,
  id: string,
  data: Tables[T]['Update']
): Promise<Tables[T]['Row']> {
  const { data: result, error } = await supabase
    .from(table)
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    handleDatabaseError(error);
  }

  return result as Tables[T]['Row'];
}

export async function deleteById<T extends keyof Tables>(
  supabase: DbClient,
  table: T,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);

  if (error) {
    handleDatabaseError(error);
  }
}

// Specialized helper functions

// Services
export async function getActiveServices(supabase: DbClient): Promise<Service[]> {
  return findMany(supabase, 'services', {
    where: { is_active: true },
    orderBy: { column: 'name', ascending: true }
  });
}

export async function getServiceBySlug(supabase: DbClient, slug: string): Promise<Service | null> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') {
    handleDatabaseError(error);
  }

  return data;
}

// Courses
export async function getActiveCourses(supabase: DbClient): Promise<Course[]> {
  return findMany(supabase, 'courses', {
    where: { is_active: true },
    orderBy: { column: 'title', ascending: true }
  });
}

export async function getCourseBySlug(supabase: DbClient, slug: string): Promise<Course | null> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') {
    handleDatabaseError(error);
  }

  return data;
}

// Appointments with relationships
export async function getAppointmentWithDetails(supabase: DbClient, id: string) {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      service:services(*),
      client:clients(*),
      student:students(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    handleDatabaseError(error);
  }

  return data;
}

export async function getAppointmentsByDateRange(
  supabase: DbClient,
  startDate: string,
  endDate: string
): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .gte('start_time', startDate)
    .lte('start_time', endDate)
    .order('start_time', { ascending: true });

  if (error) {
    handleDatabaseError(error);
  }

  return data;
}

// User management
export async function getClientByUserId(supabase: DbClient, userId: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    handleDatabaseError(error);
  }

  return data;
}

export async function getStudentByUserId(supabase: DbClient, userId: string): Promise<Student | null> {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    handleDatabaseError(error);
  }

  return data;
}

// Business settings
export async function getBusinessSettings(supabase: DbClient): Promise<BusinessSettings | null> {
  const { data, error } = await supabase
    .from('business_settings')
    .select('*')
    .eq('id', 'business_settings')
    .single();

  if (error && error.code !== 'PGRST116') {
    handleDatabaseError(error);
  }

  return data;
}

export async function updateBusinessSettings(
  supabase: DbClient,
  settings: Partial<BusinessSettings>
): Promise<BusinessSettings> {
  const { data, error } = await supabase
    .from('business_settings')
    .update(settings)
    .eq('id', 'business_settings')
    .select()
    .single();

  if (error) {
    handleDatabaseError(error);
  }

  return data;
}

// Utility functions
export function formatPrice(priceInPence: number): string {
  return `£${(priceInPence / 100).toFixed(2)}`;
}

export function parsePrice(priceString: string): number {
  // Convert "£12.50" to 1250 pence
  const numericValue = parseFloat(priceString.replace(/[£,]/g, ''));
  return Math.round(numericValue * 100);
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Authentication helpers
export async function getCurrentUser(supabase: DbClient) {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    throw new Error(`Authentication error: ${error.message}`);
  }
  
  return user;
}

export async function getCurrentUserProfile(supabase: DbClient) {
  const user = await getCurrentUser(supabase);
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    handleDatabaseError(error);
  }

  return data;
}
