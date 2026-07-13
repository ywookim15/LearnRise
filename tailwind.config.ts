import type { Config } from "tailwindcss";

/**
 * METIS design tokens — extracted from the Google Stitch design system screenshot.
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
        // Raw brand values, always available regardless of theme
        brand: {
          primary: "#6366F1",
          secondary: "#A855F7",
          tertiary: "#0F172A",
          neutral: "#777680",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-eb-garamond)", "Georgia", "serif"],
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
        // Soft, low-contrast elevation matching the Stitch cards
        card: "0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.06)",
        "card-hover": "0 8px 30px -6px rgba(15, 23, 42, 0.10), 0 2px 6px -2px rgba(15, 23, 42, 0.06)",
        // Deep, diffuse lift for floating hero/preview cards
        lift: "0 24px 60px -20px rgba(79, 70, 229, 0.30), 0 10px 24px -12px rgba(15, 23, 42, 0.14)",
        popover: "0 12px 40px -8px rgba(15, 23, 42, 0.18)",
        brand: "0 10px 30px -10px rgba(99, 102, 241, 0.55)",
        "brand-lg": "0 20px 50px -12px rgba(99, 102, 241, 0.5)",
        glow: "0 0 0 1px rgba(99,102,241,0.12), 0 8px 40px -8px rgba(168,85,247,0.35)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #6366F1 0%, #A855F7 100%)",
        "brand-gradient-soft": "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.12) 100%)",
        "brand-gradient-vivid": "linear-gradient(135deg, #4F46E5 0%, #6366F1 45%, #A855F7 100%)",
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
