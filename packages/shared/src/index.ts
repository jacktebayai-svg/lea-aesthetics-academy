// Navigation types and contexts
export * from './types/navigation';
export * from './contexts/NavigationContext';

// Auth utilities
export * from './auth/role-routes';

// Existing exports (if any)
// Add other shared utilities, types, and components here

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
}

export interface Course {
  id: string;
  title: string;
  description: string;
  modules: number;
  progress: number; // percentage
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}
