Vue.component('puzzle-tile', {
    props: ['number', 'match', 'cursor'],
    computed: {
        correct() {
            return this.number == this.match
        }
    },
    template: `<img :class="['tile',cursor?'cursor':'']" :src="'img/'+number+'.png'"></div>`
})


let grid_utils = {
    flatten: ([x, y]) => x + y * 3,
    inbound: ([x, y]) => x >= 0 && x < 3 && y >= 0 && y < 3,
    xy: index => [index % 3, Math.floor(index / 3)]
}

let game = new Vue({
    el: '#app',
    data: {
        hint: "8-puzzle",
        grid: [[0, 1, 2], [3, 4, 5], [6, 7, 8]],
        cursorPos: [0, 0],
    },
    computed: {
        cursorIndex() {
            return grid_utils.flatten(this.cursorPos)
        },
    },
    methods: {
        numbers() {
            return [].concat(...this.grid)
        },
        /**move cursor to cursorPos + [dx,dy] if possible*/
        move(dx, dy) {
            let [x, y] = this.cursorPos
            let targetPos = [x + dx, y + dy]
            if (!grid_utils.inbound(targetPos)) {
                this.hint = '❌'
                return
            }

            this.hint = '8-puzzle'
            let [nx, ny] = targetPos

            // swap 2 tile
            let tmp = this.grid[ny][nx]
            this.grid[ny][nx] = this.grid[y][x]
            this.grid[y][x] = tmp
            this.cursorPos = targetPos

            // vue do not catch array update (of course neither 2D)
            this.$forceUpdate()
        }
    },
    mounted() {
        RegisterGlobalArrowKeyHandler(
            () => this.move(0, -1),//up
            () => this.move(0, 1),//down
            () => this.move(-1, 0),//left
            () => this.move(1, 0)//right
        )
    }
})

/**
 * register a set of global arrow key event handler
 * any undefined handler would not cause error
 * @param {()=>void} up handler for up key down event
 * @param {()=>void} down handler for down key down event
 * @param {()=>void} left handler for left key down event
 * @param {()=>void} right handler for right key down event
 */
function RegisterGlobalArrowKeyHandler(up, down, left, right) {
    //cuteapple@github 2018
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
}



function move(direction) {
    let [dx, dy] = controller4.to2D(direction, [1, -1])
    let pos = grid_utils.xy(cursor)
    pos[0] += dx
    pos[1] += dy

    if (!grid_utils.inbound(pos)) {
        hint('❌')
        return
    }
    let target = grid_utils.flatten(pos)
    swapTile(grids[cursor].firstChild, grids[target].firstChild)
    cursor = target

    if (test_finish()) {
        hint('🏁')
    }
    else {
        hint('8-puzzle')
    }
}

function test_finish() {
    return tiles.every(x => x.dataset.n == x.parentElement.dataset.n)
}