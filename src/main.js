import App from './App.vue';
import Vue from 'vue';
import VueResource from 'vue-resource';
import VueRouter from 'vue-router';
import VueYoutube from 'vue-youtube';

Vue.config.productionTip = false;

Vue.use(VueResource);
Vue.use(VueRouter);
Vue.use(VueYoutube);

var router = new VueRouter({
  routes: [{
    path: '*',
    component: App
  }]
});

new Vue({
  router: router,
  render: h => h(App),
}).$mount('#app');
