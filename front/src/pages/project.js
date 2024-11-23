import { h, createApp } from "vue"
import {RouterLink} from "vue-router"

const NestedAppTemplate = {
    mounted() {
        console.log("nested app mounted")
    },
    unmounted() {
        console.log("nested app unmounted")
    },
    render() {
        return h("div", { style: {"background-color": "#aaded9", "padding": "0.5em"} }, [
            h("p", { }, "NESTED APP CONTENT!"),
            h("p", { }, "LOL")
        ])
    }
}

export default {
    mounted() {
        this.app = createApp(NestedAppTemplate)
        this.app.mount(this.$refs.nested)
    },
    unmounted() {
        this.app?.unmount()
    },
    render() {
        return h("div", { }, [
            h("div", { ref: "main" }, [
                h("p", { }, h(RouterLink, { to: "/" }, ()=> "<< Go to main page")),
                h("p", { }, "Hello! This page has a nested vue app.")
            ]),
            h("div", { ref: "nested" })
        ])
    }
}
