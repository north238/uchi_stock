import defaultTheme from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php",
        "./storage/framework/views/*.php",
        "./resources/views/**/*.blade.php",
        "./resources/js/**/*.tsx",
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ["Roboto", "Noto Sans", ...defaultTheme.fontFamily.sans],
            },
            colors: {
                LINE01: "#06C755",
                LINK01: "#0645AD", // リンク色
                LINK02: "#681da8", // リンク色（閲覧後）
                LINK03: "#3366BB", // ホバー時
            },
        },
    },

    plugins: [forms],
};
