/**
 * 🎻 Détaché - Centralized Color Palette
 * These colors define the brand identity of the music academy.
 * They are synchronized with the Tailwind CSS theme in globals.css.
 */

export const colors = {
  // Brand Colors
  brand: {
    primary: "hsl(313, 74%, 35%)",    // Morado: #9b177e
    secondary: "hsl(51, 90%, 48%)",  // Amarillo: #ebca0c
    neutral: "hsl(0, 0%, 100%)",
  },

  // Functional Palette (Shadcn-like structure)
  primary: {
    DEFAULT: "hsl(313, 74%, 35%)",
    foreground: "hsl(0, 0%, 100%)",
  },
  secondary: {
    DEFAULT: "hsl(51, 90%, 48%)",
    foreground: "hsl(0, 0%, 0%)",
  },
  accent: {
    DEFAULT: "hsl(45, 50%, 65%)",    // Antique Brass
    foreground: "hsl(25, 30%, 15%)",
  },
  background: {
    DEFAULT: "hsl(0, 0%, 100%)",
    dark: "hsl(240, 10%, 4%)",
  },
  muted: {
    DEFAULT: "hsl(240, 5%, 96%)",
    foreground: "hsl(240, 4%, 46%)",
  }
};

export type BrandColors = typeof colors;
