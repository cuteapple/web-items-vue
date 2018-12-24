Vue.component('puzzle-tile', {
    props: ['number', 'match', 'cursor'],
    template: `<img :class="['tile',cursor?'cursor':'']" :src="'img/'+number+'.png'"></div>`
})


let grid_utils = {
    flatten: ([x, y]) => x + y * 3,
    inbound: ([x, y]) => x >= 0 && x < 3 && y >= 0 && y < 3,
    xy: index => [index % 3, Math.floor(index / 3)]
}

/**
 * return int between [0,upper)
 * @param {Number} upper
 */
function randomInt(upper) {
    return Math.floor(Math.random() * upper)
}

let game = new Vue({
    el: '#app',
    data: {
        hint: "8-puzzle",
        grid: [[0, 1, 2], [3, 4, 5], [6, 7, 8]],
        cursorPos: [randomInt(3), randomInt(3)], //any value can becomes the cursor
        movement: { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }, //possible movement
        initShuffleIteration: 1000, //number of attempt to do a random move at init
    },
    computed: {
        cursorIndex() {
            return grid_utils.flatten(this.cursorPos)
        },
        numbers() {
            return [].concat(...this.grid)
        },
        end() {
            return this.numbers.every((v, i) => v == i)
        }
    },
    methods: {
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
            this.grid = this.grid.concat([])

            if (this.end) {
                this.hint = '🎉'
            }
        }
    },
    created() {
        const movement = Object.values(this.movement)
        for (let i = 0; i < this.initShuffleIteration; ++i) {
            this.move(...movement[randomInt(movement.length)])
        }
    },
    mounted() {
        let { up, down, left, right } = this.movement;
        RegisterGlobalArrowKeyHandler(
            () => this.move(...up),//up
            () => this.move(...down),//down
            () => this.move(...left),//left
            () => this.move(...right)//right
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