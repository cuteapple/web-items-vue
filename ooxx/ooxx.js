
Vue.component('ooxx-tile', {
    props: ['index','player','win'],
    computed: {
        tileStyle() {
            return this.player ? { backgroundImage: `url(img/${this.player}.png)` } : {/*empty tile*/ }
        }
    },
    methods: {
        onClick() {
            this.game.tileClicked(this)
        }
    },
    created: function () {
        this.game = this.$parent
    },
    template: `<div :class="[win?'blink':'']" :style="tileStyle" @click="onClick"></div>`
})

const win_test = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    [0, 4, 8],
    [2, 4, 6]
]

let game = new Vue({
    el: '#app',
    data: {
        hint: 'ooxx',
        step: 0,
        players: ['o', 'x'],
        grid: Array(9).fill(),       
    },
    computed: {
        currentPlayer() {
            return this.players[this.step % this.players.length]
        },
        win_tiles() {
            let tiles = [];
            for (let indexGroup of win_test) {
                let holders = indexGroup.map(i => this.grid[i])
                if (holders.every(p => p == this.currentPlayer))
                    tiles.push(...indexGroup)
            }
            return new Set(tiles)
        },
        end() {
            return this.win_tiles.size != 0
        }
    },
    methods:{
        showHint(str) {
            this.hint = str
        },
        tileClicked(tile) {
            //end
            if (this.end) {
                this.showHint(`already finish : (${this.currentPlayer} wins)`)
                return
            }

            //have already occupied
            if (tile.player) {
                this.showHint(`already occupied by ${tile.player}`)
                return
            }

            //occupy this grid
            this.$set(this.grid, tile.index, this.currentPlayer)
            this.endTurn()
        },
        endTurn() {
            if (this.end) {
                this.showHint(`${this.currentPlayer} wins`)
            }
            else {
                ++this.step
            }
        }
    }
})
