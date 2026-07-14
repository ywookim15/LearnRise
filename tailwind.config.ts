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
        // Raw brand values. Solid navy + blue; the blue→purple gradient is
        // reserved for the logo asset only.
        brand: {
          navy: "#0D1140",
          blue: "#0057EB",
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
        // Restrained, neutral elevation (no colored glow — that read as templated).
        card: "0 1px 2px 0 rgba(13, 17, 64, 0.05), 0 1px 3px -1px rgba(13, 17, 64, 0.06)",
        "card-hover": "0 6px 20px -8px rgba(13, 17, 64, 0.14), 0 2px 6px -2px rgba(13, 17, 64, 0.06)",
        lift: "0 20px 48px -24px rgba(13, 17, 64, 0.28), 0 8px 20px -12px rgba(13, 17, 64, 0.12)",
        popover: "0 12px 40px -8px rgba(13, 17, 64, 0.16)",
        // `brand` shadows kept as tokens but now neutral navy, not indigo glow.
        brand: "0 6px 16px -8px rgba(13, 17, 64, 0.28)",
        "brand-lg": "0 14px 34px -12px rgba(13, 17, 64, 0.30)",
        glow: "0 1px 2px 0 rgba(13, 17, 64, 0.06)",
      },
      backgroundImage: {
        // The blue→purple gradient now lives ONLY on the logo asset. These
        // utility names are retained but resolve to SOLID fills so every
        // existing usage de-gradients consistently: `brand-gradient` = blue,
        // `-vivid` = navy, `-soft` = faint blue tint.
        "brand-gradient": "linear-gradient(#0057EB, #0057EB)",
        "brand-gradient-soft": "linear-gradient(rgba(0,87,235,0.07), rgba(0,87,235,0.07))",
        "brand-gradient-vivid": "linear-gradient(#0D1140, #0D1140)",
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
