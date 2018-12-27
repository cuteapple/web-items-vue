const default_setting = { size: 20, frameskip: 0, fps: 10 }
function getConfig() {
    try {
        const data = JSON.parse(localStorage.getItem(window.location.pathname))
        return Object.assign({}, default_setting, data)
    } catch{
        return Object.assign({}, default_setting)
    }
}

function writeConfig(config) {
    localStorage.setItem(window.location.pathname, JSON.stringify(config))
}

const options = new Vue({
    el: '#options', data: getConfig(),
    methods: {
        apply() {
            let { size, frameskip, fps } = this
            writeConfig({ size, frameskip, fps })
            window.location.reload()
        },
        applyDefault() {
            writeConfig(default_setting)
            window.location.reload()
        }
    }
})