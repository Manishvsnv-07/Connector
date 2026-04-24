module.exports = {
  theme: {
    extend: {
      fontFamily: {
        tinos: ["Tinos", "serif"],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease forwards',
        'fade-up': 'fadeUp 0.6s ease forwards',
      },
    },
  },
  plugins: [],
}