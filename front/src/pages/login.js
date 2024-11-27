import { h } from "vue"

import HeaderLayout from "@/comp.layout/header.js"
import FooterLayout from "@/comp.layout/footer.js"

let LoginStage = {
    begin: 0,
    userName: 0,
    password: 1,
    complete: 2
}

let loginStageViews = {
    [LoginStage.userName](self) {
        const loc = self.$locale.current
        return [
            h("p", { }, loc.user.userName),
            h("input", { 
                class: ["block", "mar-b-05"],
                value: self.userName, 
                onChange: (e)=> self.userName = e.target.value, 
                placeholder: "user",
                invalid: self.badFields?.userName
            }),
            h("p", { class: ["color-bad", "mar-b-05"] }, self.errorMessage),
            h("button", { 
                class: ["block", "mar-b-05"], 
                onClick: ()=> self.onSubmitUserName() 
            }, self.errorMessage? loc.action.retry : loc.action.proceed),
        ]
    },
    [LoginStage.password](self) {
        const loc = self.$locale.current
        return [
            h("p", { }, loc.user.userName),
            h("input", { 
                class: ["block", "mar-b-05"],
                readonly: true, value: self.userName
            }),
            h("p", { class: ["mar-b-05"] }, [
                loc.login.loginWithAnotherName, " ", h("a", { onClick: ()=> self.onRetryUserName() }, loc.login.startOver)
            ]),
            self.methods?.password? [
                h("p", { }, loc.user.password),
                h("input", {
                    class: ["block", "mar-b-05"],
                    type: "password",
                    value: self.password,
                    onChange: (e)=> self.password = e.target.value,
                    invalid: self.badFields?.password
                })
            ]: null,
            self.methods?.shortCode? [
                h("p", { }, loc.login.shortCodeSent),
                h("input", {
                    class: ["block", "mar-b-05"],
                    value: self.shortCode,
                    onChange: (e)=> self.shortCode = e.target.value,
                    invalid: self.badFields?.shortCode,
                    placeholder: "000000"
                }),
                self.canResendCode? [
                    h("p", { class: ["mar-b-05"] }, [
                        loc.login.notReceiveShortCode, " ", h("a", { onClick: ()=> self.onRetryShortCode() }, loc.login.sendAgain)
                    ])
                ]: null
            ]: null,
            h("p", { class: ["color-bad", "mar-b-05"] }, self.errorMessage),
            h("button", { 
                class: ["block", "mar-b-05"], 
                onClick: ()=> self.onSubmitPasswords() 
            }, self.errorMessage? loc.action.retry : loc.action.proceed),
        ]
    },
    [LoginStage.complete](self) {
        const loc = self.$locale.current
        return [
            h("p", { }, loc.login.successfulLogin)
        ]
    }
}

export default {
    data() {
        return {
            stage: LoginStage.begin,
            methods: { },
            badFields: { },
            userName: "",
            password: "",
            shortCode: "",
            errorMessage: "",

            canResendCode: false,
            canResendCodeTimeout: null
        }
    },
    methods: {
        async beginAuth() {
            const loc = this.$locale.current
            this.errorMessage = null
            this.badFields = { }
            this.shortCode = ""
            clearTimeout(this.canResendCodeTimeout)
            this.canResendCode = false
            try {
                let result = await this.$http.beginAuth({ userName: this.userName })
                if (result.success) {
                    this.methods = { }
                    for (let m of result.method) this.methods[m] = true
                    this.stage = LoginStage.password
                    this.canResendCodeTimeout = setTimeout(()=> this.canResendCode = true, 30*1000)
                }
                else if (result.bad) {
                    if (!(result.bad instanceof Array)) result.bad = [result.bad]
                    for (let bf of result.bad) this.badFields[bf] = true
                }
                else {
                    this.errorMessage = loc.error.other
                }
            }
            catch(error) {
                console.error(error)
                this.errorMessage = loc.error.other
            }
        },
        async completeAuth() {
            const loc = this.$locale.current
            this.badFields = { }
            this.errorMessage = null
            try {
                let result = await this.$http.completeAuth({ 
                    password: this.password, 
                    shortCode: this.shortCode 
                })
                if (result.success) {
                    this.stage = LoginStage.complete
                    setTimeout(()=> this.$router.replace("/me"), 1000)
                }
                else if (result.bad) {
                    if (!(result.bad instanceof Array)) result.bad = [result.bad]
                    for (let bf of result.bad) this.badFields[bf] = true
                }
                else {
                    this.errorMessage = loc.error.other
                }
            }
            catch (error) {
                console.error(error)
                this.errorMessage = loc.error.other
            }
        },
        onSubmitUserName() {
            this.beginAuth()
        },
        onSubmitPasswords() {
            this.completeAuth()
        },
        onRetryShortCode() {
            this.beginAuth()
        },
        onRetryUserName() {
            clearTimeout(this.canResendCodeTimeout)
            this.canResendCode = false
            this.stage = LoginStage.userName
            this.errorMessage = null
            this.shortCode = ""
            this.password = ""
        },
        onGoToSignup() {
            this.$router.replace("/signup")
        }
    },
    render() {
        const loc = this.$locale.current
        return h("div", { class: ["ww", "h100", "scroll"] }, [
            h(HeaderLayout, { }, ()=> [
                h("h2", { }, loc.action.login)
            ]),
            h("div", { class: ["bv"] }, [
                h("div", { class: ["wc", "pad-05"] }, [
                    loc.login.haveNoAccount, " ",
                    h("a", { onClick: ()=> this.onGoToSignup() }, loc.action.signup)
                ])
            ]),
            h("div", { class: ["bv", "hmin70"] }, [
                h("div", { class: ["wc", "pad-1-05"] }, [
                    loginStageViews[this.stage](this)
                ])
            ]),
            h(FooterLayout)
        ])
    }
}
