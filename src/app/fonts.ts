import { Archivo, Barlow_Condensed, JetBrains_Mono } from "next/font/google";

// Trois voix, comme sur du matériel réseau :
// Archivo pour le texte et les titres, Barlow Condensed pour les bandes d'étiqueteuse,
// JetBrains Mono pour la sérigraphie (numéros de port, références).
const archivo = Archivo({ variable: "--font-body", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const tape = Barlow_Condensed({ variable: "--font-tape", subsets: ["latin"], weight: ["500", "600", "700"] });
const mono = JetBrains_Mono({ variable: "--font-code", subsets: ["latin"], weight: ["400", "500"] });

export const fontVariables = `${archivo.variable} ${tape.variable} ${mono.variable}`;
