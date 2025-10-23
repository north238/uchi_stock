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
    },
    plugins: [
        laravel({
            input: "resources/js/app.tsx",
            ssr: "resources/js/ssr.tsx",
            refresh: true,
        }),
        react(),
    ],
    optimizeDeps: {
        include: ['react-icons'],
    },
    define: {
        "process.env": process.env,
    },
});
