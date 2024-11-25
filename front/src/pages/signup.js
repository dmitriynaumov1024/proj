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
        return [
            h("div", { class: ["mar-b-1"] }, [
                h("p", { }, "Your unique username - required"),
                h("input", { class: ["block"],
                    value: self.userName, 
                    onChange: (e)=> self.userName = e.target.value, 
                    placeholder: "user",
                    invalid: self.badFields?.userName
                }),
            ]),
            h("div", { class: ["mar-b-1"] }, [
                h("p", { }, "Email address to send confirmation codes and system notifications - required"),
                h("input", { class: ["block"],
                    value: self.email, 
                    onChange: (e)=> self.email = e.target.value, 
                    placeholder: "user",
                    invalid: self.badFields?.email
                }),
            ]),
            h("div", { class: ["mar-b-1"] }, [
                h("p", { }, "Display name: how to call you? - optional"),
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
            }, self.errorMessage? "Try again" : "Proceed")
        ]
    },
    [SignupStage.complete](self) {
        return [
            h("p", { class: ["mar-b-05"] }, "You have successfully signed up."),
            h("p", { class: ["mar-b-1"] }, `Now you can log in with username = ${self.userName}.`),
            h("p", { }, h(RouterLink, { to: "/login" }, ()=> "Go to Log in page"))
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
                this.errorMessage = `Unfortunately, username ${this.userName} is already taken.` 
            }
            else if (result.bad) {
                if (!(result.bad instanceof Array)) result.bad = [result.bad]
                for (let bf of result.bad) this.badFields[bf] = true
                this.errorMessage = `Some fields (${result.bad.join(', ')}) contain inappropriate values.`
            }
            else {
                this.errorMessage = "Something went wrong. Check console for details."
            }
        },
        onSubmit() {
            this.signup()
        }
    },
    render() {
        return h("div", { class: ["ww", "h100", "scroll"] }, [
            h(HeaderLayout, { }, ()=> [
                h("h2", { }, [
                    h("img", { class: ["icon-15"], src: "/icon/mascot.1.svg" }), " ",
                    h("span", "Sign up")
                ])
            ]),
            h("div", { class: ["bv"] }, [
                h("div", { class: ["wc", "pad-05"] }, [
                    "Have an account? ",
                    h(RouterLink, { to: "/login" }, ()=> "Log in")
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
