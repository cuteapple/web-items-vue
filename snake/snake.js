Vue.component('grid-div', {
    props: ['x', 'y'],
    computed: {
        posStyle() {
            return {
                gridColumn: this.x + 1,
                gridRow: this.y + 1
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
        moveIntent: [0, 0],
        foods: [[5, 5]],

        movement: { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }, //possible movement
    },
    computed: {
        gridStyle() {
            const { size } = this
            return {
                'grid-template-columns': `repeat(${size[0]},1fr)`,
                'grid-template-rows': `repeat(${size[1]},1fr)`
            }
        }
    },
    methods: {
        move(dx, dy) { }
    },
    created() {

    },
    mounted() {
        let { up, down, left, right } = this.movement;
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

/**
 * return int between [0,upper)
 * @param {Number} upper
 */
function randomInt(upper) {
    return Math.floor(Math.random() * upper)
}

class PlaygroundItem {
    constructor(x, y) {
        this.element = document.createElement('div')
        this.x = x
        this.y = y
        playground.appendChild(this.element)
    }

    detech() {
        playground.removeChild(this.element)
    }

    blink() {
        this.element.classList.add('blink')
    }

    set x(value) { this._x = value; this.element.style.gridColumn = value + 1; }
    get x() { return this._x; }
    set y(value) { this._y = value; this.element.style.gridRow = value + 1; }
    get y() { return this._y; }
    set pos(p) { this.x = p[0]; this.y = p[1]; }
    get pos() { return [this.x, this.y] }
}

class SnakeBody extends PlaygroundItem {
    constructor(x, y, head = false) {
        super(x, y)
        this.element.classList.add("snake")
        if (head) this.element.classList.add("head")
        this.head = head
    }
}

class Food extends PlaygroundItem {
    constructor(x, y) {
        super(x, y)
        this.element.classList.add("food")
    }
}

function randomEmptyGrid() {
    let map = []
    for (let x = 0; x < width; ++x) {
        map[x] = []
    }

    for (let s of body) {
        let [x, y] = s.pos
        map[x][y] = true
    }

    for (let s of foods) {
        let [x, y] = s.pos
        map[x][y] = true
    }

    let fill = body.length + foods.length;
    let empty = width * height - fill;

    let n = Math.floor(Math.random() * empty) + 1
    for (let x = 0; x < width; ++x) {
        for (let y = 0; y < height; ++y) {
            if (!map[x][y]) {
                --n;
                if (n == 0) return [x, y]
            }
        }
    }
}