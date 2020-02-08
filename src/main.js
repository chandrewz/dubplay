import Vue from 'vue'
import App from './App.vue'
import VueYoutube from 'vue-youtube'
import VueResource from 'vue-resource'

Vue.config.productionTip = false

Vue.use(VueResource)
Vue.use(VueYoutube)

new Vue({
  render: h => h(App),
}).$mount('#app')
