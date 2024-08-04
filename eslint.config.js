import typescript from "@typescript-eslint/eslint-plugin";
import prettier from "eslint-plugin-prettier";
import parser from "@typescript-eslint/parser";
export default [
    {
        files: ["src/**/*.ts", "test/**/*.ts"],
        ignores: ["coverage/*"],
        languageOptions: {
            parser: parser, // Specifies the ESLint parser
            parserOptions: {
                ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
                sourceType: "module", // Allows for the use of imports
            },
        },

        plugins: {
            "@typescript-eslint": typescript,
            prettier: prettier,
        },

        rules: {
            // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
            // e.g. "@typescript-eslint/explicit-function-return-type": "off",
        },
    },
];
