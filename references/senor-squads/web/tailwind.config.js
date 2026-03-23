/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        deadPulse: {
          '0%, 100%': { filter: 'grayscale(1)' },
          '50%': { filter: 'grayscale(0.4) sepia(0.6) hue-rotate(-30deg) saturate(2)' },
        },
      },
      animation: {
        'dead-pulse': 'deadPulse 1.5s ease-in-out infinite',
      },
      fontFamily: {
        gilroy: ['Gilroy', 'Arial'],
      },
      colors: {
        primary: "var(--primary-color)",
      },
      backgroundColor: {
        button: "var(--button-bg)",
        container: "var(--container-bg)",
        accent: 'var(--bg-accent)',
        joinButton: 'var(--join-button)',
        backAccent: 'var(--bg-back-accent)',
        validGradient: 'var(--valid-gradient)'
      }
    },
  },
  plugins: [],
}