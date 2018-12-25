let playground
let body = []
let foods = []
let controller = new controller4()
let velocity = [1, 0]
let width = 16
let height = 16

let auto = true;
let auto_int = 100;
let auto_timer;

let playground_util = {
    in: (x, y) => x >= 0 && x < width && y >= 0 && y < height
}

function init() {
    playground = document.getElementById('playground')
    playground.style.gridTemplateColumns = `repeat(${width},1fr)`;
    playground.style.gridTemplateRows = `repeat(${height},1fr)`;
    body = [new SnakeBody(1, 0, true), new SnakeBody(0, 0), new SnakeBody(0, 1), new SnakeBody(0, 2)]
    foods = [new Food(...randomEmptyGrid())]
    controller.all = (...args) => {
        movekey_handler(...args);
        auto_timer = setInterval(() => move(...velocity), auto_int);
        controller.all = movekey_handler;
    }

}

function move(dx, dy) {
    let [x, y] = body[0].pos
    x += dx
    y += dy

    let status;

    //wall
    if (!playground_util.in(x, y)) { body[0].blink(); end('😵'); return; }
    //food
    let eat_food = foods.find(food => food.x == x && food.y == y)
    let eat_full = false;
    if (eat_food) {
        let emptyPos = randomEmptyGrid();
        if (emptyPos) {
            eat_food.pos = emptyPos;
        }
        else {
            eat_food.detech()
            eat_full = true;
        }
        body.push(new SnakeBody(0, 0))//pos not relevent
    }

    for (let i = body.length - 1; i > 0; --i) {
        body[i].pos = body[i - 1].pos
    }
    body[0].pos = [x, y]

    if (eat_full) end('🍱');

    let head = body[0]
    let self_eat = body.find(b => b !== head && b.x == head.x && b.y == head.y)
    if (self_eat) {
        head.blink();
        self_eat.blink();
        end('😵');
    }
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

function hint(text) {
    document.getElementById('hint').innerText = text;
}

function end(message = "end") {
    controller.all = () => { }
    clearInterval(auto_timer)
    hint(message)
}

function movekey_handler(direction) {
    let v = controller4.to2D(direction, [1, -1])
    if (body.length > 1) {
        let ov = [body[0].x - body[1].x, body[0].y - body[1].y]
        if (v[0] == -ov[0] && v[1] == -ov[1]) return;//invalid move
    }
    velocity = v;
    if (!auto) move(...velocity)
}