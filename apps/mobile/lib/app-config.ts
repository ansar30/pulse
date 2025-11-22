/**
 * Centralized Application Configuration
 * Change app name, branding, and metadata here to update across the entire application
 */

export const appConfig = {
  // Application Name
  name: 'Pulse',
  
  // Application Display Name (for titles, headers)
  displayName: 'Pulse',
  
  // Tagline/Description
  tagline: 'Where Teams Connect',
  description: 'A modern, collaborative workspace for teams. Real-time chat, project management, and seamless collaboration.',
  
  // Metadata
  metadata: {
    title: 'Pulse - Where Teams Connect',
    description: 'A modern, collaborative workspace for teams. Real-time chat, project management, and seamless collaboration.',
  },
  
  // Font Configuration for App Name
  branding: {
    // Show logo icon/box next to app name
    showLogo: false, // Set to true to show the gradient box logo
    
    // Font family for the app name/logo
    fontFamily: 'cursive', // Using cursive for immersive, logo-like appearance
    // Alternative: You can use specific fonts like 'Brush Script MT', 'Lucida Handwriting', etc.
    // Or use Google Fonts: 'Dancing Script', 'Pacifico', 'Satisfy', 'Great Vibes'
    
    // Gradient colors for the app name
    gradient: {
      from: 'from-blue-600',
      via: 'via-purple-600',
      to: 'to-pink-600',
    },
    
    // Logo box styling (if showLogo is true)
    logo: {
      className: 'w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg',
    },
  },
  
  // URLs (if needed)
  urls: {
    website: 'https://pulse.app',
    support: 'support@pulse.app',
  },
} as const;

// Export type for TypeScript
export type AppConfig = typeof appConfig;

