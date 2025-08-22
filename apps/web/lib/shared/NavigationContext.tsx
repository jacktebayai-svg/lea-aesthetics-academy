'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, NavigationSection, NavigationItem, navigationConfig, quickAccessItems, appSwitcher } from './navigation';

interface NavigationContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  currentRole: UserRole | null;
  setCurrentRole: (role: UserRole) => void;
  navigationSections: NavigationSection[];
  quickAccess: NavigationItem[];
  appSwitcherItems: NavigationItem[];
  availableApps: string[];
  hasAccess: (roles: UserRole[]) => boolean;
  isLoading: boolean;
  currentUser?: User | null;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

// Demo users for testing
const demoUsers: Record<UserRole, User> = {
  client: {
    id: '1',
    name: 'Emma Watson',
    email: 'emma@example.com',
    role: 'client',
    initials: 'EW'
  },
  student: {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com', 
    role: 'student',
    initials: 'SJ'
  },
  practitioner: {
    id: '3',
    name: 'Dr. Emily Carter',
    email: 'emily@example.com',
    role: 'practitioner',
    initials: 'EC'
  },
  admin: {
    id: '4',
    name: 'Lea Anderson',
    email: 'lea@example.com',
    role: 'admin',
    initials: 'LA'
  },
  tutor: {
    id: '5',
    name: 'Prof. Michael Thompson',
    email: 'michael@example.com',
    role: 'tutor',
    initials: 'MT'
  },
  manager: {
    id: '6',
    name: 'Lisa Rodriguez',
    email: 'lisa@example.com',
    role: 'manager',
    initials: 'LR'
  },
  owner: {
    id: '7',
    name: 'James Anderson',
    email: 'james@example.com',
    role: 'owner',
    initials: 'JA'
  }
};

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize with demo user based on current app context or URL
  useEffect(() => {
    // In a real app, this would check authentication and load user from API
    // For demo purposes, we'll determine role based on current path
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    
    let detectedRole: UserRole = 'admin'; // Default for admin app
    
    if (path.includes('/client')) {
      detectedRole = 'client';
    } else if (path.includes('/student')) {
      detectedRole = 'student';
    } else if (path.includes('/practitioner')) {
      detectedRole = 'practitioner';
    } else if (path.includes('/tutor')) {
      detectedRole = 'tutor';
    } else if (path.includes('/academy')) {
      detectedRole = 'student';
    }
    
    const demoUser = demoUsers[detectedRole];
    setUser(demoUser);
    setCurrentRole(detectedRole);
    setIsLoading(false);
  }, []);

  // Get navigation sections based on current user role
  const navigationSections = React.useMemo(() => {
    if (!currentRole) return [];
    
    const sections = navigationConfig[currentRole] || [];
    return sections.filter(section => 
      section.roles.includes(currentRole) &&
      section.items.some(item => item.roles.includes(currentRole))
    ).map(section => ({
      ...section,
      items: section.items.filter(item => item.roles.includes(currentRole))
    }));
  }, [currentRole]);

  // Get quick access items for current user
  const quickAccess = React.useMemo(() => {
    if (!currentRole) return [];
    return quickAccessItems.filter(item => item.roles.includes(currentRole));
  }, [currentRole]);

  // Get app switcher items for current user
  const appSwitcherItems = React.useMemo(() => {
    if (!currentRole) return [];
    return appSwitcher.filter(item => item.roles.includes(currentRole));
  }, [currentRole]);

  // Check if user has access to specific roles
  const hasAccess = (roles: UserRole[]) => {
    return currentRole ? roles.includes(currentRole) : false;
  };

  // Get available apps based on current role
  const availableApps = React.useMemo(() => {
    if (!currentRole) return [];
    const apps = ['web', 'admin'];
    // Add student portal for students
    if (currentRole === 'student') apps.push('student');
    return apps;
  }, [currentRole]);

  const value: NavigationContextType = {
    user,
    setUser: (newUser: User | null) => {
      setUser(newUser);
      setCurrentRole(newUser?.role || null);
    },
    currentRole,
    setCurrentRole: (role: UserRole) => {
      setCurrentRole(role);
      setUser(demoUsers[role]);
    },
    navigationSections,
    quickAccess,
    appSwitcherItems,
    availableApps,
    hasAccess,
    isLoading,
    currentUser: user
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
