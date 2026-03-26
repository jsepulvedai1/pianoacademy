import { Montserrat } from "next/font/google";

/**
 * 🎻 Détaché - Centralized Font System
 * The main typography for the brand is Montserrat.
 */

// Main Brand Font (Montserrat)
export const fontMontserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const typography = {
  primary: fontMontserrat.variable,
  // Using Montserrat for both for consistency as requested
  headings: fontMontserrat.variable,
  body: fontMontserrat.variable,
};
