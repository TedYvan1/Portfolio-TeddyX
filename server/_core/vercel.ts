import { createApp } from "./app";

// Point d'entrée de la fonction Vercel : l'application Express sert de gestionnaire (req, res).
// Les variables d'environnement sont fournies par Vercel ; aucun fichier .env n'est lu ici.
export default createApp();
