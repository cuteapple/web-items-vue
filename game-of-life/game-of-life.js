Vue.component('game-of-life', {
    props: ['width', 'height'],

    data: () => ({
        map: [[]], //fill when created
        game_of_life: undefined
    }),

    computed: {
        style() {
            return {
                'grid-template-columns': `repeat(${this.width},1fr)`,
                'grid-template-rows': `repeat(${this.height},1fr)`
            }
        },
    },
    methods: {
        update() {
            this.game_of_life.nextEpoch()
            this.map = [].concat(...this.game_of_life.grid)
        }
    },
    template: '<div class="playground" :style="style"> <div class="cell" v-for="(v,i) in map" :data-status="v" :key="i"/> </div>',
    created() {
        this.game_of_life = new GameOfLife(this.width, this.height)
        this.update()
        this.timer = new AnimationInterval(() => this.update(), 100)
    }
})


class AnimationInterval {
    constructor(action, interval) {
        this.timer = setInterval(() => { this.should_render = true }, interval);
        this.render = action;
        this.renderframe();
    }
    renderframe() {
        requestAnimationFrame(() => this.renderframe())
        if (!this.should_render) return
        this.should_render = false
        this.render()
    }
}

class GameOfLife {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.initGrid()
    }

    initGrid() {
        this.grid = Array(this.width).fill().map(x => []);
        for (let w = 0; w < this.width; ++w) {
            for (let h = 0; h < this.height; ++h) {
                this.grid[w][h] = Math.random() > 0.5 ? 1 : 0;
            }
        }
    }

    //rewrite this to produce loop effect or something...
    sample(w, h) {
        //clamp to edge = 0
        let a = this.grid[w]
        let b = a == undefined ? undefined : a[h]
        return b == undefined ? 0 : b
    }

    //compute next iteration value of certain grid
    computeNext(w, h) {
        let sum = 0
        for (let dw of [-1, 0, 1])
            for (let dh of [-1, 0, 1])
                sum += this.sample(w + dw, h + dh)
        sum -= this.sample(w, h)
        switch (this.sample(w, h)) {
            case 0:
                return sum == 3 ? 1 : 0
                break;
            case 1:
                return sum < 2 ? 0 :
                    sum <= 3 ? 1 :
                        0
                break;
        }
    }

    nextEpoch() {
        let newGrid = Array(this.width).fill().map(x => []);
        for (let w = 0; w < this.width; ++w) {
            for (let h = 0; h < this.height; ++h) {
                newGrid[w][h] = this.computeNext(w, h)
            }
        }
        this.grid = newGrid;
    }
}


const game = new Vue({
    el: '#app',
    data: { width: 20, height: 20 }
})


