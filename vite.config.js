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
            "@primitives": path.resolve(
                __dirname,
                "./src/components/Primitives"
            ),
            "@components": path.resolve(__dirname, "./src/components"),
            "@astar": path.resolve(__dirname, "./src/utils/astar"),
            "@utils": path.resolve(__dirname, "./src/utils/utils"),
        },
    },
});
