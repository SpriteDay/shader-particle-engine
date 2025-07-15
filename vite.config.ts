import { resolve } from "path"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

export default defineConfig({
    plugins: [
        dts({
            rollupTypes: true,
        }),
    ],
    build: {
        lib: {
            // Could also be a dictionary or array of multiple entry points
            entry: resolve(__dirname, "src/SPE.ts"),
            name: "SPE",
            // the proper extensions will be added
            fileName: "spe",
        },
        rollupOptions: {
            // make sure to externalize deps that shouldn't be bundled
            // into your library
            external: ["three"],
            output: {
                // Provide global variables to use in the UMD build
                // for externalized deps
                globals: {
                    three: "THREE",
                },
            },
        },
    },
})
