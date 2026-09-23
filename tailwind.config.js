/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0A",
        surface: {
          DEFAULT: "rgba(255, 255, 255, 0.04)",
          hover: "rgba(255, 255, 255, 0.08)",
          active: "rgba(255, 255, 255, 0.12)",
        },
        border: {
          glass: "rgba(255, 255, 255, 0.12)",
          'glass-glow': "rgba(0, 240, 255, 0.35)",
        },
        neon: {
          blue: "#00F0FF",
          cyan: "#00E5FF",
          red: "#FF1744",
          crimson: "#FF0055",
          purple: "#B026FF",
          amber: "#FF9100",
          emerald: "#00E676",
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'mirror-blue': '0 0 25px -3px rgba(0, 240, 255, 0.35), 0 0 10px -2px rgba(0, 240, 255, 0.25)',
        'mirror-red': '0 0 25px -3px rgba(255, 23, 68, 0.4), 0 0 10px -2px rgba(255, 23, 68, 0.3)',
        'mirror-purple': '0 0 25px -3px rgba(176, 38, 255, 0.35), 0 0 10px -2px rgba(176, 38, 255, 0.25)',
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
