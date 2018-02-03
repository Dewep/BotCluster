import Vue from 'vue'
import Router from 'vue-router'

import AuthComponent from '../views/auth.vue'
import MainComponent from '../views/main.vue'
import HomeComponent from '../views/home.vue'
import TaskComponent from '../views/task.vue'

Vue.use(Router)

export default new Router({
  linkActiveClass: 'active',
  routes: [
    { name: 'auth', path: '/auth', component: AuthComponent },
    {
      path: '',
      component: MainComponent,
      children: [
        { name: 'home', path: '', component: HomeComponent },
        { name: 'task', path: '/task/:slug', component: TaskComponent }
      ]
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
