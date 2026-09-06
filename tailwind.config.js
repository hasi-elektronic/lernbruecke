/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50:'#e9f7fd',100:'#c8ecfa',200:'#94dcf5',300:'#5fcbef',400:'#33afe2',500:'#1e94c7',600:'#16759f',700:'#125b7c',800:'#0e455e',900:'#0a3244' },
        turq:  { 200:'#9df0e2',300:'#5fe0cb',400:'#2ec9b0',500:'#1aa993',600:'#12836f' },
        sun:   { 100:'#fff3cf',200:'#ffe49a',300:'#ffd24d',400:'#f9bd18',500:'#dfa207' },
        ink:   { 700:'#3c4a57',800:'#27333d',900:'#151d24' }
      },
      fontFamily: { display: ['"Trebuchet MS"','Verdana','system-ui','sans-serif'], body: ['system-ui','"Segoe UI"','Roboto','sans-serif'] },
      borderRadius: { xl2: '1.75rem' },
      boxShadow: { card: '0 10px 30px -12px rgba(14,69,94,0.35)' }
    }
  },
  plugins: []
};
