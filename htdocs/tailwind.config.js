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
                sans: [
                    '"Hiragino Maru Gothic ProN"',
                    '"Hiragino Maru Gothic Pro"',
                    '"Hiragino Sans"',
                    '"Yu Gothic UI"',
                    '"Noto Sans JP"',
                    "system-ui",
                    "-apple-system",
                    ...defaultTheme.fontFamily.sans,
                ],
            },
            colors: {
                // 既存
                LINE01: "#06C755",
                LINK01: "#0645AD", // リンク色
                LINK02: "#681da8", // リンク色（閲覧後）
                LINK03: "#3366BB", // ホバー時
                // 追加：リデザイン用トークン
                paper: "rgb(var(--color-paper) / <alpha-value>)",
                surface: "rgb(var(--color-surface) / <alpha-value>)",
                "surface-2": "rgb(var(--color-surface-2) / <alpha-value>)",
                ink: "rgb(var(--color-ink) / <alpha-value>)",
                muted: "rgb(var(--color-muted) / <alpha-value>)",
                faint: "rgb(var(--color-faint) / <alpha-value>)",
                line: "rgb(var(--color-line) / <alpha-value>)",
                "line-strong": "rgb(var(--color-line-strong) / <alpha-value>)",
                accent: "rgb(var(--color-accent) / <alpha-value>)",
                "accent-ink": "rgb(var(--color-accent-ink) / <alpha-value>)",
                "accent-soft": "rgb(var(--color-accent-soft) / <alpha-value>)",
                status: {
                    in: "rgb(var(--color-st-in) / <alpha-value>)",
                    low: "rgb(var(--color-st-low) / <alpha-value>)",
                    out: "rgb(var(--color-st-out) / <alpha-value>)",
                    "in-ink": "rgb(var(--color-st-in-ink) / <alpha-value>)",
                    "low-ink": "rgb(var(--color-st-low-ink) / <alpha-value>)",
                    "out-ink": "rgb(var(--color-st-out-ink) / <alpha-value>)",
                    "out-line": "rgb(var(--color-st-out-line) / <alpha-value>)",
                },
                danger: "rgb(var(--color-danger) / <alpha-value>)",
                "danger-ink": "rgb(var(--color-danger-ink) / <alpha-value>)",
                "danger-soft": "rgb(var(--color-danger-soft) / <alpha-value>)",
            },
            boxShadow: {
                card: "0 1px 2px rgba(30,40,25,.04), 0 6px 20px rgba(30,40,25,.06)",
            },
            maxWidth: {
                page: "36rem", // 576px。本文とナビの共通幅
            },
        },
    },

    plugins: [forms],
};
