// dashboard-plugin@0.0.1
// created by create-proj-plugin

import { resolve } from 'path'
import { defineConfig } from 'vite'

import vuePlugin from "@vitejs/plugin-vue"

export default defineConfig({
    plugins: [
        vuePlugin()
    ],
    build: {
        target: "es2020",
        lib: {
            entry: resolve(__dirname, 'src/main.js'),
            name: 'dashboard-plugin',
            fileName: 'plugin',
            formats: ["cjs"]
        },
        rollupOptions: {
            // externalize vue so it's not bundled but re-imported 
            external: ['vue'],
            output: {
                format: "cjs",
                exports: "named",
                globals: { vue: 'Vue' },
            },
        },
    },
})
