Vue.component('game-of-life', {
    props: ['size'],
    template: '<div/>'
})

const game = new Vue({
    el: '#app',
    data: {}
})