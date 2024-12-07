// to do later timestamp box
import { h } from "vue"

function parseTS (utcvalue, timezone) {
    let date = new Date(utcvalue + timezone)
    return {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth(),
        day: date.getUTCDate(),
        hour: date.getUTCHours(),
        minute: date.getUTCMinutes()
    }
}


// timezone ms
function toTS ({ year, month, day, hour, minute }, timezone) {
    return Date.UTC(year, month, day, hour, minute, 0, -timezone)
}

const daysInMonth = [
    31, 28, 31, 30, 31, 30,
    31, 31, 30, 31, 30, 31 
]

let limits = {
    year: {
        min: 2000,
        max: 2100 
    },
    month: {
        min: 0,
        max: 11
    },
    day: {
        min: 1,
        max: (month)=> daysInMonth[month]?? 1
    },
    hour: {
        min: 0,
        max: 23
    },
    minute: {
        min: 0,
        max: 59
    }
}

export default {
    props: {
        timezone: Number,
        value: Number,
        disabled: Boolean
    },
    emits: [
        "change"
    ],
    data() {
        return {
            expanded: false
        }
    },
    methods: {
        onToggleExpand() {
            if (this.disabled) return false
            this.expanded = !this.expanded
        },
        onPlus (localts, field) {
            if (this.disabled) return false
            if (field == 'day') {
                if (localts.day<limits.day.max(localts.month)) {
                    this.$emit("change", toTS(Object.assign(localts, { day: localts.day + 1 }), this.timezone))
                }
            }
            else if (localts[field]<limits[field].max) {
                this.$emit("change", toTS(Object.assign(localts, { [field]: localts[field] + 1 }), this.timezone))
            }
        },
        onMinus (localts, field) {
            if (this.disabled) return false
            if (localts[field]>limits[field].min) {
                this.$emit("change", toTS(Object.assign(localts, { [field]: localts[field] - 1 }), this.timezone))
            }
        }
    },
    render() {
        let localts = parseTS(this.value || Date.now(), this.timezone)
        let { year, month, day, hour, minute } = localts
        return h("div", { class: ["selectbox-wrapper"] }, [
            h("div", { class: ["flex-stripe", "selectbox-header"], onClick: ()=> this.onToggleExpand() }, [
                h("span", { }, `${day.toString().padStart(2, "0")}/${(month+1).toString().padStart(2, "0")}/${year}, ${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`)
            ]),
            h("div", { class: ["selectbox-body", "pad-025"], display: this.expanded }, [
                h("div", { class: ["mar-b-05", "flex-stripe", "flex-pad-05"] }, [
                    h("div", { style: {"flex-basis": "22%", "flex-grow": 1} }, [
                        h("p", { }, "day"),
                        h("div", { }, [
                            h("button", { style: { "width": "25%" }, onClick: ()=> this.onMinus(localts, "day") }, "\u2013"),
                            h("input", { style: { "width": "49%", "text-align": "center" }, value: day.toString().padStart(2, "0"), readonly: true }),
                            h("button", { style: { "width": "25%" }, onClick: ()=> this.onPlus(localts, "day") }, "+"),
                        ])
                    ]),
                    h("div", { style: {"flex-basis": "22%", "flex-grow": 1} }, [
                        h("p", { }, "month"),
                        h("div", { }, [
                            h("button", { style: { "width": "25%" }, onClick: ()=> this.onMinus(localts, "month") }, "\u2013"),
                            h("input", { style: { "width": "49%", "text-align": "center" }, value: (month+1).toString().padStart(2, "0"), readonly: true }),
                            h("button", { style: { "width": "25%" }, onClick: ()=> this.onPlus(localts, "month") }, "+"),
                        ])
                    ]),
                    h("div", { style: {"flex-basis": "30%", "flex-grow": 1} }, [
                        h("p", { }, "year"),
                        h("div", { }, [
                            h("button", { style: { "width": "25%" }, onClick: ()=> this.onMinus(localts, "year") }, "\u2013"),
                            h("input", { style: { "width": "49%", "text-align": "center" }, value: year, readonly: true }),
                            h("button", { style: { "width": "25%" }, onClick: ()=> this.onPlus(localts, "year") }, "+"),
                        ])
                    ]),
                ]),
                h("div", { class: ["mar-b-05", "flex-stripe", "flex-pad-05"] }, [
                    h("div", { style: {"flex-basis": "22%", "flex-grow": 1} }, [
                        h("p", { }, "hour"),
                        h("div", { }, [
                            h("button", { style: { "width": "25%" }, onClick: ()=> this.onMinus(localts, "hour") }, "\u2013"),
                            h("input", { style: { "width": "49%", "text-align": "center" }, value: hour.toString().padStart(2, "0"), readonly: true }),
                            h("button", { style: { "width": "25%" }, onClick: ()=> this.onPlus(localts, "hour") }, "+"),
                        ])
                    ]),
                    h("div", { style: {"flex-basis": "22%", "flex-grow": 1} }, [
                        h("p", { }, "minute"),
                        h("div", { }, [
                            h("button", { style: { "width": "25%" }, onClick: ()=> this.onMinus(localts, "minute") }, "\u2013"),
                            h("input", { style: { "width": "49%", "text-align": "center" }, value: minute.toString().padStart(2, "0"), readonly: true }),
                            h("button", { style: { "width": "25%" }, onClick: ()=> this.onPlus(localts, "minute") }, "+"),
                        ])
                    ]),
                    h("div", { style: {"flex-basis": "30%", "flex-grow": 1} }, [
                        h("p", { }, "tz offset"),
                        h("div", { }, [
                            h("input", { class: ["block", "text-center"], value: Math.floor(this.timezone / 3600000)+"h", readonly: true }),
                        ])
                    ]),
                ]),
            ])
        ])
    }
}
