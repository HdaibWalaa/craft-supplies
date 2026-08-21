import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import hooks from "eslint-plugin-react-hooks";
import refresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["dist/**", ".next/**", ".agents/**", ".codex/**", "backend/**", "node_modules/**"]),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  hooks.configs["recommended-latest"],
  refresh.configs.vite,
  { files: ["**/*.{ts,tsx}"], rules: { "no-undef": "off", "no-unused-vars": "off", "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }], "react-refresh/only-export-components": "off", "react-hooks/set-state-in-effect": "off", "no-empty": ["error", { "allowEmptyCatch": true }] } },
]);
