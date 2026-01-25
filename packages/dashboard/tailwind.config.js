/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components-v2/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          light: "hsl(var(--primary-light))",
          dark: "hsl(var(--primary-dark))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          hover: "hsl(var(--card-hover))",
          foreground: "hsl(var(--card-foreground))",
        },
        // OakAuth color system
        oak: {
          deep: '#090c0a',
          surface: '#171b19',
          elevated: '#1e2320',
          border: 'hsl(160 15% 100% / 0.06)',
          'border-hover': 'hsl(160 15% 100% / 0.12)',
        },
        forest: {
          DEFAULT: '#166534',
          light: '#15803d',
          dark: '#14532d',
          muted: '#1a4d2e',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1rem",
        "2xl": "1.25rem",
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
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "pulse-glow-green": {
          "0%, 100%": {
            boxShadow: "0 0 10px hsl(149 76% 23% / 0.12), 0 0 20px hsl(149 76% 23% / 0.06)",
          },
          "50%": {
            boxShadow: "0 0 15px hsl(149 76% 23% / 0.18), 0 0 30px hsl(149 76% 23% / 0.10)",
          },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "float-subtle": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%": { transform: "translateY(-2px) rotate(0.3deg)" },
          "66%": { transform: "translateY(-1px) rotate(-0.2deg)" },
        },
        "border-glow": {
          "0%, 100%": { borderColor: "hsl(149 76% 23% / 0.25)" },
          "50%": { borderColor: "hsl(149 76% 23% / 0.40)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "fade-in-up": "fade-in-up 0.6s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "shimmer": "shimmer 2s linear infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "pulse-glow-green": "pulse-glow-green 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "float-subtle": "float-subtle 4s ease-in-out infinite",
        "border-glow": "border-glow 2s ease-in-out infinite",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
        'shimmer-green': 'linear-gradient(90deg, transparent, hsl(149 76% 23% / 0.08), transparent)',
        'aurora': 'radial-gradient(ellipse 50% 30% at 50% 0%, hsl(var(--aurora-primary)), transparent), radial-gradient(ellipse 40% 25% at 30% 0%, hsl(var(--aurora-secondary)), transparent)',
        'spotlight': 'radial-gradient(ellipse 50% 30% at 50% -10%, hsl(var(--spotlight-start)), hsl(var(--spotlight-end)))',
        'forest-gradient': 'linear-gradient(135deg, hsl(149 76% 23%), hsl(152 69% 31%))',
        'forest-gradient-dark': 'linear-gradient(135deg, hsl(155 80% 17%), hsl(149 76% 23%))',
      },
      boxShadow: {
        'glow': '0 0 20px hsl(149 76% 23% / 0.15)',
        'glow-sm': '0 0 10px hsl(149 76% 23% / 0.12)',
        'glow-md': '0 0 20px hsl(149 76% 23% / 0.15), 0 0 40px hsl(149 76% 23% / 0.08)',
        'glow-lg': '0 0 30px hsl(149 76% 23% / 0.18), 0 0 60px hsl(149 76% 23% / 0.10)',
        'inner-glow': 'inset 0 0 20px hsl(149 76% 23% / 0.06)',
        'inner-emerald': 'inset 0 0 30px hsl(149 76% 23% / 0.08)',
        'glow-success': '0 0 15px hsl(149 76% 28% / 0.20)',
        'glow-destructive': '0 0 15px hsl(0 72% 55% / 0.15)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
