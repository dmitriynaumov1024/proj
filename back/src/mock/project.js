import { getRandomId } from "./utils.js"

function createTask() {
    return {
        id: getRandomId(),
        type: "Task",
        title: "Example task",
        description: "Some random silly description",
        createdAt: Date.now(),
        assigned: [],
        ownerId: "naumov1024",
        groupId: "taskforce",
        status: "todo"
    }
}

function createComment() {
    return {
        id: getRandomId(),
        authorId: "naumov1024",
        createdAt: Date.now(),
        text: "Example comment **hello** and _bye_"
    }
}

function createProjectData() {
    let task1 = createTask()
    let task2 = createTask()
    return {
        title: "Example project",
        description: "Something with something...",
        createdAt: Date.now(),
        taskObjects: {
            [task1.id]: task1,
            [task2.id]: task2,
        },
        comments: {
            [task1.id]: [
                createComment()
            ],
            [task2.id]: [
                // nothing
            ]
        }
    }
}

function createProjectHistory() {
    return {
        head: "aaaa",
        commits: [ ],
        events: [ 
            {
                id: getRandomId(),
                type: "create",
                description: "naumov1024 has created this project",
                createdAt: Date.now(),
                data: { }
            }
        ]
    }
}

function createProjectInfo() {
    return {
        title: "Example project",
        createdAt: new Date()
    }
}

export {
    createProjectInfo
}

