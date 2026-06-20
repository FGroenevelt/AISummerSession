/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // KplusV huisstijl — centraal beheerd, pas hier aan indien nodig.
        kplus: {
          blue: '#0079AE', // primaire kleur (knoppen, links, accenten)
          lavender: '#B0A9CE', // licht accent
          purple: '#8E61A2', // accent
          indigo: '#545DA4', // accent
          ink: '#1f2433', // donkere tekst
        },
      },
      fontFamily: {
        // Eén centrale font-stack. Vervang 'Inter' door het aangeleverde
        // kplusv.nl-lettertype zodra dat beschikbaar is.
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(31, 36, 51, 0.08), 0 8px 24px rgba(31, 36, 51, 0.06)',
      },
      borderRadius: {
        xl2: '1rem',
      },
    },
  },
  plugins: [],
}
