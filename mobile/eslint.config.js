import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["node_modules/**", ".expo/**", "android/**", "ios/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
);
