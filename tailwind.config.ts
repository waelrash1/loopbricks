import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        ink: "hsl(var(--ink))",
        link: "hsl(var(--link))",
        heading: "hsl(var(--heading))",
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))", edge: "hsl(var(--accent-edge))", text: "hsl(var(--accent-text))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        panel: "hsl(var(--panel))",
      },
      fontFamily: { sans: ["var(--font-sans)"], mono: ["var(--font-mono)"], display: ["var(--font-display)"] },
      borderRadius: { card: "var(--radius)", btn: "var(--radius-control)" },
    },
  },
  plugins: [],
} satisfies Config;
