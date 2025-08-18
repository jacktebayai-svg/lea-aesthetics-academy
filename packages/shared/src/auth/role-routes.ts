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
    defaultPath: '/dashboard',
    portalUrl: process.env.ADMIN_PORTAL_URL || 'http://localhost:3001',
    allowedPaths: [
      '/dashboard',
      '/clients',
      '/clients/:id',
      '/appointments',
      '/appointments/calendar',
      '/practitioners',
      '/practitioners/:id',
      '/services',
      '/services/create',
      '/services/:id/edit',
      '/payments',
      '/reports',
      '/reports/revenue',
      '/reports/bookings',
      '/settings',
      '/settings/business',
      '/settings/staff',
      '/settings/notifications',
    ],
  },
  [UserRole.OWNER]: {
    role: UserRole.OWNER,
    defaultPath: '/dashboard',
    portalUrl: process.env.ADMIN_PORTAL_URL || 'http://localhost:3001',
    allowedPaths: [
      '/dashboard',
      '/clients',
      '/clients/:id',
      '/appointments',
      '/appointments/calendar',
      '/practitioners',
      '/practitioners/:id',
      '/services',
      '/services/create',
      '/services/:id/edit',
      '/payments',
      '/reports',
      '/reports/revenue',
      '/reports/bookings',
      '/reports/analytics',
      '/settings',
      '/settings/business',
      '/settings/staff',
      '/settings/billing',
      '/settings/integrations',
      '/settings/notifications',
      '/tenant-settings',
      '/billing',
    ],
  },
  [UserRole.MANAGER]: {
    role: UserRole.MANAGER,
    defaultPath: '/dashboard',
    portalUrl: process.env.ADMIN_PORTAL_URL || 'http://localhost:3001',
    allowedPaths: [
      '/dashboard',
      '/clients',
      '/clients/:id',
      '/appointments',
      '/appointments/calendar',
      '/practitioners',
      '/practitioners/:id',
      '/services',
      '/payments',
      '/reports',
      '/reports/revenue',
      '/reports/bookings',
      '/settings/staff',
      '/settings/notifications',
    ],
  },
  [UserRole.PRACTITIONER]: {
    role: UserRole.PRACTITIONER,
    defaultPath: '/schedule',
    portalUrl: process.env.ADMIN_PORTAL_URL || 'http://localhost:3001',
    allowedPaths: [
      '/schedule',
      '/appointments',
      '/appointments/:id',
      '/clients',
      '/clients/:id',
      '/treatments',
      '/profile',
      '/availability',
    ],
  },
  [UserRole.FRONTDESK]: {
    role: UserRole.FRONTDESK,
    defaultPath: '/appointments',
    portalUrl: process.env.ADMIN_PORTAL_URL || 'http://localhost:3001',
    allowedPaths: [
      '/appointments',
      '/appointments/calendar',
      '/appointments/book',
      '/clients',
      '/clients/:id',
      '/clients/check-in',
      '/payments',
      '/schedule',
    ],
  },
  [UserRole.FINANCE]: {
    role: UserRole.FINANCE,
    defaultPath: '/payments',
    portalUrl: process.env.ADMIN_PORTAL_URL || 'http://localhost:3001',
    allowedPaths: [
      '/payments',
      '/payments/invoices',
      '/payments/refunds',
      '/reports/revenue',
      '/reports/financial',
      '/clients',
    ],
  },
  [UserRole.SUPPORT]: {
    role: UserRole.SUPPORT,
    defaultPath: '/tickets',
    portalUrl: process.env.ADMIN_PORTAL_URL || 'http://localhost:3001',
    allowedPaths: [
      '/tickets',
      '/tickets/:id',
      '/messages',
      '/clients',
      '/clients/:id',
      '/knowledge-base',
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
