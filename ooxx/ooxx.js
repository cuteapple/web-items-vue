
Vue.component('ooxx-tile', {
    data: () => ({
        player: undefined
    }),
    computed: {
        tileStyle() {
            return this.player ? { backgroundImage: `url(img/${this.player}.png)` } : {/*empty tile*/ }
        }
    },
    methods: {
        onClick() {
            if (this.player) {
                game.hint(`already occupied by ${this.player}`)
                return
            }
            this.player = game.currentPlayer
            game.nextStep();
        }
    },
    template: '<div :style="tileStyle" @click="onClick"></div>'
})

let game = new Vue({
    el: '#app',
    data: {
        hint: 'ooxx',
        step: 0,
        players: ['o', 'x'],
        tiles: Array(9).fill()
    },
    computed: {
        currentPlayer() {
            return this.players[this.step % this.players.length]
        }
    },
    methods:{
        hint(str) {
            this.hint = str
        },
        nextStep() {
            ++this.step
        }
    }
})


function clicknode(node) {
    if (node.dataset.holder) {
        hint('')
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