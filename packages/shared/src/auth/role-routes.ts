// packages/shared/src/auth/role-routes.ts
// Role-based routing utility for the luxury aesthetics platform

export enum UserRole {
  CLIENT = 'CLIENT',
  STUDENT = 'STUDENT', 
  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  PRACTITIONER = 'PRACTITIONER',
  FRONTDESK = 'FRONTDESK',
  FINANCE = 'FINANCE',
  SUPPORT = 'SUPPORT',
}

export interface RoleRoute {
  role: UserRole;
  defaultPath: string;
  portalUrl: string;
  allowedPaths: string[];
}

export const ROLE_ROUTES: Record<UserRole, RoleRoute> = {
  [UserRole.CLIENT]: {
    role: UserRole.CLIENT,
    defaultPath: '/dashboard',
    portalUrl: process.env.CLIENT_PORTAL_URL || 'http://localhost:3000',
    allowedPaths: [
      '/dashboard',
      '/appointments',
      '/appointments/book',
      '/appointments/history',
      '/treatments',
      '/profile',
      '/profile/medical-history',
      '/profile/documents',
      '/profile/photos',
      '/payments',
      '/payments/history',
      '/messages',
      '/reviews',
      '/referrals',
    ],
  },
  [UserRole.STUDENT]: {
    role: UserRole.STUDENT,
    defaultPath: '/courses',
    portalUrl: process.env.STUDENT_PORTAL_URL || 'http://localhost:3002',
    allowedPaths: [
      '/courses',
      '/courses/:id',
      '/courses/:id/modules/:moduleId',
      '/courses/:id/modules/:moduleId/lessons/:lessonId',
      '/assessments',
      '/assessments/:id',
      '/certificates',
      '/progress',
      '/profile',
      '/profile/education',
      '/library',
      '/discussion',
      '/support',
    ],
  },
  [UserRole.ADMIN]: {
    role: UserRole.ADMIN,
    defaultPath: '/admin',
    portalUrl: process.env.ADMIN_PORTAL_URL || 'http://localhost:3000',
    allowedPaths: [
      '/admin',
      '/admin/dashboard',
      '/admin/clients',
      '/admin/clients/:id',
      '/admin/appointments',
      '/admin/appointments/calendar',
      '/admin/practitioners',
      '/admin/practitioners/:id',
      '/admin/services',
      '/admin/services/create',
      '/admin/services/:id/edit',
      '/admin/courses',
      '/admin/courses/:id',
      '/admin/payments',
      '/admin/reports',
      '/admin/reports/revenue',
      '/admin/reports/bookings',
      '/admin/settings',
      '/admin/settings/business',
      '/admin/settings/staff',
      '/admin/settings/notifications',
      '/admin/templates',
      '/admin/templates/:id',
    ],
  },
  [UserRole.OWNER]: {
    role: UserRole.OWNER,
    defaultPath: '/admin',
    portalUrl: process.env.ADMIN_PORTAL_URL || 'http://localhost:3000',
    allowedPaths: [
      '/admin',
      '/admin/dashboard',
      '/admin/clients',
      '/admin/clients/:id',
      '/admin/appointments',
      '/admin/appointments/calendar',
      '/admin/practitioners',
      '/admin/practitioners/:id',
      '/admin/services',
      '/admin/services/create',
      '/admin/services/:id/edit',
      '/admin/courses',
      '/admin/courses/:id',
      '/admin/payments',
      '/admin/reports',
      '/admin/reports/revenue',
      '/admin/reports/bookings',
      '/admin/reports/analytics',
      '/admin/settings',
      '/admin/settings/business',
      '/admin/settings/staff',
      '/admin/settings/billing',
      '/admin/settings/integrations',
      '/admin/settings/notifications',
      '/admin/tenant-settings',
      '/admin/billing',
      '/admin/templates',
      '/admin/templates/:id',
    ],
  },
  [UserRole.MANAGER]: {
    role: UserRole.MANAGER,
    defaultPath: '/admin',
    portalUrl: process.env.ADMIN_PORTAL_URL || 'http://localhost:3000',
    allowedPaths: [
      '/admin',
      '/admin/dashboard',
      '/admin/clients',
      '/admin/clients/:id',
      '/admin/appointments',
      '/admin/appointments/calendar',
      '/admin/practitioners',
      '/admin/practitioners/:id',
      '/admin/services',
      '/admin/courses',
      '/admin/courses/:id',
      '/admin/payments',
      '/admin/reports',
      '/admin/reports/revenue',
      '/admin/reports/bookings',
      '/admin/settings/staff',
      '/admin/settings/notifications',
    ],
  },
  [UserRole.PRACTITIONER]: {
    role: UserRole.PRACTITIONER,
    defaultPath: '/admin/schedule',
    portalUrl: process.env.ADMIN_PORTAL_URL || 'http://localhost:3000',
    allowedPaths: [
      '/admin/schedule',
      '/admin/appointments',
      '/admin/appointments/:id',
      '/admin/clients',
      '/admin/clients/:id',
      '/admin/treatments',
      '/admin/profile',
      '/admin/availability',
    ],
  },
  [UserRole.FRONTDESK]: {
    role: UserRole.FRONTDESK,
    defaultPath: '/admin/appointments',
    portalUrl: process.env.ADMIN_PORTAL_URL || 'http://localhost:3000',
    allowedPaths: [
      '/admin/appointments',
      '/admin/appointments/calendar',
      '/admin/appointments/book',
      '/admin/clients',
      '/admin/clients/:id',
      '/admin/clients/check-in',
      '/admin/payments',
      '/admin/schedule',
    ],
  },
  [UserRole.FINANCE]: {
    role: UserRole.FINANCE,
    defaultPath: '/admin/payments',
    portalUrl: process.env.ADMIN_PORTAL_URL || 'http://localhost:3000',
    allowedPaths: [
      '/admin/payments',
      '/admin/payments/invoices',
      '/admin/payments/refunds',
      '/admin/reports/revenue',
      '/admin/reports/financial',
      '/admin/clients',
    ],
  },
  [UserRole.SUPPORT]: {
    role: UserRole.SUPPORT,
    defaultPath: '/admin/tickets',
    portalUrl: process.env.ADMIN_PORTAL_URL || 'http://localhost:3000',
    allowedPaths: [
      '/admin/tickets',
      '/admin/tickets/:id',
      '/admin/messages',
      '/admin/clients',
      '/admin/clients/:id',
      '/admin/knowledge-base',
    ],
  },
};

