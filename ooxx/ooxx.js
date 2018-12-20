

let playground;
let nodes;

function hint(text) {
    document.getElementById('hint').innerText = text;
}

function init() {
    playground = document.getElementById('playground')
    nodes = [...playground.querySelectorAll('div')]
    player_round.next()

    for (let node of nodes)
        node.addEventListener('click', () => clicknode(node))//yes, I know I can use *this*
}

let players = ['o', 'x']
let player_round = ((function* player_round() {
    while (true) {
        for (let player of players) {
            playground.dataset.player = player
            yield player
        }
    }
})())

function clicknode(node) {
    if (node.dataset.holder) {
        hint('already used')
        return;
    }
    node.dataset.holder = playground.dataset.player
    if (!try_finish())
        player_round.next()
}

let win_test = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    [0, 4, 8],
    [2, 4, 6]
]

function all(arr, predict) {
    for (let x of arr)
        if (!predict(x))
            return false
    return true
}

function try_finish() {

    let win_nodes = []
    // someone win ?
    for (let player of players) for (let test of win_test) {
        if (all(test, i => nodes[i].dataset.holder == player)) {
            clicknode = () => hint(`already finish (${player} wins)`)
            hint(`${player} wins`)
            for (let id of test)
                nodes[id].dataset.win = ''
            return true
        }
    }

    // draw ? (full only, no predication)
    if (all(nodes, n => n.dataset.holder)) {
        clicknode = () => hint(`already finish (draw)`)
        hint('draw')
        return true
    }

    // continue
    return false
}