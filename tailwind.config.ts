import type { Config } from 'tailwindcss';
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: { extend: {
    colors: { burgundy: { DEFAULT: '#6b2a3f', dark: '#531f31' }, ivory: '#f7f0e8', rose: '#e8cfd2', rosedeep: '#b7646f', mustard: '#c9962b' },
    fontFamily: { serif: ['var(--font-serif)', 'Georgia', 'serif'], sans: ['var(--font-sans)', 'system-ui', 'sans-serif'], script: ['var(--font-script)', 'cursive'] },
    borderRadius: { DEFAULT: '6px' },
  } },
  plugins: [],
} satisfies Config;
