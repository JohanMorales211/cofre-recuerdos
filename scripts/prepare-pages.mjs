// Prepara dist/client para servirse como sitio estático en GitHub Pages.
// El modo SPA de TanStack Start genera "_shell.html"; aquí lo convertimos en:
//   - index.html  → punto de entrada del sitio
//   - 404.html    → mismo shell, para que las rutas del cliente (/recuerdos,
//                   /contador, etc.) funcionen al recargar o entrar directo
//   - .nojekyll   → evita que GitHub Pages (Jekyll) ignore carpetas con "_"
import { copyFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const dir = resolve("dist/client");
const shell = resolve(dir, "_shell.html");

if (!existsSync(shell)) {
  console.error("✗ No se encontró dist/client/_shell.html. ¿Está activo el modo SPA en vite.config.ts?");
  process.exit(1);
}

copyFileSync(shell, resolve(dir, "index.html"));
copyFileSync(shell, resolve(dir, "404.html"));
writeFileSync(resolve(dir, ".nojekyll"), "");

console.log("✓ Pages listo: index.html, 404.html y .nojekyll creados en dist/client");
