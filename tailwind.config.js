export default {
  darkMode: 'class',
  content: ['./src/**/*.{html,ts}'],

  theme: {
    extend: {
      colors: {
        primary: '#8a2ce2',
        'background-dark': '#09090b',
        'surface-dark': '#18181b',
        'border-dark': '#27272a',
      },

      fontFamily: {
        display: ['Spline Sans', 'sans-serif'],
      },
    },
  },
};
