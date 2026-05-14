<template>
  <div class="login-page">
    <!-- Animated background grid -->
    <div class="bg-grid"></div>
    <!-- Radial glows -->
    <div class="bg-glow bg-glow-1"></div>
    <div class="bg-glow bg-glow-2"></div>
    <div class="bg-glow bg-glow-3"></div>

    <div class="login-container">
      <!-- Logo -->
      <div class="login-logo">
        <div class="logo-mark">
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
            <path d="M14 2L26 8V20L14 26L2 20V8L14 2Z" stroke="url(#grad)" stroke-width="1.5" fill="none"/>
            <path d="M14 7L21 11V18L14 22L7 18V11L14 7Z" fill="url(#grad)" opacity="0.35"/>
            <defs>
              <linearGradient id="grad" x1="2" y1="2" x2="26" y2="26">
                <stop stop-color="#8B5CF6"/>
                <stop offset="1" stop-color="#06B6D4"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div>
          <div class="logo-name">Maollar</div>
          <div class="logo-tagline">Asset Center</div>
        </div>
      </div>

      <!-- Login Card -->
      <div class="login-card">
        <!-- Decorative top line -->
        <div class="card-accent-line"></div>

        <div class="login-card-header">
          <h1 class="login-title">{{ t('login.title') }}</h1>
          <p class="login-desc">{{ t('login.subtitle') }}</p>
        </div>

        <div v-if="error" class="alert alert-warning">{{ error }}</div>

        <form @submit.prevent="handleLogin">
          <div class="input-group">
            <label class="input-label">{{ t('login.username') }}</label>
            <div class="input-wrapper">
              <svg class="input-icon" width="14" height="14" fill="none" viewBox="0 0 16 16">
                <circle cx="8" cy="5" r="3" stroke="currentColor" stroke-width="1.4"/>
                <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
              </svg>
              <input
                v-model="form.username"
                type="text"
                class="input-field input-with-icon"
                :placeholder="t('login.usernamePlaceholder')"
                autocomplete="username"
                required
              />
            </div>
          </div>

          <div class="input-group">
            <label class="input-label">{{ t('login.password') }}</label>
            <div class="input-wrapper">
              <svg class="input-icon" width="14" height="14" fill="none" viewBox="0 0 16 16">
                <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
                <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
              </svg>
              <input
                v-model="form.password"
                type="password"
                class="input-field input-with-icon"
                :placeholder="t('login.passwordPlaceholder')"
                autocomplete="current-password"
                required
              />
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-full btn-lg login-btn" :disabled="loading">
            <span v-if="loading" class="spin"></span>
            <svg v-else width="15" height="15" fill="none" viewBox="0 0 16 16">
              <path d="M9 3l5 5-5 5M14 8H3" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ loading ? t('login.loading') : t('login.button') }}
          </button>
        </form>

        <div class="login-footer">
          <a href="https://maollar.com" target="_blank" class="login-link">
            {{ t('login.noAccount') }} →
          </a>
        </div>
      </div>

      <!-- Token info pill -->
      <div class="token-pill">
        <span class="token-dot"></span>
        <span class="font-mono text-muted text-sm">MAO</span>
        <span class="token-sep">·</span>
        <span class="font-mono text-sm" style="color:var(--text-disabled);font-size:10px">{{ shortMint }}</span>
        <span class="token-sep">·</span>
        <span class="text-muted text-sm">Solana</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api.js'
import { useI18n } from 'vue-i18n'
import { MAO_MINT } from '../services/wallet.js'

const { t } = useI18n()
const router = useRouter()
const loading = ref(false)
const error = ref('')
const form = ref({ username: '', password: '' })

const shortMint = computed(() => MAO_MINT.slice(0, 8) + '...' + MAO_MINT.slice(-4))

async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.login(form.value.username, form.value.password)
    if (res.result?.token) {
      localStorage.setItem('mao_token', res.result.token)
      localStorage.setItem('mao_user', JSON.stringify(res.result))
      router.push('/dashboard')
    } else {
      error.value = res.message || 'Login failed. Please check your credentials.'
    }
  } catch (e) {
    error.value = e.response?.data?.message || 'Connection failed. Is the server reachable?'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
  overflow: hidden;
}

/* Subtle dot grid background */
.bg-grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: radial-gradient(ellipse 60% 60% at 50% 50%, black, transparent);
  pointer-events: none;
}

.bg-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}
.bg-glow-1 { width: 450px; height: 450px; background: rgba(139,92,246,0.07); top: -120px; right: -80px; }
.bg-glow-2 { width: 320px; height: 320px; background: rgba(6,182,212,0.05); bottom: -80px; left: -60px; }
.bg-glow-3 { width: 200px; height: 200px; background: rgba(139,92,246,0.05); bottom: 20%; right: 20%; }

.login-container {
  width: 100%;
  max-width: 390px;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  animation: fadeUp 0.5s cubic-bezier(0.4,0,0.2,1);
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.login-logo {
  display: flex;
  align-items: center;
  gap: 13px;
}

.logo-mark {
  width: 46px; height: 46px;
  background: rgba(139,92,246,0.1);
  border: 1px solid rgba(139,92,246,0.22);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 20px rgba(139,92,246,0.15);
}

.logo-name {
  font-family: var(--display);
  font-size: 21px; font-weight: 700;
  background: linear-gradient(135deg, #fff, var(--purple-light));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
}

.logo-tagline { font-size: 11px; color: var(--text-muted); font-family: var(--mono); text-transform: uppercase; letter-spacing: 0.5px; }

.login-card {
  width: 100%;
  background: var(--bg-card);
  border: 1px solid var(--border-mid);
  border-radius: var(--radius-xl);
  padding: 30px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 0 1px rgba(255,255,255,0.04), 0 20px 50px rgba(0,0,0,0.5);
}

/* Gradient top accent */
.card-accent-line {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.6) 30%, rgba(6,182,212,0.6) 70%, transparent 100%);
}

.login-card-header { margin-bottom: 24px; }
.login-title { font-family: var(--display); font-size: 21px; font-weight: 700; letter-spacing: -0.5px; }
.login-desc { font-size: 13px; color: var(--text-muted); margin-top: 5px; font-weight: 300; }

/* Input with icon */
.input-wrapper { position: relative; }

.input-icon {
  position: absolute;
  left: 12px; top: 50%; transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
  transition: color var(--t-mid);
}

.input-with-icon { padding-left: 36px; }
.input-wrapper:focus-within .input-icon { color: var(--purple-light); }

.login-btn {
  margin-top: 4px;
  font-family: var(--display);
  letter-spacing: 0.2px;
}

.login-footer { margin-top: 18px; text-align: center; }
.login-link { font-size: 12px; color: var(--text-muted); transition: color var(--t-mid); }
.login-link:hover { color: var(--purple-light); }

/* Token pill */
.token-pill {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 14px;
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border);
  border-radius: 100px;
}

.token-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--green);
  animation: pulse-green 2.5s infinite;
}

.token-sep { color: var(--text-disabled); font-size: 10px; }
</style>
