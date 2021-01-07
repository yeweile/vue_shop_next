import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 引入全局样式
import './assets/css/gloabl.css'
// 引入字体图标
import './assets/fonts/iconfont.css'
// 对axios进行全局配置
import axios from 'axios'
// 为axios设置根路径
axios.defaults.baseURL='http://127.0.0.1:8888/api/private/v1/'
// 把axios挂载到Vue的原型链上
Vue.prototype.$http = axios



Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
