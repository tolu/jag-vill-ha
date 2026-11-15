import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { voidPlugin } from "void";
import { voidReact } from "@void/react/plugin";

export default defineConfig({
  resolve: {
    alias: {
      // Void generates the auth tables; the tsconfig path alone is not enough at runtime.
      "@auth-schema": fileURLToPath(new URL("./.void/better-auth-schema.ts", import.meta.url)),
    },
  },
  plugins: [
    voidPlugin(),
    voidReact({ react: { compiler: true } }),
  ],
});
