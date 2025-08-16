export type UserRole = 'client' | 'student' | 'practitioner' | 'admin' | 'tutor' | 'manager' | 'owner';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  initials: string;
}

export interface NavigationItem {
  name: string;
  href: string;
  icon: string;
  description?: string;
  roles: UserRole[];
  children?: NavigationItem[];
  badge?: string;
  external?: boolean;
}

export interface NavigationSection {
  name: string;
  items: NavigationItem[];
  roles: UserRole[];
}

// Navigation configuration for different user roles
export const navigationConfig: Record<string, NavigationSection[]> = {
  client: [
    {
      name: 'My Account',
      roles: ['client'],
      items: [
        { name: 'Dashboard', href: '/client', icon: '🏠', roles: ['client'] },
        { name: 'My Appointments', href: '/client/appointments', icon: '📅', roles: ['client'] },
        { name: 'Treatment History', href: '/client/treatments', icon: '✨', roles: ['client'] },
        { name: 'My Documents', href: '/client/documents', icon: '📄', roles: ['client'] },
        { name: 'Payment Methods', href: '/client/payments', icon: '💳', roles: ['client'] },
      ]
    },
    {
      name: 'Services',
      roles: ['client'],
      items: [
        { name: 'Book Appointment', href: '/booking', icon: '➕', roles: ['client'] },
        { name: 'Browse Services', href: '/services', icon: '🔍', roles: ['client'] },
        { name: 'Practitioners', href: '/practitioners', icon: '👩‍⚕️', roles: ['client'] },
        { name: 'Locations', href: '/locations', icon: '📍', roles: ['client'] },
      ]
    }
  ],
  
  student: [
    {
      name: 'Learning',
      roles: ['student'],
      items: [
        { name: 'My Dashboard', href: '/student', icon: '🎓', roles: ['student'] },
        { name: 'My Courses', href: '/student/courses', icon: '📚', roles: ['student'] },
        { name: 'Assessments', href: '/student/assessments', icon: '📝', roles: ['student'] },
        { name: 'Certificates', href: '/student/certificates', icon: '🏆', roles: ['student'] },
        { name: 'Study Materials', href: '/student/materials', icon: '📖', roles: ['student'] },
      ]
    },
    {
      name: 'Academy',
      roles: ['student'],
      items: [
        { name: 'Course Catalog', href: '/academy/courses', icon: '🔍', roles: ['student'] },
        { name: 'Enroll in Course', href: '/academy/enroll', icon: '➕', roles: ['student'] },
        { name: 'Study Groups', href: '/academy/groups', icon: '👥', roles: ['student'] },
        { name: 'Resources', href: '/academy/resources', icon: '📋', roles: ['student'] },
      ]
    },
    {
      name: 'Practice Booking',
      roles: ['student'],
      items: [
        { name: 'Book Treatment', href: '/booking', icon: '💆‍♀️', roles: ['student'] },
        { name: 'Student Discount', href: '/student/discounts', icon: '💰', roles: ['student'] },
      ]
    }
  ],

  admin: [
    {
      name: 'Overview',
      roles: ['admin', 'manager', 'owner'],
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: '📊', roles: ['admin', 'manager', 'owner'] },
        { name: 'Analytics', href: '/analytics', icon: '📈', roles: ['admin', 'manager', 'owner'] },
      ]
    },
    {
      name: 'Practice Management',
      roles: ['admin', 'manager', 'owner', 'practitioner'],
      items: [
        { name: 'Appointments', href: '/appointments', icon: '📅', roles: ['admin', 'manager', 'owner', 'practitioner'] },
        { name: 'Clients', href: '/clients', icon: '👥', roles: ['admin', 'manager', 'owner', 'practitioner'] },
        { name: 'Practitioners', href: '/practitioners', icon: '👩‍⚕️', roles: ['admin', 'manager', 'owner'] },
        { name: 'Services', href: '/services', icon: '💆‍♀️', roles: ['admin', 'manager', 'owner'] },
        { name: 'Treatments', href: '/treatments', icon: '✨', roles: ['admin', 'manager', 'owner', 'practitioner'] },
      ]
    },
    {
      name: 'Learning Management',
      roles: ['admin', 'tutor', 'manager', 'owner'],
      items: [
        { name: 'Courses', href: '/courses', icon: '📚', roles: ['admin', 'tutor', 'manager', 'owner'] },
        { name: 'Students', href: '/students', icon: '🎓', roles: ['admin', 'tutor', 'manager', 'owner'] },
        { name: 'Enrollments', href: '/enrollments', icon: '📋', roles: ['admin', 'tutor', 'manager', 'owner'] },
        { name: 'Certificates', href: '/certificates', icon: '🏆', roles: ['admin', 'tutor', 'manager', 'owner'] },
        { name: 'Assessments', href: '/assessments', icon: '📝', roles: ['admin', 'tutor', 'manager', 'owner'] },
      ]
    },
    {
      name: 'Business',
      roles: ['admin', 'manager', 'owner'],
      items: [
        { name: 'Payments', href: '/payments', icon: '💳', roles: ['admin', 'manager', 'owner'] },
        { name: 'Invoices', href: '/invoices', icon: '🧾', roles: ['admin', 'manager', 'owner'] },
        { name: 'Reports', href: '/reports', icon: '📊', roles: ['admin', 'manager', 'owner'] },
        { name: 'Documents', href: '/documents', icon: '📄', roles: ['admin', 'manager', 'owner'] },
      ]
    },
    {
      name: 'System',
      roles: ['admin', 'owner'],
      items: [
        { name: 'Settings', href: '/settings', icon: '⚙️', roles: ['admin', 'owner'] },
        { name: 'Users', href: '/users', icon: '👤', roles: ['admin', 'owner'] },
        { name: 'Templates', href: '/dashboard/templates', icon: '📋', roles: ['admin', 'owner'] },
      ]
    }
  ],

  practitioner: [
    {
      name: 'My Practice',
      roles: ['practitioner'],
      items: [
        { name: 'My Dashboard', href: '/practitioner', icon: '🏥', roles: ['practitioner'] },
        { name: 'My Schedule', href: '/practitioner/schedule', icon: '📅', roles: ['practitioner'] },
        { name: 'My Clients', href: '/practitioner/clients', icon: '👥', roles: ['practitioner'] },
        { name: 'Treatment Notes', href: '/practitioner/notes', icon: '📝', roles: ['practitioner'] },
      ]
    },
    {
      name: 'Learning & Development',
      roles: ['practitioner'],
      items: [
        { name: 'My Courses', href: '/practitioner/courses', icon: '📚', roles: ['practitioner'] },
        { name: 'CPD Credits', href: '/practitioner/cpd', icon: '🏆', roles: ['practitioner'] },
        { name: 'Training Calendar', href: '/practitioner/training', icon: '📅', roles: ['practitioner'] },
      ]
    }
  ],

  tutor: [
    {
      name: 'Teaching',
      roles: ['tutor'],
      items: [
        { name: 'My Dashboard', href: '/tutor', icon: '👩‍🏫', roles: ['tutor'] },
        { name: 'My Courses', href: '/tutor/courses', icon: '📚', roles: ['tutor'] },
        { name: 'My Students', href: '/tutor/students', icon: '🎓', roles: ['tutor'] },
        { name: 'Assessments', href: '/tutor/assessments', icon: '📝', roles: ['tutor'] },
        { name: 'Course Materials', href: '/tutor/materials', icon: '📖', roles: ['tutor'] },
      ]
    }
  ]
};

