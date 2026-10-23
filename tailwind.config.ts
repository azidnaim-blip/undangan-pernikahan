import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Apple HIG System Grouped & Neutral Colors
        apple: {
          bg: "#F2F2F7", // iOS Grouped Background
          card: "#FFFFFF",
          subcard: "#F8F8FA",
          border: "rgba(0, 0, 0, 0.07)",
          divider: "rgba(60, 60, 67, 0.12)",
          fill: "rgba(120, 120, 128, 0.08)",
          fillHover: "rgba(120, 120, 128, 0.14)",
          // Label Hierarchy
          label: "#1D1D1F", // SF Primary Label
          secondary: "#6E6E73", // SF Secondary Label
          tertiary: "#86868B", // SF Tertiary Label
          quaternary: "#AEAEC2", // SF Quaternary Label
          // System Accent (Refined Cafe Amber/Roast)
          accent: "#C2552D",
          accentHover: "#A8441E",
          accentSubtle: "rgba(194, 85, 45, 0.10)",
          // System Semantic Colors (Official HIG)
          blue: "#0071E3",
          green: "#34C759",
          orange: "#FF9500",
          red: "#FF3B30",
          purple: "#AF52DE",
          teal: "#30B0C7",
          gray: "#8E8E93",
        },
        cream: {
          50: "#FAF9F6",
          100: "#F5F3EF",
          200: "#ECE7DF",
          300: "#DFD8CC",
        },
        terracotta: {
          50: "#FDF6F3",
          100: "#FCEEE7",
          500: "#D46B43",
          600: "#C2552D",
          700: "#A34220",
        },
      },
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"SF Pro"',
          "system-ui",
          "-apple-system-subheadline",
          "Helvetica Neue",
          "sans-serif",
        ],
        mono: [
          '"JetBrains Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        "apple-sm": "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)",
        "apple-card": "0 2px 10px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)",
        "apple-hover": "0 8px 24px rgba(0, 0, 0, 0.07), 0 2px 6px rgba(0, 0, 0, 0.04)",
        "apple-float": "0 12px 36px rgba(0, 0, 0, 0.10), 0 4px 12px rgba(0, 0, 0, 0.05)",
        "apple-modal": "0 24px 60px rgba(0, 0, 0, 0.16), 0 8px 20px rgba(0, 0, 0, 0.08)",
      },
      borderRadius: {
        "apple-sm": "10px",
        "apple-md": "14px",
        "apple-lg": "18px",
        "apple-xl": "22px",
        "apple-2xl": "28px",
      },
    },
  },
  plugins: [],
};
export default config;
