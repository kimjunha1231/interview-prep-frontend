/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          primary: "#0066cc",
          "primary-focus": "#0071e3",
          "primary-on-dark": "#2997ff",
          ink: "#1d1d1f",
          "body-on-dark": "#ffffff",
          "body-muted": "#cccccc",
          "divider-soft": "#f0f0f0",
          hairline: "#e0e0e0",
          canvas: "#ffffff",
          "canvas-parchment": "#f5f5f7",
          "surface-pearl": "#fafafc",
          "surface-tile-1": "#272729",
          "surface-tile-2": "#2a2a2c",
          "surface-tile-3": "#252527",
          "surface-black": "#000000",
          "surface-chip-translucent": "rgba(210, 210, 215, 0.64)",
        }
      },
      fontFamily: {
        sans: ["Pretendard", "SF Pro Text", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        display: ["Pretendard", "SF Pro Display", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["SF Mono", "Fira Code", "monospace"],
      },
      borderRadius: {
        none: "0px",
        xs: "5px",
        sm: "8px",
        md: "11px",
        lg: "18px",
        pill: "9999px",
      },
      spacing: {
        xxs: "4px",
        xs: "8px",
        sm: "12px",
        md: "17px",
        lg: "24px",
        xl: "32px",
        xxl: "48px",
        section: "80px",
      },
      boxShadow: {
        "product-shadow": "0 8px 30px rgba(0, 0, 0, 0.22)",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      }
    },
  },
  plugins: [],
}
