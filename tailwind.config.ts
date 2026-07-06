import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand orange — overrides Tailwind's built-in `blue-*` utility scale
        // so every existing `bg-blue-600`, `text-blue-600`, etc. across the
        // app now renders in the app's real orange brand color.
        blue: {
          50:  '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        primary: {
          50:  '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        cream: {
          DEFAULT: '#F5F1EC',
          50: '#FAF8F5',
          100: '#F5F1EC',
        },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      boxShadow: {
        card: '0 2px 12px 0 rgba(0,0,0,0.06)',
        nav:  '0 1px 3px 0 rgba(0,0,0,0.06)',
      },
      borderRadius: { xl2: '1.25rem', xl3: '1.5rem' },
    },
  },
  plugins: [],
};
export default config;
