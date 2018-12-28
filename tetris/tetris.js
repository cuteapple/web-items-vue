//feel free to move this hole file into a function/class to be *modulelize*, I'd like to KISS

const width = 12
const height = 30
/** micro seconds to fall down one block */
const fall_interval = 300

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
 * grid of freezed blocks
 * @type {GridItem[]}
 */
let grids = []

function outside_grid(x, y) { return x < 0 || x >= width || y < 0 || y >= height }
function inside_grid(x, y) { return !outside_grid(x, y) }
function get_grid(x, y) { return inside_grid(x, y) && grids[x + y * width] }
function set_grid(x, y, block) { return inside_grid(x, y) && (grids[x + y * width] = block) }

///
/// tetris move functions
///

function MoveDownOrNewOrEnd() {
    let success = TryMove(0, 1)

    //success fall, no need to do checks
    if (success) return

    
    //freeze active Blocks
    activeBlocks.forEach(x => set_grid(x.x, x.y, x))

    //check filled rows
    CheckRows()

    //if touch top, end
    if (activeBlocks.find(x => x.y < 1)) { activeBlocks = []; End(); return }

    //generate new active block
    GenerateActiveBlocks(Math.floor(Math.random(width / 3) + width / 2 - 1), 0)
}

//check and remove filled rows (only check rows effected by activeBlocks)
function CheckRows() {
    let target_rows = [... new Set(activeBlocks.map(x => x.y))]
    const columns = Array(width).fill().map((x, i) => i) //[1,2,...,width-1]
    let remove_rows = target_rows.filter(y => columns.every(x => get_grid(x, y) instanceof GridItem))
    let dy = Array(height).fill(0)

    //remove and calculate deltas
    for (let y of remove_rows) {
        //remove
        for (let x of columns) {
            set_grid(x, y, undefined)
        }
        for (let i = 0; i < y; ++i) {
            ++dy[i]
        }
    }

    //apply deltas (block *falls*)
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

///
/// Grid functions
///

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
 * @param {number} x upperleft-x 
 * @param {number} y upperleft-y
 * @param {string} [color] css color string
 * @param {tetris_template} [template] template for new blocks
 */
function GenerateActiveBlocks(x, y, template, color) {
    template = template || RandomTetrisTemplate()
    color = color || `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`

    activeBlocks = template.map(([dx, dy]) => new GridItem(x + dx, y + dy, color))
    activeBlocks_anchor = new GridItem(x, y)
}

/** @typedef {number[][]} tetris_template */

/**
 * template of tetris
 * @enum {tetris_template}
 */
const tetris_blocks_template = {
    'L1': [[0, 0], [0, 1], [0, 2], [1, 0]],
    'L2': [[0, 0], [0, 1], [0, 2], [-1, 0]],
    'T': [[-1, 0], [0, 0], [1, 0], [0, 1]],
    'O': [[0, 0], [0, 1], [1, 0], [1, 1]],
    'I': [[-1, 0], [0, 0], [1, 0], [2, 0]],
}

function RandomTetrisTemplate() {
    let choice = Object.keys(tetris_blocks_template)
    return tetris_blocks_template[choice[Math.floor(Math.random() * choice.length)]]
}

///
/// start game
///

GenerateActiveBlocks(Math.floor(width / 2 - 1), 0)

const renderer = new Vue({
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
    },
    components: {
        'grid-item': {
            props: ['x', 'y', 'color'],
            template: `<div :style=" { gridColumn: x+1, gridRow: y+1, backgroundColor: color} "/>`
        }
    }
})

const controller = RegisterGlobalArrowKeyHandler(
    () => { TryRotate(); renderer.update(); },
    () => { MoveDownOrNewOrEnd(); renderer.update(); },
    () => { TryMove(-1, 0); renderer.update() },
    () => { TryMove(1, 0); renderer.update() }
)

const fall_timer = setInterval(() => { MoveDownOrNewOrEnd(); renderer.update() }, fall_interval)

//End the game
function End() {
    clearInterval(fall_timer)
    UnRegisterGlobalArrowKeyHandler(controller)
}