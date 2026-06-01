import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isPages = process.env.GITHUB_PAGES === "true";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
    spa: { enabled: true },
  },
  vite: {
    base: isPages ? "/cofre-recuerdos/" : "/",
  },
});
