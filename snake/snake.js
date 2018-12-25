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
        body: [],
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
        move(dx, dy) {
            let [x, y] = this.head
            let newPos = [x + dx, y + dy]

            //move back is noop
            if (this.body.length && this.posEqual(newPos, this.body[0])) {
                return
            }

            //eating foods
            for (let food of this.foods) {
                if (this.posEqual(newPos, food)) {
                    this.body.push([...food])//the exact posision is not important, would erased by body move
                    let new_food = this.randomEmptyGrid()
                    food[0] = new_food[0]
                    food[1] = new_food[1]
                    this.foods = [...this.foods]//trigger update
                }
            }

            //move on
            if (this.body.length) {
                this.body = [this.head, ...this.body.slice(0, -1)]
            }
            this.head = newPos
        },

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
        flatten(x, y) { return y * this.width + x },

        /** get [x,y] from flattened index */
        deflatten(flatIndex) { return [Math.floor(flatIndex / this.width), flatIndex % this.width] },

        /** check equality of two position */
        posEqual(p1, p2) { return this.flatten(p1) == this.flatten(p2) }
    },
    created() {
    },
    mounted() {
        const { up, down, left, right } = this.movement;
        RegisterGlobalArrowKeyHandler(
            () => { this.moveIntent = up },//up
            () => { this.moveIntent = down },//down
            () => { this.moveIntent = left },//left
            () => { this.moveIntent = right }//right
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