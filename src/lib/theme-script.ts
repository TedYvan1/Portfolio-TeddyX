/** Lancé avant le premier rendu : applique le thème choisi par le visiteur, sans flash. */
export const themeScript = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
