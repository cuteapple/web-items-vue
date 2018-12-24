Vue.component('puzzle-tile', {
    props: ['number', 'match', 'cursor'],
    computed: {
    },
    methods: {
    },
    template: `<img :class="['tile',cursor?'cursor':'']" :src="'img/'+number+'.png'"></div>`
})

let game = new Vue({
    el: '#app',
    data: {
        hint: "8-puzzle",
        numbers: [0, 1, 2, 3, 4, 5, 6, 7, 8],
        cursor: 0
    }
})









function hint(text) {
    document.getElementById('hint').innerText = text;
}

let grid_utils = {
    flatten: ([x, y]) => x + y * 3,
    inbound: ([x, y]) => x >= 0 && x < 3 && y >= 0 && y < 3,
    xy: index => [index % 3, Math.floor(index / 3)]
}
function init() {
    playground = document.getElementById('playground')


    /// tiles
    tiles = []
    for (let i = 0; i < 9; ++i) {
        let tile = document.createElement('img')
        tile.className = 'tile'
        tile.src = `img/${i}.png`
        tile.dataset.n = i;
        tiles.push(tile)
    }
    tiles[0].classList.add('cursor')


    //links
    links = []

    let { inbound, flatten } = grid_utils
    for (let x = 0; x < 3; ++x)
        for (let y = 0; y < 3; ++y) {
            candidate = [
                [x - 1, y],
                [x + 1, y],
                [x, y + 1],
                [x, y - 1]
            ]
            links[flatten([x, y])] = candidate.filter(inbound).map(flatten)
        }


    let randomSelect = (arr) => arr[Math.floor(Math.random() * arr.length)]


    //shuffle
    let replace = [0, 1, 2, 3, 4, 5, 6, 7, 8]
    let pos = cursor
    for (let i = 0; i < shuffle_times; ++i) {
        let next_pos = randomSelect(links[pos]);
        [replace[pos], replace[next_pos]] = [replace[next_pos], replace[pos]]
        pos = next_pos
    }
    cursor = pos


    ///grids
    grids = [...playground.children]
    for (let i = 0; i < 9; ++i) {
        grids[i].dataset.n = i;
        grids[i].appendChild(tiles[replace[i]])
    }

    //install handler
    controller.all = move;
}

function swapTile(a, b) {
    pa = a.parentElement
    pb = b.parentElement
    pa.appendChild(b)
    pb.appendChild(a)
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