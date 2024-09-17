/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',            
    './style/**/*.css',        
    './**/*.html',
    './src/**/*.js'           
  ],
  theme: {
    fontFamily: {
      'sans': ['Roboto','sans-serif']
    },
    extend: {
      backgroundImage: {
        "home": "url('/assets/bg.png')"
      }
    },
  },
  plugins: [],
};
