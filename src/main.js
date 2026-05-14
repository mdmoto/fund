import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import i18n from './i18n.js'
import App from './App.vue'
import LoginView from './views/LoginView.vue'
import DashboardView from './views/DashboardView.vue'
import MarketView from './views/MarketView.vue'
import ExchangeView from './views/ExchangeView.vue'
import WalletView from './views/WalletView.vue'
import './style.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/login', component: LoginView },
    { path: '/dashboard', component: DashboardView, meta: { requiresAuth: true } },
    { path: '/market', component: MarketView, meta: { requiresAuth: true } },
    { path: '/exchange', component: ExchangeView, meta: { requiresAuth: true } },
    { path: '/wallet', component: WalletView, meta: { requiresAuth: true } },
  ]
})

router.beforeEach((to) => {
  const token = localStorage.getItem('mao_token')
  if (to.meta.requiresAuth && !token) {
    return '/login'
  }
})

const app = createApp(App)
app.use(router)
app.use(i18n)
app.mount('#app')
