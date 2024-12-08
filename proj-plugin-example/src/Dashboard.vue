<template>
    <div class="pad-025" plugin="dashboard-plugin">
        <div class="mar-b-1 bb">
            <h3 class="mar-b-1">Dashboard</h3>
            <div class="mar-b-05">
                <p>Group by</p>
                <Selectbox style="width: 12rem;" 
                    :items="this.groupByOptions" 
                    :value="this.groupBy" 
                    @change="value=> this.groupBy = value"/>  
            </div>
            <div class="mar-b-05">
                <p>Count metric</p>
                <Selectbox style="width: 12rem;" 
                    :items="this.countMetricOptions"
                    :value="this.countMetric"
                    @change="value=> this.countMetric = value"/>
            </div>
        </div>
        <div class="mar-b-1 bb">
            <h3 class="mar-b-1">Task distribution by {{this.groupByOptions.find(i=> i.value==this.groupBy)?.text}} / by {{this.countMetricOptions.find(i=> i.value==this.countMetric)?.text}} at this moment</h3>
        </div>
        <template v-for="g in this.taskDistribution">
            <div class="mar-b-1 bb">
                <p><b>{{g.head.text}}</b></p>
                <div class="pad-05 text-mono">
                    <template v-for="([status, count], i) in g.items.distribution">
                        <div class="dashboard-row">
                            <div style="width: 15rem;" class="one-line">{{status}}</div>
                            <div :style="{ height: '1rem', width: (0.25+20*count/Math.max(g.items.max, 1))+'rem', backgroundColor: this.colors[i%this.colors.length] }"></div>
                            <div>{{count}}</div>
                        </div>
                    </template>
                    <div class="dashboard-row">
                        <div style="width: 15rem;" class="one-line"><b>max:</b></div>
                        <div><b>{{g.items.max}}</b></div>
                    </div>
                    <div class="dashboard-row">
                        <div style="width: 15rem;" class="one-line"><b>total:</b></div>
                        <div><b>{{g.items.total}}</b></div>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
import Selectbox from "./Selectbox.js"
import { markRaw as m } from "vue"

const countMetricOptions = [
    { value: "count", text: "Count" },
    { value: "points", text: "Points" },
    { value: "hours", text: "Hours" },
]

const groupByOptions = [
    { value: "assigned", text: "Assigned" },
    { value: "taskset", text: "Task set" },
]

const groupingMethods = {
    "assigned"(tasks) {
        let result = { }
        let usersSource = this.app.dataSources.userIds
        for (let task of tasks) {
            result[task.assigned] ??= { head: usersSource.convertItem(usersSource.restoreItem.call(this, task.assigned)), items: [] }
            result[task.assigned].items.push(task)
        }
        return result
    },
    "taskset"(tasks) {
        let result = { }
        let taskSetSource = this.app.dataSources.taskSetIds
        for (let task of tasks) {
            result[task.taskSetId] ??= { head: taskSetSource.convertItem(taskSetSource.restoreItem.call(this, task.taskSetId)), items: [] }
            result[task.taskSetId].items.push(task)
        }
        return result
    }
}

const countingMethods = {
    "count"(task) {
        return 1
    },
    "points"(task) {
        return task.estimatePoints || 0
    },
    "hours"(task) {
        return task.estimateHours || 0
    }
}

function groupByStatus (statuses, items, countMetric) {
    let result = { max: 0, total: 0, distribution: { } }
    for (let item of items) {
        result.distribution[item.status] = (result.distribution[item.status]??0) + countingMethods[countMetric]?.call(null, item)
    }
    for (let key in result.distribution) {
        result.max = Math.max(result.max, result.distribution[key])
        result.total += result.distribution[key]
    }
    let distributionArray = [ ]
    for (let [name, {index}] of Object.entries(statuses)) {
        distributionArray[index] = [name, result.distribution[name]??0]
    }
    return { max: result.max, total: result.total, distribution: distributionArray }
}

const colors = [
    "#64c989",
    "#6684c9",
    "#d95498",
    "#df8856",
    "#f8c044",
]

export default {
    components: {
        Selectbox
    },
    props: {
        parent: Object,
        query: Object
    },
    data() {
        return {
            colors: m(colors),
            countMetricOptions: m(countMetricOptions),
            groupByOptions: m(groupByOptions),
            countMetric: "count",
            groupBy: "taskset",
        }
    },
    computed: {
        taskDistribution() {
            let { project } = this.$storage
            let tasks = Object.values(project.data.taskObjects).filter(t=> t.type=="Task")
            let groupedTasks = groupingMethods[this.groupBy]?.call({ project, app: this.$app }, tasks)
            if (!groupedTasks) return null
            groupedTasks = Object.values(groupedTasks)
                .map(({ head, items })=> ({ head, items: groupByStatus(project.data.taskStatuses, items, this.countMetric) }))
            return groupedTasks
        }
    }
}

</script>
