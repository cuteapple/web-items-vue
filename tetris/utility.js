/**
 * register a set of global arrow key event handler
 * any undefined handler would not cause error
 * @param {()=>void} up handler for up key down event
 * @param {()=>void} down handler for down key down event
 * @param {()=>void} left handler for left key down event
 * @param {()=>void} right handler for right key down event
 */
function RegisterGlobalArrowKeyHandler(up, down, left, right) {
    document.addEventListener('keydown', handler)
    function handler(ev) {
        let target;
        switch (ev.key) {
            case "ArrowLeft": target = left; break;
            case "ArrowRight": target = right; break;
            case "ArrowUp": target = up; break;
            case "ArrowDown": target = down; break;
            default: break; // do nothing
        }
        if (target)
            target();
    }
    return handler
}

function UnRegisterGlobalArrowKeyHandler(handler) { document.removeEventListener('keydown', handler) }

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
    return [Math.floor(s * width), Math.floor(s * height)]
}


/**
 * return int between [0,upper)
 * @param {Number} upper
 */
function randomInt(upper) {
    return Math.floor(Math.random() * upper)
}