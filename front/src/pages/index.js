import { h } from "vue"

export default {
    async beforeMount() {
        if (await this.$http.hasValidSession()) {
            this.$router.replace("/me")
        }
        else {
            this.$router.replace("/intro")
        }
    },
    render() {
        return []
    }
}

