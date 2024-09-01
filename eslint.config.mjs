import globals from "globals";
import pluginJs from "@eslint/js";

const { browser, node } = globals;

export default [
    {
        languageOptions: {
            globals: {
                ...browser,
                ...node,
            },
        },
    },
    pluginJs.configs.recommended,
];
