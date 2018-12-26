function getConfig() {
    const default_setting = { size: 20, frameskip: 0, fps: 10 }
    let setting
    if (localStorage.snake) {
        try {
            setting = JSON.parse(localStorage.getItem('game-of-life'))
        } catch{
            setting = {}
        }
    }
    return Object.assign(default_setting, setting)
}
