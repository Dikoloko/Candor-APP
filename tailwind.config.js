/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'candor-bg':     '#0d1b2a',  // Candor eeri black
        'candor-dark':   '#1a3356',  // Loyal blue derived — nav
        'candor-card':   '#162d4a',  // Card surface
        'candor-border': '#2d4d70',  // Muted loyal blue border
        'candor-blue':   '#2d598e',  // Candor loyal blue
        'candor-teal':   '#29AAE2',  // Candor happy blue — CTA
        'candor-clear':  '#96d3ea',  // Candor clear blue
        'candor-grey':   '#818d92',  // Candor soft grey
        'candor-green':  '#27AE60',  // Success
        'candor-red':    '#ea3546',  // Candor energetic red
        'candor-orange': '#fbb13c',  // Candor warm yellow
      },
      fontFamily: {
        'ubuntu': ['Ubuntu', 'sans-serif'],
        'mono':   ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0,0,0,0.3)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}
