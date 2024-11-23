import { h } from "vue"

import HeaderLayout from "../comp.layout/header.js"
import FooterLayout from "../comp.layout/footer.js"

let LoginStage = {
    begin: 0,
    userName: 0,
    password: 1 
}

export default {
    data() {
        return {
            stage: LoginStage.begin,
            userName: ""
        }
    },
    methods: {
        onSubmitUserName() {
            this.stage = LoginStage.password
        },
        onSubmitPasswords() {

        }
    },
    render() {
        return h("div", { class: ["ww", "h100", "scroll"] }, [
            h(HeaderLayout, { }, ()=> [
                h("h2", { }, [
                    h("img", { class: ["icon-20"], src: "/icon/mascot.1.svg" }), " ",
                    h("span", "Log in")
                ])
            ]),
            h("div", { class: ["bv", "hmin70"] }, [
                h("div", { class: ["wc", "pad-1-05"] }, [
                    h("p", { }, "Username"),
                    h("input", { 
                        class: ["block", "mar-b-05"],
                        readonly: this.stage!=LoginStage.userName, 
                        value: this.userName, 
                        onChange: (e)=> this.userName = e.target.value, 
                        placeholder: "user" 
                    }),
                    this.stage==LoginStage.password? [
                        h("p", { }, "LoginStage.password coming soon!"),
                    ] : [
                        h("button", { 
                            class: ["block", "mar-b-05"], 
                            onClick: ()=> this.onSubmitUserName() 
                        }, "Proceed"),
                    ]
                ])
            ]),
            h(FooterLayout)
        ])
    }
}
