import React from 'react'

// Simple toaster placeholder
export function Toaster() {
  return <div id="toaster-root" />
}

export const toast = {
  success: (message: string) => console.log('Success:', message),
  error: (message: string) => console.error('Error:', message),
  info: (message: string) => console.log('Info:', message),
}
