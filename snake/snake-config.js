function getConfig() {
    const default_setting = { size: 20, auto: true, nfood: 2 }
    let setting
    if (localStorage.snake) {
        try {
            setting = JSON.parse(localStorage.snake)
        } catch{
            setting = {}
        }
    }

    return Object.assign(default_setting, setting)
}

const config = new Vue({
    el: '#config-app',
    data: Object.assign(getConfig(), { collapse: true }),
    methods: {
        apply() {
            const { size, auto, nfood } = this
            localStorage.snake = JSON.stringify({ size, auto, nfood })
            window.location.reload()
        },
        cancel() {
            this.collapse = true
        }
    },
    computed:{
        movementIcon() {
            return this.auto ? '🚀' : '🐢'
        }
    }
})