/**
 * Get the appropriate portal URL and default path for a user's primary role
 */
export function getRoleRoute(roles: UserRole[]): RoleRoute | null {
  if (!roles || roles.length === 0) {
    return null;
  }

  // Priority order for role selection
  const rolePriority = [
    UserRole.OWNER,
    UserRole.ADMIN, 
    UserRole.MANAGER,
    UserRole.PRACTITIONER,
    UserRole.FRONTDESK,
    UserRole.FINANCE,
    UserRole.SUPPORT,
    UserRole.STUDENT,
    UserRole.CLIENT,
  ];

  for (const role of rolePriority) {
    if (roles.includes(role)) {
      return ROLE_ROUTES[role];
    }
  }

  return null;
}

/**
 * Check if a user has permission to access a specific path based on their roles
 */
export function hasPathPermission(roles: UserRole[], path: string): boolean {
  if (!roles || roles.length === 0) {
    return false;
  }

  return roles.some(role => {
    const roleRoute = ROLE_ROUTES[role];
    if (!roleRoute) return false;
    
    return roleRoute.allowedPaths.some(allowedPath => {
      // Convert route patterns to regex (basic implementation)
      const pattern = allowedPath
        .replace(/:[^/]+/g, '[^/]+') // Replace :id with regex pattern
        .replace(/\//g, '\\/'); // Escape forward slashes
      
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(path);
    });
  });
}

/**
 * Get the redirect URL after login based on user roles
 */
export function getPostLoginRedirect(roles: UserRole[]): string {
  const roleRoute = getRoleRoute(roles);
  if (!roleRoute) {
    return '/'; // Default fallback
  }
  
  return `${roleRoute.portalUrl}${roleRoute.defaultPath}`;
}

/**
 * Determine which portal a user should access based on their roles
 */
export function getPrimaryPortal(roles: UserRole[]): 'client' | 'student' | 'admin' | null {
  if (!roles || roles.length === 0) {
    return null;
  }

  // Admin roles (any administrative function)
  if (roles.some(role => [
    UserRole.OWNER,
    UserRole.ADMIN, 
    UserRole.MANAGER,
    UserRole.PRACTITIONER,
    UserRole.FRONTDESK,
    UserRole.FINANCE,
    UserRole.SUPPORT,
  ].includes(role))) {
    return 'admin';
  }

  // Student role
  if (roles.includes(UserRole.STUDENT)) {
    return 'student';
  }

  // Client role
  if (roles.includes(UserRole.CLIENT)) {
    return 'client';
  }

  return null;
}

/**
 * Check if user has administrative privileges
 */
export function isAdmin(roles: UserRole[]): boolean {
  return roles.some(role => [
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.MANAGER,
  ].includes(role));
}

/**
 * Check if user is a practitioner (can provide treatments)
 */
export function isPractitioner(roles: UserRole[]): boolean {
  return roles.some(role => [
    UserRole.OWNER,
    UserRole.PRACTITIONER,
  ].includes(role));
}

/**
 * Check if user has client access
 */
export function isClient(roles: UserRole[]): boolean {
  return roles.includes(UserRole.CLIENT);
}

/**
 * Check if user has student access
 */
export function isStudent(roles: UserRole[]): boolean {
  return roles.includes(UserRole.STUDENT);
}

/**
 * Get available portals for a user based on their roles
 */
export function getAvailablePortals(roles: UserRole[]): Array<{
  name: string;
  url: string;
  primary: boolean;
}> {
  const portals: Array<{ name: string; url: string; primary: boolean }> = [];
  const primaryPortal = getPrimaryPortal(roles);

  // Admin portal access
  if (roles.some(role => [
    UserRole.OWNER,
    UserRole.ADMIN, 
    UserRole.MANAGER,
    UserRole.PRACTITIONER,
    UserRole.FRONTDESK,
    UserRole.FINANCE,
    UserRole.SUPPORT,
  ].includes(role))) {
    portals.push({
      name: 'Admin Dashboard',
      url: process.env.ADMIN_PORTAL_URL || 'http://localhost:3001',
      primary: primaryPortal === 'admin',
    });
  }

  // Student portal access
  if (roles.includes(UserRole.STUDENT)) {
    portals.push({
      name: 'Learning Academy',
      url: process.env.STUDENT_PORTAL_URL || 'http://localhost:3002',
      primary: primaryPortal === 'student',
    });
  }

  // Client portal access
  if (roles.includes(UserRole.CLIENT)) {
    portals.push({
      name: 'Client Portal',
      url: process.env.CLIENT_PORTAL_URL || 'http://localhost:3000',
      primary: primaryPortal === 'client',
    });
  }

  return portals;
}
