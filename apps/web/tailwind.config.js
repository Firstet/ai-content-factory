/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#090d16',
        foreground: '#f8fafc',
        card: {
          DEFAULT: 'rgba(15, 23, 42, 0.75)',
          foreground: '#f8fafc',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        primary: {
          DEFAULT: '#6366f1',
          foreground: '#ffffff',
          hover: '#4f46e5',
        },
        secondary: {
          DEFAULT: '#a855f7',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#06b6d4',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#1e293b',
          foreground: '#94a3b8',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      borderRadius: {
        lg: '12px',
        md: '8px',
        sm: '6px',
      },
      backdropBlur: {
        xs: '2px',
        md: '12px',
        xl: '24px',
      },
      animation: {
        'pulse-glow': 'pulse-glow 3s infinite ease-in-out',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 15px rgba(99, 102, 241, 0.4))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 30px rgba(168, 85, 247, 0.7))' },
        },
      },
    },
  },
  plugins: [],
};
