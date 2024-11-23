import { fileURLToPath, URL } from "node:url"
import { defineConfig } from "vite"
import vuePlugin from "@vitejs/plugin-vue"

function nodePolyfillPlugin () {
    const mappings = {
        "node:buffer": "__br-buffer",
        "node:crypto": "__br-crypto"
    }
    const virtuals = {
        "__br-buffer": "import { Buffer } from 'buffer'; export { Buffer };",
        "__br-crypto": "const crypto = window.crypto; export default crypto;"
    }
    return [
        {
            name: "nativemodule-premap",
            enforce: "pre",
            resolveId (id) {
                if (mappings[id]) return mappings[id]
            }
        },
        {
            name: "nativemodule-polyfill",
            load (id) {
                if (id.startsWith("__br-")) return virtuals[id]
            }
        }
    ]
}

export default defineConfig({
    plugins: [ 
        vuePlugin(),
        nodePolyfillPlugin()
    ],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
            // "@lib": fileURLToPath(new URL("./lib", import.meta.url)),
            // "@style": fileURLToPath(new URL("./style", import.meta.url))
        }
    },
    build: {
        target: "es2020"
    },
    esbuild: {
        charset: "utf8"
    },
    define: {
        __VUE_OPTIONS_API__: 'true',
        __VUE_PROD_DEVTOOLS__: 'false',
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
    }
})
