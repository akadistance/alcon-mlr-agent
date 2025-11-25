/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Modern ChatGPT-inspired color system
        chatgpt: {
          // Light mode colors (ChatGPT-inspired) - Warmer white tones
          bg: '#faf9f7',
          'bg-secondary': '#f5f4f2',
          'bg-tertiary': '#f0efed',
          'border': '#e5e5e5',
          'border-hover': '#d1d5db',
          'text-primary': '#212121',
          'text-secondary': '#6b7280',
          'text-tertiary': '#9ca3af',
          'accent': 'var(--alcon-primary)',
          'accent-hover': 'var(--alcon-primary-hover)',
        },
        // Dark mode colors (Grok-inspired - Deep Space)
        'chatgpt-dark': {
          bg: '#141414',
          'bg-secondary': '#141414',
          'bg-tertiary': '#181818',
          'border': '#1a1a1a',
          'border-hover': '#222222',
          'text-primary': '#ffffff',
          'text-secondary': '#aaaaaa',
          'text-tertiary': '#b3b3b3',
          'accent': '#00d4ff',
          'accent-hover': '#1da1f2',
        },
        // Enterprise Color System - Warm Professional
        surface: {
          primary: 'var(--surface-primary)',
          secondary: 'var(--surface-secondary)',
          tertiary: 'var(--surface-tertiary)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
        },
        border: {
          subtle: 'var(--border-subtle)',
        },
        accent: {
          // Map to Alcon brand tokens
          primary: 'var(--alcon-primary)',
          success: 'var(--alcon-green)',
          warning: 'var(--alcon-orange)',
          danger: 'var(--alcon-red)',
          cyan: 'var(--alcon-cyan)',
          teal: 'var(--alcon-dark-teal)'
        },
        alcon: {
          blue: 'var(--alcon-primary)',
          cyan: 'var(--alcon-cyan)',
          teal: 'var(--alcon-dark-teal)',
          purple: 'var(--alcon-purple)',
          green: 'var(--alcon-green)',
          orange: 'var(--alcon-orange)',
          red: 'var(--alcon-red)'
        },
        // Additional accent colors from provided CSS
        accent: {
          blue: 'var(--accent-blue)',
          green: 'var(--accent-green)',
          yellow: 'var(--accent-yellow)',
          purple: 'var(--accent-purple)',
          pink: 'var(--accent-pink)',
          orange: 'var(--accent-orange)',
          red: 'var(--accent-red)',
          cyan: 'var(--accent-cyan)',
        },
        // Composer colors
        composer: {
          surface: 'var(--composer-surface)',
          'surface-secondary': 'var(--composer-surface-secondary)',
          'surface-tertiary': 'var(--composer-surface-tertiary)',
          border: 'var(--composer-border)',
          'border-hover': 'var(--composer-border-hover)',
          'text-primary': 'var(--composer-text-primary)',
          'text-secondary': 'var(--composer-text-secondary)',
          'text-tertiary': 'var(--composer-text-tertiary)',
          accent: 'var(--composer-accent)',
          'accent-hover': 'var(--composer-accent-hover)',
        },
        // Main surface colors
        'main-surface': {
          primary: 'var(--main-surface-primary)',
          secondary: 'var(--main-surface-secondary)',
          tertiary: 'var(--main-surface-tertiary)',
          quaternary: 'var(--main-surface-quaternary)',
        },
        // Interactive colors
        interactive: {
          primary: 'var(--interactive-primary)',
          'primary-hover': 'var(--interactive-primary-hover)',
          secondary: 'var(--interactive-secondary)',
          'secondary-hover': 'var(--interactive-secondary-hover)',
          tertiary: 'var(--interactive-tertiary)',
          'tertiary-hover': 'var(--interactive-tertiary-hover)',
        },
        // Sidebar colors
        sidebar: {
          surface: 'var(--sidebar-surface)',
          'surface-hover': 'var(--sidebar-surface-hover)',
          border: 'var(--sidebar-border)',
          'text-primary': 'var(--sidebar-text-primary)',
          'text-secondary': 'var(--sidebar-text-secondary)',
        },
        // Modern glass morphism colors
        glass: {
          light: 'rgba(255, 255, 255, 0.8)',
          'light-hover': 'rgba(255, 255, 255, 0.9)',
          dark: 'rgba(0, 0, 0, 0.8)',
          'dark-hover': 'rgba(0, 0, 0, 0.9)',
        },
        // Legacy support (will gradually migrate)
        gray: {
          50: '#F8F7F5',
          100: '#F0EDE8',
          200: '#E8E5E0',
          300: '#D1CEC9',
          400: '#999999',
          500: '#6B6B6B',
          600: '#4A4A4A',
          700: '#333333',
          800: '#1A1A1A',
          900: '#0A0A0A',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          '"Helvetica Neue"',
          'sans-serif',
        ],
        mono: [
          '"SF Mono"',
          '"Roboto Mono"',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],
        'sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0' }],
        'base': ['1rem', { lineHeight: '1.6', letterSpacing: '0' }],
        'lg': ['1.125rem', { lineHeight: '1.7', letterSpacing: '-0.01em' }],
        'xl': ['1.25rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
        '2xl': ['1.5rem', { lineHeight: '1.4', letterSpacing: '-0.02em' }],
        '3xl': ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.02em' }],
        '4xl': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.03em' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'large': '0 8px 32px rgba(0, 0, 0, 0.12)',
        'xl': '0 12px 48px rgba(0, 0, 0, 0.16)',
        'subtle-focus': '0 0 0 6px rgba(59, 130, 246, 0.08)',
        'alcon-focus': '0 0 0 6px rgba(0, 53, 149, 0.28), 0 0 0 2px rgba(0, 53, 149, 0.45), 0 10px 24px rgba(0, 53, 149, 0.20)',
        // Modern ChatGPT-inspired shadows
        'chatgpt': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'chatgpt-lg': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'chatgpt-xl': '0 16px 48px rgba(0, 0, 0, 0.15)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        // ChatGPT input box shadows
        'short': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn var(--duration-normal) var(--spring-common)',
        'slide-up': 'slideUp var(--duration-normal) var(--spring-common)',
        'slide-in': 'slideIn var(--duration-fast) var(--spring-fast)',
        'slide-down': 'slideDown var(--duration-normal) var(--spring-common)',
        'scale-in': 'scaleIn var(--duration-fast) var(--spring-fast)',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        // Modern ChatGPT-inspired animations
        'message-in': 'messageIn var(--duration-slow) var(--spring-common)',
        'typing': 'typing 1.5s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'gradient-shift': 'gradientShift 3s ease-in-out infinite',
        'glass-shine': 'glassShine 2s ease-in-out infinite',
        // New animations from provided CSS
        'hive-log-fadeout': 'hive-log-fadeout 0.3s ease-out forwards',
        'shimmer-skeleton': 'shimmer-skeleton 1.5s ease-in-out infinite',
        'pulse-dot': 'pulse-dot 1.4s ease-in-out infinite both',
        'float-sidebar-in': 'float-sidebar-in 0.3s ease-out',
        'toast-open': 'toast-open 0.3s ease-out',
        'icon-shimmer': 'icon-shimmer 1.5s ease-in-out infinite',
        'loading-results-shimmer': 'loading-results-shimmer 1.5s ease-in-out infinite',
        'loading-shimmer': 'loading-shimmer 1.5s ease-in-out infinite',
        'scale-pulse': 'scalePulse 2s ease-in-out infinite',
        'diagonal-sweep': 'diagonalSweep 0.6s ease-out',
        'prompt-glow': 'promptGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 53, 149, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 53, 149, 0.4)' },
        },
        // Modern ChatGPT-inspired keyframes
        messageIn: {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(20px) scale(0.95)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0) scale(1)' 
          },
        },
        typing: {
          '0%, 60%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        glassShine: {
          '0%': { transform: 'translateX(-100%) skewX(-15deg)' },
          '100%': { transform: 'translateX(200%) skewX(-15deg)' },
        },
        // New keyframes from provided CSS
        'hive-log-fadeout': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-10px)' },
        },
        'shimmer-skeleton': {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: 'calc(200px + 100%) 0' },
        },
        'pulse-dot': {
          '0%, 80%, 100%': { transform: 'scale(0)', opacity: '0.5' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
        'float-sidebar-in': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'toast-open': {
          '0%': { transform: 'translateY(-100%) scale(0.95)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        'icon-shimmer': {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: 'calc(200px + 100%) 0' },
        },
        'loading-results-shimmer': {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: 'calc(200px + 100%) 0' },
        },
        'loading-shimmer': {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: 'calc(200px + 100%) 0' },
        },
        'scalePulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        'diagonalSweep': {
          '0%': { transform: 'translateX(-100%) translateY(-100%) rotate(45deg)' },
          '100%': { transform: 'translateX(100%) translateY(100%) rotate(45deg)' },
        },
        'promptGlow': {
          '0%, 100%': { 
            boxShadow: '0 0 0 0 rgba(0, 53, 149, 0.4), 0 0 0 0 rgba(0, 53, 149, 0.2)' 
          },
          '50%': { 
            boxShadow: '0 0 0 2px rgba(0, 53, 149, 0.4), 0 0 0 4px rgba(0, 53, 149, 0.2), 0 0 12px rgba(0, 53, 149, 0.3)' 
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}
