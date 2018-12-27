let playground
let width = 12
let height = 30
/** micro seconds to fall down one block */
let fall_interval = 300
let fall_timer

/**
 * active (moving) blocks
 * @type {GridItem[]}
 */
let activeBlocks;
/**
 * anchor (rotation center) of blocks
 * @type {GridItem}
 */
let activeBlocks_anchor

/**
 * grid of blocks
 * @type {GridItem[]}
 */
let grids = []

function outside_grid(x, y) {
    return x < 0 || x >= width || y < 0 || y >= height
}

function inside_grid(x, y) {
    return !outside_grid(x, y)
}

function get_grid(x, y) {
    return inside_grid(x, y) && grids[x + y * width]
}

function set_grid(x, y, block) {
    return inside_grid(x, y) && (grids[x + y * width] = block)
}


let game = new Vue({
    el: "#playground",
    data: { width, height },
    computed: {
        staticStyle() {
            const { width, height } = matchWindowSize(this.width, this.height, 1.0)

            return {
                gridTemplateRows: `repeat(${this.height},1fr)`,
                gridTemplateColumns: `repeat(${this.width},1fr)`,
                width: `${width}px`,
                height: `${height}px`
            }

        },
    }
})

function init() {
    playground = document.getElementById('playground')

    fall_timer = setInterval(MoveDownOrNewOrEnd, fall_interval)

    activeBlocks_anchor = new GridItem(0, 0, playground)
    activeBlocks_anchor.element.classList.add('anchor')
    GenerateBlocks(RandomTetris(), Math.floor(width / 2 - 1), 0)
}

function MoveDownOrNewOrEnd() {
    let success = TryMove(0, 1)
    if (success) return true

    activeBlocks.forEach(x => set_grid(x.x, x.y, x))
    CheckRows()

    if (activeBlocks.find(x => x.y < 1)) {
        End()
        return false
    }
    GenerateBlocks(RandomTetris(), Math.floor(Math.random(width / 3) + width / 2 - 1), 0)
    return false
}

function CheckRows() {
    let target_rows = [... new Set(activeBlocks.map(x => x.y))]
    const columns = Array(width).fill().map((x, i) => i) //[1,2,...,width-1]
    let remove_rows = target_rows.filter(y => columns.every(x => get_grid(x, y) instanceof GridItem))
    let dy = Array(height).fill(0)
    for (let y of remove_rows) {
        //remove
        for (let x of columns) {
            get_grid(x, y).detech()
            set_grid(x, y, undefined)
        }
        for (let i = 0; i < y; ++i) {
            ++dy[i]
        }
    }

    for (let y = height - 1; y >= 0; --y) {
        for (let x of columns) {
            let block = get_grid(x, y)
            if (!block) continue
            set_grid(x, y, undefined)
            set_grid(x, y + dy[y], block)
            block.y += dy[y]
        }
    }
}

function End() {
    clearInterval(fall_timer)
    controller.detach_all()
}

function TryRotate() {
    let [cx, cy] = activeBlocks_anchor.pos
    let deltas = activeBlocks.map(x => [x.x - cx, x.y - cy])
    deltas = deltas.map(([dx, dy]) => [-dy, dx])
    let new_pos = deltas.map(([dx, dy]) => [cx + dx, cy + dy])

    if (!new_pos.every(p => inside_grid(...p) && !get_grid(...p)))
        return false

    for (let i = 0; i < activeBlocks.length; ++i) {
        activeBlocks[i].pos = new_pos[i]
    }
    return true
}

let down = false;
function Down() {
    if (down) return
    down = true;
    clearInterval(fall_timer)
    requestAnimationFrame(_Down)
}

function _Down() {
    if (MoveDownOrNewOrEnd()) {
        requestAnimationFrame(_Down)
        return
    }

    down = false;
    fall_timer = setInterval(MoveDownOrNewOrEnd, fall_interval)
}

/**
 * try move activeBlocks by dx, dy
 * no action if any Block cannot move
 * @param {number} dx
 * @param {number} dy
 */
function TryMove(dx, dy) {

    // check for overlap after move
    if (!activeBlocks
        .map(b => [b.x + dx, b.y + dy])
        .every(p => inside_grid(...p) && !get_grid(...p))
    ) { return false }

    //no overlap, move
    activeBlocks.forEach(x => { x.x += dx, x.y += dy })
    activeBlocks_anchor.x += dx;
    activeBlocks_anchor.y += dy;
    return true
}

class GridItem {
    constructor(x, y, parent) {
        this.element = document.createElement('div')
        this.x = x
        this.y = y
        this.parent = parent
        parent.appendChild(this.element)
    }

    attach() {
        this.parent.appendChild(this.element)
    }

    detech() {
        this.parent.removeChild(this.element)
    }

    set x(value) { this._x = value; this.element.style.gridColumn = value + 1; }
    get x() { return this._x; }
    set y(value) { this._y = value; this.element.style.gridRow = value + 1; }
    get y() { return this._y; }
    set pos(p) { this.x = p[0]; this.y = p[1]; }
    get pos() { return [this.x, this.y] }
}


/**
 * generate blocks onto *x* and *y*, regardless of existed blocks
 * @param {tetris_template} template template for new blocks
 * @param {number} x upperleft-x 
 * @param {number} y upperleft-y
 * @param {string} color css color string or false value for random color
 */
function GenerateBlocks(template, x, y, color) {
    color = color || `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`

    activeBlocks = template.map(([dx, dy]) => new GridItem(x + dx, y + dy, playground))
    activeBlocks.forEach(b => b.element.style.backgroundColor = color)
    activeBlocks_anchor.pos = [x, y]
}

/** @typedef {number[][]} tetris_template */

/**
 * template of tetris
 * @enum {tetris_template}
 */
const tetris_blocks = {
    'L1': [[0, 0], [0, 1], [0, 2], [1, 0]],
    'L2': [[0, 0], [0, 1], [0, 2], [-1, 0]],
    'T': [[-1, 0], [0, 0], [1, 0], [0, 1]],
    'O': [[0, 0], [0, 1], [1, 0], [1, 1]],
    'I': [[-1, 0], [0, 0], [1, 0], [2, 0]],
}

function RandomTetris() {
    let choice = Object.keys(tetris_blocks)
    return tetris_blocks[choice[Math.floor(Math.random() * choice.length)]]
}

init()