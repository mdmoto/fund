<template>
  <aside class="sidebar">
    <!-- ── Logo ──────────────────────── -->
    <div class="sidebar-logo">
      <div class="logo-icon">
        <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
          <path d="M14 2L26 8V20L14 26L2 20V8L14 2Z" stroke="white" stroke-width="1.5" fill="none"/>
          <path d="M14 7L21 11V18L14 22L7 18V11L14 7Z" fill="white" opacity="0.4"/>
        </svg>
      </div>
      <div>
        <div class="logo-text">Maollar</div>
        <div class="logo-sub">Asset Center</div>
      </div>
    </div>

    <!-- ── Navigation ────────────────── -->
    <nav class="sidebar-nav">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ active: $route.path === item.path }"
      >
        <component :is="item.icon" class="nav-icon" />
        {{ t(item.labelKey) }}
      </router-link>
    </nav>

    <!-- ── Footer ────────────────────── -->
    <div class="sidebar-footer">

      <!-- Network status pill -->
      <div class="network-pill">
        <span class="network-dot"></span>
        <span class="network-label">Solana Devnet</span>
      </div>

      <!-- Language switcher -->
      <div class="lang-switcher-wrap">
        <LanguageSwitcher />
      </div>

      <!-- User badge -->
      <div class="user-badge">
        <div class="user-avatar">{{ userInitial }}</div>
        <div class="user-info">
          <div class="user-name">{{ userName }}</div>
          <div class="user-status">{{ t('common.connected') }}</div>
        </div>
      </div>

      <!-- Sign out — uses proper class, no inline style -->
      <button class="nav-item nav-item-logout" @click="logout">
        <svg class="nav-icon" fill="none" viewBox="0 0 24 24">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        {{ t('nav.signOut') }}
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed, defineComponent, h } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from './LanguageSwitcher.vue'

const { t } = useI18n()
const router = useRouter()

const user = JSON.parse(localStorage.getItem('mao_user') || '{}')
const userName = computed(() => user?.nickname || user?.username || 'User')
const userInitial = computed(() => userName.value.charAt(0).toUpperCase())

function logout() {
  localStorage.removeItem('mao_token')
  localStorage.removeItem('mao_user')
  router.push('/login')
}

/* SVG icon components — defined inline to avoid extra files */
const IconDashboard = defineComponent({
  render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24' }, [
    h('rect', { x: '3', y: '3', width: '7', height: '7', rx: '1', stroke: 'currentColor', 'stroke-width': '1.5' }),
    h('rect', { x: '14', y: '3', width: '7', height: '7', rx: '1', stroke: 'currentColor', 'stroke-width': '1.5' }),
    h('rect', { x: '14', y: '14', width: '7', height: '7', rx: '1', stroke: 'currentColor', 'stroke-width': '1.5' }),
    h('rect', { x: '3', y: '14', width: '7', height: '7', rx: '1', stroke: 'currentColor', 'stroke-width': '1.5' }),
  ])
})

const IconExchange = defineComponent({
  render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24' }, [
    h('path', { d: 'M7 16V4m0 0L3 8m4-4l4 4', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
    h('path', { d: 'M17 8v12m0 0l4-4m-4 4l-4-4', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
  ])
})

const IconMarket = defineComponent({
  render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24' }, [
    h('polyline', { points: '22 12 18 12 15 21 9 3 6 12 2 12', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
  ])
})

const IconWallet = defineComponent({
  render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24' }, [
    h('path', { d: 'M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z', stroke: 'currentColor', 'stroke-width': '1.5' }),
    h('path', { d: 'M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z', stroke: 'currentColor', 'stroke-width': '1.5' }),
    h('circle', { cx: '16', cy: '14', r: '1.5', fill: 'currentColor' }),
  ])
})

const navItems = [
  { path: '/dashboard', labelKey: 'nav.dashboard', icon: IconDashboard },
  { path: '/exchange',  labelKey: 'nav.exchange',  icon: IconExchange  },
  { path: '/market',   labelKey: 'nav.market',    icon: IconMarket    },
  { path: '/wallet',   labelKey: 'nav.wallet',    icon: IconWallet    },
]
</script>

<style scoped>
/* ── Network pill ─────────────────────────── */
.network-pill {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 10px;
  border-radius: 100px;
  background: rgba(16,185,129,0.06);
  border: 1px solid rgba(16,185,129,0.14);
  margin-bottom: 10px;
}

.network-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--green);
  flex-shrink: 0;
  animation: pulse-green 2.5s infinite;
}

.network-label {
  font-size: 10.5px;
  color: var(--green);
  font-family: var(--mono);
  letter-spacing: 0.2px;
}

/* ── Language switcher wrapper ────────────── */
.lang-switcher-wrap {
  margin-bottom: 10px;
  padding: 0 2px;
}

/* ── Logout button ────────────────────────── */
/* Reset button defaults, reuse .nav-item visual style */
.nav-item-logout {
  width: 100%;
  background: none;
  font-family: var(--sans);
  text-align: left;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 500;
  border: 1px solid transparent;
  margin-top: 2px;
  cursor: pointer;
  transition: all var(--t-mid);
}

.nav-item-logout:hover {
  background: rgba(239,68,68,0.06);
  color: var(--red);
  border-color: rgba(239,68,68,0.12);
}

.nav-item-logout .nav-icon {
  opacity: 0.6;
  transition: opacity var(--t-mid);
}

.nav-item-logout:hover .nav-icon {
  opacity: 1;
}
</style>
