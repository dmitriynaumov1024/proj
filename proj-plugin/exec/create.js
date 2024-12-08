#!/usr/bin/env node

const fs = require("node:fs")
const path = require("node:path")

let args = process.argv.slice(2)

const outputPath = args[0]
if (!outputPath) console.log("usage: command <outputPath: String>")

const pluginName = args[1] ?? "plugin"
const pluginVersion = args[2] ?? "0.0.1"

const packageJsonText = JSON.stringify({
    "name": pluginName,
    "version": pluginVersion,
    "private": true,
    "scripts": {
        "build": "vite build --mode prod",
        "build-debug": "vite build --mode debug --minify false"
    },
    "dependencies": {
        "vue": "^3.2.47"
    },
    "devDependencies": {
        "@vitejs/plugin-vue": "^3.0.3",
        "vite": "^3.0.9"
    }
}, null, 4)

const viteConfigJsText = `// ${pluginName}@${pluginVersion}
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
            name: '${pluginName}',
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
`

const mainJsText = `// ${pluginName}@${pluginVersion}
// created by create-proj-plugin

export default { 
    install(app) {
        console.log("${pluginName} installed!")
    },
    mount(app) {
        console.log("${pluginName} mounted!")
    }
}

import "./style.css"

`

const styleCssText = `/* ${pluginName}@${pluginVersion} */
`

const entries = [
    {
        dir: outputPath
    },
    {
        dir: path.join(outputPath, "src")
    },
    {
        file: path.join(outputPath, "package.json"),
        text: packageJsonText
    },
    {
        file: path.join(outputPath, "vite.config.js"),
        text: viteConfigJsText
    },
    {
        file: path.join(outputPath, "src", "main.js"),
        text: mainJsText
    },
    {
        file: path.join(outputPath, "src", "style.css"),
        text: styleCssText
    }
]

console.log(`creating ${pluginName} package in ${outputPath}...`)

for (let entry of entries) {
    if (entry.dir) {
        console.log("mkdir "+ entry.dir)
        fs.mkdirSync(entry.dir, { recursive: true })
    }
    else if (entry.file && entry.text) {
        console.log("write file "+ entry.file)
        fs.writeFileSync(entry.file, entry.text, { encoding: "utf-8" })
    }
}

console.log("done")
