
Vue.component('ooxx-tile', {
    props:['index'],
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
                this.$parent.showHint(`already occupied by ${this.player}`)
                return
            }
            this.player = this.$parent.currentPlayer
            this.$parent.nextStep();
        }
    },
    template: '<div :style="tileStyle" @click="onClick"></div>'
})

let game = new Vue({
    el: '#app',
    data: {
        hint: 'ooxx',
        step: 0,
        players: ['o', 'x']
    },
    computed: {
        currentPlayer() {
            return this.players[this.step % this.players.length]
        }
    },
    methods:{
        showHint(str) {
            this.hint = str
        },
        nextStep() {
            ++this.step
        },
        checkEnd() {
            
        }
    }
})


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