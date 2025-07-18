/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'agent-blue': '#3B82F6',
        'agent-yellow': '#F59E0B',
        'agent-green': '#10B981',
        'agent-red': '#EF4444',
      },
    },
  },
  plugins: [],
}
