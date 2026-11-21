/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        roomie: {
          bg: '#FAF7F2',
          card: '#FFFFFF',
          primary: '#DE5737',
          'primary-hover': '#CA4929',
          'primary-light': '#FDF1EC',
          'primary-soft': '#FBE5DB',
          dark: '#211B17',
          muted: '#6E6660',
          border: '#EFE8DE',
          accent: '#F9DEC9'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'serif']
      },
      boxShadow: {
        'soft': '0 8px 30px rgba(0, 0, 0, 0.05)',
        'float': '0 18px 40px -10px rgba(222, 87, 55, 0.12), 0 8px 20px -6px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}
