Vue.component('game-of-life-cell', {
    props: ['x', 'y', 'scale'],
    computed: {
        style() {
            let { x, y, scale } = this
            return {
                top: `${y * scale}px`,
                left: `${x * scale}px`,
                width: `${scale}px`,
                height: `${scale}px`,
                position: 'absolute',
                'z-index': 1,
                backgroundColor: 'white',
            }
        }
    },

    template: '<div :style="style"/>',
})


Vue.component('game-of-life', {
    props: ['width', 'height', 'scale'],

    data: () => ({
        map: [[]] //fill when created
    }),

    computed: {
        style() {
            return {
                width: `${this.width * this.scale}px`,
                height: `${this.height * this.scale}px`,
                backgroundColor: 'black',
                position: 'relative'
            }
        },
        survivor() {
            return [[3, 2], [5, 6]]
        }
    },
    template: '<div :style="style"> <game-of-life-cell v-for="(p,i) in survivor" :key="i" :x="p[0]" :y="p[1]" :scale="scale"/> </div>',
    created() {
        this.map = Array(this.width).fill().map(_ => Array(this.height))
    }
})

const game = new Vue({
    el: '#app',
    data: { width: 10, height: 10, scale: 5 }
})
