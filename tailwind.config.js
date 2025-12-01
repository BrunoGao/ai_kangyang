/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 康养主色调
        'healing-primary': '#80C4A8',
        'healing-green': '#6EC28C',
        'healing-blue': '#7AB6E9',
        'healing-orange': '#FFA45B',
        'healing-red': '#FF6B6B',
        'healing-bg': '#FBFBF5',
        'healing-gray': '#404040',
        'healing-light-gray': '#F5F5F0',
        'healing-card': '#FFFFFF',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 12px rgba(0, 0, 0, 0.06)',
        'soft-lg': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'glow-green': '0 0 20px rgba(110, 194, 140, 0.3)',
        'glow-orange': '0 0 20px rgba(255, 164, 91, 0.3)',
        'glow-red': '0 0 20px rgba(255, 107, 107, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
}
