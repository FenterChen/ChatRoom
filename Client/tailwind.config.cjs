/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        slogan: "48px",
      },
      maxWidth: {
        "8xl": "1320px",
        'one-three': `calc(100%/3)`,
        'one-two': `calc(100%/2)`,
        'full': '100%'
      },
      width: {
        "3/50": "6%",
      },
      height: {
        "xl-height": "790px",
        "lg-height": "698px",
        "md-height": "488px",
        "sm-height": "420px",
        "phone-height": "290px",
        'header': "74px"
      },
      maxHeight: {
        'screen-5rem': `calc(100vh - 5rem)`,
        'screen-8rem': `calc(100vh - 8rem)`,
        'header': "74px",
        '1/2': '33%'
      },
      screens: {
        xs: { min: "400px", max: "767px" },
      },
      spacing: {
        98: "25rem",
        100: "26rem",
      },
      colors: {
        platinum: "rgb(229, 229, 229)",
        transparent: "rgb(100,116,139,0.6);"
      },
    },
  },
  plugins: [],
}
