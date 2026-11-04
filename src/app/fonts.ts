import { Architects_Daughter, Caveat, Kalam } from "next/font/google";

// Carnet d'ingénieur : Kalam pour l'écriture, Architects Daughter pour les annotations techniques,
// Caveat pour les notes griffonnées dans la marge.
const kalam = Kalam({ variable: "--font-body", subsets: ["latin"], weight: ["300", "400", "700"] });
const architect = Architects_Daughter({ variable: "--font-code", subsets: ["latin"], weight: "400" });
const caveat = Caveat({ variable: "--font-note", subsets: ["latin"], weight: ["500", "700"] });

export const fontVariables = `${kalam.variable} ${architect.variable} ${caveat.variable}`;
