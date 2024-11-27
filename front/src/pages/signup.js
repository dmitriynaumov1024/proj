import { h } from "vue"
import { RouterLink } from "vue-router"

import HeaderLayout from "@/comp.layout/header.js"
import FooterLayout from "@/comp.layout/footer.js"

const SignupStage = {
    begin: 0,
    complete: 2
}

const signupStageViews = {
    [SignupStage.begin](self) {
        const loc = self.$locale.current
        return [
            h("div", { class: ["mar-b-1"] }, [
                h("p", { }, loc.signup.userName),
                h("input", { class: ["block"],
                    value: self.userName, 
                    onChange: (e)=> self.userName = e.target.value, 
                    placeholder: "user",
                    invalid: self.badFields?.userName
                }),
            ]),
            h("div", { class: ["mar-b-1"] }, [
                h("p", { }, loc.signup.email),
                h("input", { class: ["block"],
                    value: self.email, 
                    onChange: (e)=> self.email = e.target.value, 
                    placeholder: "user",
                    invalid: self.badFields?.email
                }),
            ]),
            h("div", { class: ["mar-b-1"] }, [
                h("p", { }, loc.signup.displayName),
                h("input", { class: ["block"],
                    value: self.displayName, 
                    onChange: (e)=> self.displayName = e.target.value, 
                    placeholder: "user",
                    invalid: self.badFields?.displayName
                }),
            ]),
            self.errorMessage?
            h("p", { class: ["mar-b-1", "color-bad"] }, self.errorMessage): null,
            h("button", {
                class: ["block"],
                onClick: ()=> self.onSubmit(),
            }, self.errorMessage? loc.action.retry : loc.action.proceed)
        ]
    },
    [SignupStage.complete](self) {
        const loc = self.$locale.current
        return [
            h("p", { class: ["mar-b-05"] }, loc.signup.successfulSignup),
            h("p", { class: ["mar-b-1"] }, loc.signup.nowLogin(self.userName)),
            h("p", { }, h(RouterLink, { to: "/login" }, ()=> loc.signup.goToLogin))
        ]
    }
}

export default {
    data() {
        return {
            stage: SignupStage.begin,

            userName: "",
            email: "",
            displayName: "",

            errorMessage: null,
            badFields: { }
        }
    },
    methods: {
        async signup() {
            const loc = this.$locale.current
            this.badFields = { }
            this.errorMessage = null
            let result = await this.$http.invoke("/user/create", {
                user: { userName: this.userName, displayName: this.displayName, email: this.email }
            })
            if (result.success) {
                this.stage = SignupStage.complete
            }
            else if (result.exists == "userName") {
                this.badFields.userName = true
                this.errorMessage = loc.error.usernameExists 
            }
            else if (result.bad) {
                if (!(result.bad instanceof Array)) result.bad = [result.bad]
                for (let bf of result.bad) this.badFields[bf] = true
                this.errorMessage = loc.error.badFields(result.bad)
            }
            else {
                this.errorMessage = loc.error.other
            }
        },
        onSubmit() {
            this.signup()
        },
        onGoToLogin() {
            this.$router.replace("/login")
        }
    },
    render() {
        const loc = this.$locale.current
        return h("div", { class: ["ww", "h100", "scroll"] }, [
            h(HeaderLayout, { }, ()=> [
                h("h2", { }, loc.action.signup)
            ]),
            h("div", { class: ["bv"] }, [
                h("div", { class: ["wc", "pad-05"] }, [
                    loc.signup.haveAccount, " ",
                    h("a", { onClick: ()=> this.onGoToLogin() }, loc.action.login)
                ])
            ]),
            h("div", { class: ["bv", "hmin70"] }, [
                h("div", { class: ["wc", "pad-1-05"] }, [
                    signupStageViews[this.stage](this)
                ])
            ]),
            h(FooterLayout)
        ])
    }
}
