import type { Config } from "tailwindcss";

/**
 * LearnRise design tokens — extracted from the Google Stitch design system screenshot.
 *
 * Brand palette:
 *   Primary   #6366F1  (indigo)  — CTAs, active nav, progress fills
 *   Secondary #A855F7  (violet)  — accents, gradients, "AI" moments
 *   Tertiary  #0F172A  (slate)   — primary text / inverted buttons
 *   Neutral   #777680  (gray)    — muted text, borders
 *
 * Typography:
 *   Headline  EB Garamond (serif)  — marketing hero moments
 *   Body/Label Geist (sans)        — all UI text
 */
const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        // shadcn-convention tokens, wired to CSS variables (see globals.css)
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        // Raw brand values (Academic Precision). Navy foundation, blue + purple
        // accents, and the blue→purple gradient (see backgroundImage below).
        brand: {
          navy: "#0D1140",
          blue: "#0057EB",
          purple: "#B021FF",
          "gradient-start": "#0158D9",
          "gradient-end": "#9D5AEF",
          primary: "#0057EB",
          secondary: "#0D1140",
          tertiary: "#0D1140",
          neutral: "#41496A",
        },
      },
      fontFamily: {
        // Body/UI text: Inter (neutral, readable). Headlines: Poppins.
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        heading: ["var(--font-poppins)", "system-ui", "sans-serif"],
        // `serif` is kept as an alias to the heading font so existing
        // `font-serif` headline usages resolve to Poppins (not a serif).
        serif: ["var(--font-poppins)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Marketing display scale (serif hero moments)
        display: ["3.5rem", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-sm": ["2.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "calc(var(--radius) + 16px)",
      },
      boxShadow: {
        // Diffused, navy-tinted elevation per the brief (organic to the palette,
        // not heavy neutral drop shadows).
        card: "0 1px 2px 0 rgba(13, 17, 64, 0.04), 0 1px 3px -1px rgba(13, 17, 64, 0.05)",
        "card-hover": "0 10px 30px -6px rgba(13, 17, 64, 0.08), 0 4px 10px -4px rgba(13, 17, 64, 0.06)",
        lift: "0 32px 64px -12px rgba(13, 17, 64, 0.12)",
        popover: "0 12px 40px -8px rgba(13, 17, 64, 0.16)",
        // Colored glow for gradient CTAs / achievement moments.
        brand: "0 10px 24px -10px rgba(1, 88, 217, 0.45)",
        "brand-lg": "0 40px 80px -15px rgba(1, 88, 217, 0.40)",
        glow: "0 0 0 1px rgba(1,88,217,0.10), 0 12px 40px -8px rgba(157,90,239,0.30)",
      },
      backgroundImage: {
        // Blue→purple brand gradient (Academic Precision). Primary CTAs,
        // progress fills, and achievement moments use this.
        "brand-gradient": "linear-gradient(135deg, #0158D9 0%, #9D5AEF 100%)",
        "brand-gradient-soft": "linear-gradient(135deg, rgba(1,88,217,0.10) 0%, rgba(157,90,239,0.10) 100%)",
        "brand-gradient-vivid": "linear-gradient(135deg, #0158D9 0%, #9D5AEF 100%)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.25s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
