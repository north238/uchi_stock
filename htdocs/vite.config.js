import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
    server: {
        host: "0.0.0.0", // --hostオプションでも同じ設定が可能
        port: 5173,
        hmr: {
            host: "localhost",
        },
        watch: {
            usePolling: true,
            interval: 1000,
        },
    },
    plugins: [
        laravel({
            input: "resources/js/app.tsx",
            ssr: "resources/js/ssr.tsx",
            refresh: true,
        }),
        react(),
    ],
    define: {
        "process.env": process.env,
    },
});
