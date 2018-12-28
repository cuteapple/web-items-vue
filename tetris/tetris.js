//feel free to move this hole file into a function to be *modulelize*, I'd like to KISS

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

function outside_grid(x, y) { return x < 0 || x >= width || y < 0 || y >= height }
function inside_grid(x, y) { return !outside_grid(x, y) }
function get_grid(x, y) { return inside_grid(x, y) && grids[x + y * width] }
function set_grid(x, y, block) { return inside_grid(x, y) && (grids[x + y * width] = block) }

Vue.component('grid-item', {
    props: ['x', 'y', 'color'],
    template: `<div :style=" { gridColumn: x+1, gridRow: y+1, backgroundColor: color} "/>`
})

let renderer = new Vue({
    el: "#playground",
    data: { state: 0 },
    computed: {
        grids() {
            const update = this.state;
            return [].concat(grids, activeBlocks)
        },
        staticStyle() {
            const [vw, vh] = matchWindowSize(width, height, 1.0)
            return {
                gridTemplateRows: `repeat(${height},1fr)`,
                gridTemplateColumns: `repeat(${width},1fr)`,
                width: `${vw}px`,
                height: `${vh}px`
            }
        },
    },
    methods: {
        update() { ++this.state; }
    }
})

function init() {

    RegisterGlobalArrowKeyHandler(
        () => { TryRotate(); renderer.update(); },
        () => { MoveDownOrNewOrEnd(); renderer.update(); },
        () => { TryMove(-1, 0); renderer.update() },
        () => { TryMove(1, 0); renderer.update() }
    )

    fall_timer = setInterval(() => { MoveDownOrNewOrEnd(); renderer.update() }, fall_interval)

    activeBlocks_anchor = new GridItem(0, 0)
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

    return remove_rows
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
    constructor(x, y, color) {
        this.x = x
        this.y = y
        this.color = color
        this.id = GridItem.currentID++;
    }
    set pos(p) { this.x = p[0]; this.y = p[1]; }
    get pos() { return [this.x, this.y] }
}
GridItem.currentID = 0;

/**
 * generate blocks onto *x* and *y*, regardless of existed blocks
 * @param {tetris_template} template template for new blocks
 * @param {number} x upperleft-x 
 * @param {number} y upperleft-y
 * @param {string} color css color string or false value for random color
 */
function GenerateBlocks(template, x, y, color) {
    color = color || `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`

    activeBlocks = template.map(([dx, dy]) => new GridItem(x + dx, y + dy, color))
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