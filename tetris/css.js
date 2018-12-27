
/**
 * 
 * @param {HTMLElement} playground target
 * @param {number} width number of columns in playground
 * @param {number} height number of rows in playground
 */
function apply_cssjs(playground, width, height) {
    //border_animation
    //since css animation takes too much CPU
    {
        const duration = 10; //sec
        const fps = 30; //much lower than css (can I constraint on css?)

        let delta = 360 / (duration * fps)
        let interval = Math.round(1000 / fps)
        let color = 0

        setInterval(function border_animation() {
            color += delta
            if (color >= 360) color -= 360
            let icolor = Math.floor(color)
            playground.style.borderColor = `hsl(${icolor},100%,50%)`
        }, interval)
    }
}

/**
 * scale size to match screensize*max_ratio
 * @param {Number} width current width
 * @param {Number} height current height
 * @param {Number} max_ratio max occupy ratio, default to 1.0
 */
function matchWindowSize(width, height, max_ratio) {
    max_ratio = max_ratio || 1.0

    const scwidth = window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth;

    const scheight = window.innerHeight
        || document.documentElement.clientHeight
        || document.body.clientHeight;

    //adjust width and height of playground
    let sw = scwidth / width //pixel width per unit
    let sh = scheight / height //pixel height per unit

    let s = Math.min(sw, sh) * max_ratio
    return { width: Math.floor(s * width), height: Math.floor(s * height)}
}
