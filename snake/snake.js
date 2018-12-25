Vue.component('grid-div', {
    props: ['x', 'y'],
    computed: {
        posStyle() {
            return {
                'grid-column': this.x + 1,
                'grid-row': this.y + 1
            }
        }
    },
    template: `<div :style="posStyle"/>`
})

let game = new Vue({
    el: '#app',
    data: {
        hint: '🐍snake🐍😵🍱🎉',
        end: false,
        size: [50, 50],

        head: [0, 0],
        /** [ [x,y] , [x2,y2] , ... ]  */
        body: [[0, 1], [0, 2], [1, 2]],
        foods: [[5, 5]],

        movement: { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }, //possible movement
        moveIntent: undefined,
    },
    computed: {
        width() { return this.size[0] },
        height() { return this.size[1] },
        gridStyle() {
            return {
                'grid-template-columns': `repeat(${this.width},1fr)`,
                'grid-template-rows': `repeat(${this.height},1fr)`
            }
        }
    },
    methods: {
        move(dx, dy) { },

        /** return pos to random empty cell */
        randomEmptyGrid() {
            let all = [].concat([this.head], this.body, this.foods)
            let lookup = new Set(...all.map(p => this.flatten(p)))//use array to get O(n) //this **can** be cached and incrementally update
            let number_of_empty = this.width * this.height - lookup.size
            let nempty = randomInt(number_of_empty)
            let index = 0

            while (nempty) {
                if (!lookup.has(index)) {
                    --nempty
                }
                ++index
            }
            return this.deflatten(index)
        },

        /** return y*width + x */
        flatten(x, y) { return y * width + x },

        /** get [x,y] from flattened index */
        deflatten(flatIndex) { return [Math.floor(flatIndex / this.width), flatIndex % this.width] }
    },
    created() {
        const [w, h] = this.size
        // random init pos
        this.head = [randomInt(w), randomInt(h)]


        // random foods
    },
    mounted() {
        const { up, down, left, right } = this.movement;
        RegisterGlobalArrowKeyHandler(
            () => this.moveIntent = up,//up
            () => this.moveIntent = down,//down
            () => this.moveIntent = left,//left
            () => this.moveIntent = right//right
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

/**
 * return int between [0,upper)
 * @param {Number} upper
 */
function randomInt(upper) {
    return Math.floor(Math.random() * upper)
}