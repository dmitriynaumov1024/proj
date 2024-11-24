import { h } from "vue"

export default {
    beforeMount() {
        if (this.$http.hasValidSession) {
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

