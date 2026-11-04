import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

// Une seule famille, deux voix : Plex Sans pour le texte, Plex Mono pour les étiquettes techniques.
const plexSans = IBM_Plex_Sans({ variable: "--font-body", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const plexMono = IBM_Plex_Mono({ variable: "--font-code", subsets: ["latin"], weight: ["400", "500"] });

export const fontVariables = `${plexSans.variable} ${plexMono.variable}`;
