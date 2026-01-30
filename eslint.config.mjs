import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import obsidian from "eslint-plugin-obsidianmd";

export default [
  {
    files: ["src/**/*.ts"],
    ignores: ["main.js", "main.js.map", "dist/**", "node_modules/**"],
    languageOptions: {
      parser: tsParser,
      sourceType: "module",
      ecmaVersion: "latest",
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      obsidianmd: obsidian
    },
    rules: {
      ...obsidian.configs.recommended.rules
    }
  }
];
