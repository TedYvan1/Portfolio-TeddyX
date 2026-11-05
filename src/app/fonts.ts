import { Bangers, Comic_Neue } from "next/font/google";

// Lettrage de BD : Bangers pour les titres et les onomatopées, Comic Neue pour les bulles et le texte.
const bangers = Bangers({ variable: "--font-display", subsets: ["latin"], weight: "400" });
const comic = Comic_Neue({ variable: "--font-body", subsets: ["latin"], weight: ["400", "700"] });

export const fontVariables = `${bangers.variable} ${comic.variable}`;
