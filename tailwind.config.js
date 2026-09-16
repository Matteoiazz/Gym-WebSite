/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          50: '#eafbff',
          100: '#c9f4ff',
          200: '#93e9ff',
          300: '#54d8ff',
          400: '#1ec2ff',
          500: '#00a3e8',
          600: '#0081bd',
          700: '#006492',
          800: '#08506f',
          900: '#0c4159',
          950: '#062a3d',
        },
        onyx: {
          50: '#f4f6f9',
          100: '#e2e7ed',
          200: '#c3cbd6',
          300: '#98a3b2',
          400: '#7a8595',
          500: '#4a5361',
          600: '#333a45',
          700: '#232830',
          800: '#16191d',
          900: '#0e1013',
          950: '#08090a',
        },
      },
      fontFamily: {
        display: ['Archivo', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.035em',
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      boxShadow: {
        lift: '0 24px 60px -24px rgba(0, 0, 0, 0.85)',
      },
    },
  },
  plugins: [],
}
