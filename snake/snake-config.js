function getConfig() {
    const default_setting = { size: 20, auto: true }
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

const config_app = new Vue({
    el: '#config-app',
    data: Object.assign(getConfig(), { collapse: true }),
    methods: {
        apply() {
            const { size, auto } = this
            localStorage.snake = JSON.stringify({ size, auto })
            window.location.reload()
        },
        cancel() {
            this.collapse = true
        }
    },
})