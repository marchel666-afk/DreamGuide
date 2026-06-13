/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0A0A0F',
        'bg-secondary': '#12121A',
        'bg-card': 'rgba(255, 255, 255, 0.04)',
        'accent-primary': '#6C63FF',
        'accent-secondary': '#B388FF',
        'accent-cyan': '#00D4FF',
        'text-primary': '#F0EDF8',
        'text-muted': 'rgba(240, 237, 248, 0.5)',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(108, 99, 255, 0.4), 0 0 40px rgba(108, 99, 255, 0.15)',
        'glow-cyan': '0 0 20px rgba(0, 212, 255, 0.4), 0 0 40px rgba(0, 212, 255, 0.15)',
        'glow-violet': '0 0 20px rgba(179, 136, 255, 0.4), 0 0 40px rgba(179, 136, 255, 0.15)',
      },
    },
  },
  plugins: [],
}
