import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import tsEslintPlugin from "@typescript-eslint/eslint-plugin";
import obsidian from "eslint-plugin-obsidianmd";

export default [
  // Ignore build artefacts
  {
    ignores: ["dist/**", "node_modules/**", "main.js", "main.js.map"]
  },
  // Project-specific rules and language settings
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json"
      },
      sourceType: "module",
      ecmaVersion: "latest",
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      obsidianmd: obsidian,
      "@typescript-eslint": tsEslintPlugin
    },
    rules: {
      ...obsidian.configs.recommended,
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/unbound-method": "error"
    }
  }
];