// Quick access items that appear in all contexts
export const quickAccessItems: NavigationItem[] = [
  { name: 'Book Appointment', href: '/booking', icon: '➕', roles: ['client', 'student', 'practitioner'] },
  { name: 'Emergency Support', href: '/support', icon: '🆘', roles: ['client', 'student', 'practitioner', 'admin', 'tutor', 'manager', 'owner'] },
  { name: 'Help Center', href: '/help', icon: '❓', roles: ['client', 'student', 'practitioner', 'admin', 'tutor', 'manager', 'owner'] },
];

// Cross-app navigation items
export const appSwitcher: NavigationItem[] = [
  { name: 'Client Portal', href: '/client', icon: '👤', roles: ['client'], description: 'Manage appointments & treatments' },
  { name: 'Student Portal', href: '/student', icon: '🎓', roles: ['student'], description: 'Access courses & learning' },
  { name: 'Academy', href: '/academy', icon: '🏫', roles: ['student', 'client'], description: 'Browse course catalog' },
  { name: 'Admin Dashboard', href: '/dashboard', icon: '⚙️', roles: ['admin', 'manager', 'owner'], description: 'Manage practice & academy' },
  { name: 'Practitioner Portal', href: '/practitioner', icon: '👩‍⚕️', roles: ['practitioner'], description: 'Manage your practice' },
  { name: 'Tutor Portal', href: '/tutor', icon: '👩‍🏫', roles: ['tutor'], description: 'Manage your courses' },
];
