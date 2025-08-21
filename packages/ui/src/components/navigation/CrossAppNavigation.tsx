'use client';

import React, { useState } from 'react';
import { ChevronDownIcon, SwitchHorizontalIcon } from '@heroicons/react/outline';
import { useNavigation } from '@master-aesthetics-suite/shared';

interface CrossAppNavigationProps {
  className?: string;
  variant?: 'dropdown' | 'tabs' | 'buttons';
}

const appConfigs = {
  web: {
    name: 'Client Portal',
    url: 'http://localhost:3000',
    icon: '👤',
    description: 'Book appointments and manage your treatments'
  },
  admin: {
    name: 'Admin Dashboard',
    url: 'http://localhost:3001',
    icon: '⚙️',
    description: 'Manage clinic operations and staff'
  },
  student: {
    name: 'Student Portal',
    url: 'http://localhost:3000/student',
    icon: '🎓',
    description: 'Access courses and track progress'
  }
};

export default function CrossAppNavigation({ 
  className = '', 
  variant = 'dropdown' 
}: CrossAppNavigationProps) {
  const { currentUser, availableApps } = useNavigation();
  const [isOpen, setIsOpen] = useState(false);

  const getCurrentApp = () => {
    if (typeof window !== 'undefined') {
      const port = window.location.port;
      const path = window.location.pathname;
      
      if (port === '3001') return 'admin';
      if (path.startsWith('/student')) return 'student';
      return 'web';
    }
    return 'web';
  };

  const currentApp = getCurrentApp();
  const currentAppConfig = appConfigs[currentApp as keyof typeof appConfigs];

  const handleAppSwitch = (appKey: string) => {
    const appConfig = appConfigs[appKey as keyof typeof appConfigs];
    if (appConfig && typeof window !== 'undefined') {
      window.location.href = appConfig.url;
    }
    setIsOpen(false);
  };

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-silver-300 rounded-lg hover:bg-platinum-50 transition-colors duration-200"
        >
          <span className="text-lg">{currentAppConfig.icon}</span>
          <span className="font-medium text-primary-900">{currentAppConfig.name}</span>
          <ChevronDownIcon className={`w-4 h-4 text-silver-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-silver-200 rounded-xl shadow-elegant z-50">
            <div className="p-4 border-b border-silver-100">
              <div className="flex items-center gap-2 text-sm text-silver-600">
                <SwitchHorizontalIcon className="w-4 h-4" />
                Switch Application
              </div>
            </div>
            <div className="p-2">
              {availableApps.map((appKey) => {
                const appConfig = appConfigs[appKey as keyof typeof appConfigs];
                const isCurrentApp = appKey === currentApp;
                
                return (
                  <button
                    key={appKey}
                    onClick={() => handleAppSwitch(appKey)}
                    disabled={isCurrentApp}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors duration-200 ${
                      isCurrentApp 
                        ? 'bg-blue-50 text-blue-900 cursor-default' 
                        : 'hover:bg-platinum-50 text-primary-900'
                    }`}
                  >
                    <span className="text-xl">{appConfig.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium">{appConfig.name}</div>
                      <div className="text-sm text-silver-600">{appConfig.description}</div>
                    </div>
                    {isCurrentApp && (
                      <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        Current
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="p-4 border-t border-silver-100 bg-platinum-25">
              <div className="text-xs text-silver-500">
                Logged in as <span className="font-medium text-primary-900">{currentUser?.name}</span>
              </div>
            </div>
          </div>
        )}

        {/* Backdrop */}
        {isOpen && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    );
  }

  if (variant === 'tabs') {
    return (
      <div className={`flex items-center bg-white border border-silver-200 rounded-lg ${className}`}>
        {availableApps.map((appKey) => {
          const appConfig = appConfigs[appKey as keyof typeof appConfigs];
          const isCurrentApp = appKey === currentApp;
          
          return (
            <button
              key={appKey}
              onClick={() => handleAppSwitch(appKey)}
              disabled={isCurrentApp}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                isCurrentApp
                  ? 'bg-blue-100 text-blue-900 cursor-default'
                  : 'hover:bg-platinum-50 text-primary-700'
              } ${
                appKey === availableApps[0] ? 'rounded-l-lg' : ''
              } ${
                appKey === availableApps[availableApps.length - 1] ? 'rounded-r-lg' : ''
              }`}
            >
              <span>{appConfig.icon}</span>
              <span>{appConfig.name}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === 'buttons') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {availableApps.map((appKey) => {
          const appConfig = appConfigs[appKey as keyof typeof appConfigs];
          const isCurrentApp = appKey === currentApp;
          
          return (
            <button
              key={appKey}
              onClick={() => handleAppSwitch(appKey)}
              disabled={isCurrentApp}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isCurrentApp
                  ? 'bg-blue-100 text-blue-900 cursor-default'
                  : 'bg-white hover:bg-platinum-50 text-primary-700 border border-silver-200'
              }`}
            >
              <span>{appConfig.icon}</span>
              <span>{appConfig.name}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return null;
}
