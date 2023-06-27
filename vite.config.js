import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
    esbuild: {
        jsxFactory: "h",
        jsxFragment: "Fragment",
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "@component": path.resolve(__dirname, "./src/gameComponents"),
            "@utils": path.resolve(__dirname, "./src/utils"),
            "@primitive": path.resolve(
                __dirname,
                "./src/gameComponents/Primitives"
            ),
        },
    },
});
