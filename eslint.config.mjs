import stylistic from "@stylistic/eslint-plugin";
import tseslint from "@electron-toolkit/eslint-config-ts";
import eslintConfigPrettier from "@electron-toolkit/eslint-config-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import eslintPluginVue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";

export default tseslint.config(
    { ignores: ["**/node_modules", "**/dist", "**/out"] },
    tseslint.configs.recommended,
    eslintPluginVue.configs["flat/recommended"],
    {
        files: ["**/*.vue"],
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true
                },
                extraFileExtensions: [".vue"],
                parser: tseslint.parser
            }
        }
    },
    {
        files: ["**/*.{ts,mts,tsx,vue}"],
        plugins: {
            "@stylistic": stylistic,
            "simple-import-sort": simpleImportSort
        },
        rules: {
            // Vue specific rules
            "vue/require-default-prop": "off",
            "vue/multi-word-component-names": "off",
            "vue/block-lang": [
                "error",
                {
                    script: {
                        lang: "ts"
                    }
                }
            ],

            // Import sorting
            "simple-import-sort/imports": "error",
            "simple-import-sort/exports": "error",

            // TypeScript rules
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
            "@typescript-eslint/consistent-type-imports": "error",
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/no-explicit-any": "off",

            // Stylistic rules
            "@stylistic/quotes": ["error", "double"],
            "@stylistic/semi": "error",
            "@stylistic/indent": ["error", 4],
            "@stylistic/comma-dangle": ["error", "never"],
            "@stylistic/arrow-parens": ["error", "as-needed"],
            "@stylistic/no-mixed-spaces-and-tabs": "error",

            // General rules
            "no-constant-condition": ["error", { checkLoops: false }],
            "no-empty": ["error", { allowEmptyCatch: true }],
            "prefer-const": "error"
        }
    },
    eslintConfigPrettier
);
