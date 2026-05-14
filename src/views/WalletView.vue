<template>
  <div class="app-shell">
    <Sidebar />
    <main class="main-content">
      <div class="page-header">
        <h1 class="page-title">{{ t('wallet.title') }}</h1>
        <p class="page-subtitle">{{ t('wallet.subtitle') }}</p>
      </div>

      <!-- ── Connected State ─────────────────────────── -->
      <div v-if="walletAddress" class="card mb-6">
        <div class="card-header">
          <span class="card-title">{{ t('wallet.connected') }}</span>
          <span class="badge badge-green">
            <span class="live-dot"></span>
            {{ t('wallet.active') }}
          </span>
        </div>

        <div class="wallet-addr-display">
          <div class="connected-address">{{ walletAddress }}</div>
          <div class="connected-actions">
            <button class="btn btn-outline btn-sm" @click="copyAddr">
              <svg width="13" height="13" fill="none" viewBox="0 0 16 16">
                <rect x="4" y="4" width="9" height="9" rx="2" stroke="currentColor" stroke-width="1.4"/>
                <path d="M3 11V3h8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
              </svg>
              {{ t('wallet.copyAddress') }}
            </button>
            <a
              :href="`https://solscan.io/account/${walletAddress}?cluster=devnet`"
              target="_blank"
              class="btn btn-teal btn-sm"
            >
              <svg width="12" height="12" fill="none" viewBox="0 0 16 16">
                <path d="M7 2H2v12h12V9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                <path d="M10 2h4v4M14 2l-7 7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
              </svg>
              Solscan
            </a>
            <button class="btn btn-danger-outline btn-sm" @click="disconnectWallet">
              <svg width="13" height="13" fill="none" viewBox="0 0 16 16">
                <path d="M6 3H3v10h3M10 11l4-3-4-3M14 8H6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ t('wallet.disconnect') }}
            </button>
          </div>
        </div>
      </div>

      <!-- ── Not Connected: Option Cards ──────────────── -->
      <div v-if="!walletAddress" class="wallet-options-grid mb-5">
        <!-- Generate New -->
        <div
          class="wallet-option-card"
          :class="{ active: tab === 0 }"
          @click="tab = 0"
        >
          <div class="wallet-icon-box" style="background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.2)">
            <svg width="19" height="19" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" stroke="var(--purple-light)" stroke-width="1.5"/>
              <path d="M12 8v8M8 12h8" stroke="var(--purple-light)" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="wallet-option-title">{{ t('wallet.generateNew') }}</div>
          <div class="wallet-option-desc">{{ t('wallet.generateDesc') }}</div>
          <p class="wallet-option-note">{{ t('wallet.generateNote') }}</p>
        </div>

        <!-- Connect Phantom -->
        <div
          class="wallet-option-card"
          :class="{ active: tab === 1 }"
          @click="tab = 1"
        >
          <div class="wallet-icon-box" style="background:rgba(126,107,255,0.1);border:1px solid rgba(126,107,255,0.2)">
            <svg width="19" height="19" viewBox="0 0 128 128" fill="none">
              <circle cx="64" cy="64" r="64" fill="#AB9FF2"/>
              <path d="M110 64c0 25.4-20.6 46-46 46S18 89.4 18 64 38.6 18 64 18s46 20.6 46 46z" fill="#7B61FF"/>
              <path d="M80 52H60a8 8 0 000 16h4l4 8h16l-8-8h4a8 8 0 000-16z" fill="white"/>
            </svg>
          </div>
          <div class="wallet-option-title">{{ t('wallet.connectPhantom') }}</div>
          <div class="wallet-option-desc">{{ t('wallet.connectPhantomDesc') }}</div>
          <p class="wallet-option-note">{{ t('wallet.connectPhantomNote') }}</p>
        </div>

        <!-- Recover -->
        <div
          class="wallet-option-card"
          :class="{ active: tab === 2 }"
          @click="tab = 2"
        >
          <div class="wallet-icon-box" style="background:rgba(6,182,212,0.1);border:1px solid rgba(6,182,212,0.2)">
            <svg width="19" height="19" fill="none" viewBox="0 0 24 24">
              <path d="M12 22C6.477 22 2 17.523 2 12c0-3.6 1.9-6.75 4.75-8.55" stroke="var(--teal)" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M12 2c5.523 0 10 4.477 10 10 0 3.6-1.9 6.75-4.75 8.55" stroke="var(--teal)" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M7 8.5L4.75 3.45M17 15.5l2.25 5.05" stroke="var(--teal)" stroke-width="1.5" stroke-linecap="round"/>
              <circle cx="12" cy="12" r="2.5" fill="var(--teal)"/>
            </svg>
          </div>
          <div class="wallet-option-title">{{ t('wallet.recover') }}</div>
          <div class="wallet-option-desc">{{ t('wallet.recoverDesc') }}</div>
          <p class="wallet-option-note">{{ t('wallet.seedPlaceholder') }}</p>
        </div>
      </div>

      <!-- ── Panel: Generate New ───────────────────────── -->
      <transition name="panel-fade">
        <div v-if="!walletAddress && tab === 0" class="card mb-5">
          <div class="card-header">
            <span class="card-title">{{ t('wallet.generateNew') }}</span>
          </div>

          <div v-if="!generatedWallet">
            <div class="alert alert-warning mb-4">
              <strong>{{ t('wallet.importantLabel') }}</strong> {{ t('wallet.importantText') }}
            </div>
            <button class="btn btn-primary" @click="generateWallet">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" stroke="white" stroke-width="1.5"/>
                <path d="M12 8v8M8 12h8" stroke="white" stroke-width="2" stroke-linecap="round"/>
              </svg>
              {{ t('wallet.generateNew') }}
            </button>
          </div>

          <div v-else>
            <div class="alert alert-warning mb-4">{{ t('wallet.importantWarning') }}</div>

            <div class="mnemonic-section-label">{{ t('wallet.seedPhrase') }}</div>
            <div class="mnemonic-grid">
              <div
                v-for="(word, i) in generatedWallet.mnemonic.split(' ')"
                :key="i"
                class="mnemonic-word"
              >
                <span class="mnemonic-num">{{ i + 1 }}</span>
                <span class="mnemonic-text">{{ word }}</span>
              </div>
            </div>

            <div class="generated-address-box">
              <div class="input-label">{{ t('wallet.walletAddress') }}</div>
              <div class="generated-address-value">{{ generatedWallet.publicKey }}</div>
            </div>

            <div class="flex gap-2 mt-4">
              <button class="btn btn-outline" @click="generatedWallet = null">
                {{ t('wallet.regenerate') }}
              </button>
              <button class="btn btn-primary" @click="confirmAndUseWallet">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                {{ t('wallet.savedConfirm') }}
              </button>
            </div>
          </div>
        </div>
      </transition>

      <!-- ── Panel: Connect Phantom ────────────────────── -->
      <transition name="panel-fade">
        <div v-if="!walletAddress && tab === 1" class="card mb-5">
          <div class="card-header">
            <span class="card-title">{{ t('wallet.connectPhantom') }}</span>
          </div>

          <div v-if="!isPhantomAvailable">
            <div class="alert alert-warning">
              {{ t('wallet.phantomNotFound') }}
              <a href="https://phantom.app" target="_blank" class="alert-link">
                {{ t('wallet.installPhantom') }} ↗
              </a>
            </div>
            <div class="phantom-steps mt-4">
              <ol class="step-list">
                <li class="step-item">
                  <div class="step-num">1</div>
                  <div class="step-text">{{ t('wallet.phantomStep1') || 'Visit phantom.app and install the browser extension.' }}</div>
                </li>
                <li class="step-item">
                  <div class="step-num">2</div>
                  <div class="step-text">{{ t('wallet.phantomStep2') || 'Create or import a Solana wallet.' }}</div>
                </li>
                <li class="step-item">
                  <div class="step-num">3</div>
                  <div class="step-text">{{ t('wallet.phantomStep3') || 'Reload this page and connect.' }}</div>
                </li>
              </ol>
            </div>
          </div>

          <div v-else>
            <div class="alert alert-info mb-4">
              {{ t('wallet.phantomReady') || 'Phantom detected. Click below to authorize the connection.' }}
            </div>
            <button class="btn btn-primary btn-lg" @click="connectPhantomWallet" :disabled="connectingPhantom">
              <span v-if="connectingPhantom" class="spin"></span>
              <svg v-else width="16" height="16" viewBox="0 0 128 128" fill="none">
                <circle cx="64" cy="64" r="64" fill="#AB9FF2"/>
                <path d="M110 64c0 25.4-20.6 46-46 46S18 89.4 18 64 38.6 18 64 18s46 20.6 46 46z" fill="#7B61FF"/>
                <path d="M80 52H60a8 8 0 000 16h4l4 8h16l-8-8h4a8 8 0 000-16z" fill="white"/>
              </svg>
              {{ connectingPhantom ? t('wallet.connecting') : t('wallet.connectPhantom') }}
            </button>
          </div>
        </div>
      </transition>

      <!-- ── Panel: Recover from Seed ──────────────────── -->
      <transition name="panel-fade">
        <div v-if="!walletAddress && tab === 2" class="card mb-5">
          <div class="card-header">
            <span class="card-title">{{ t('wallet.recover') }}</span>
          </div>
          <p class="recover-desc">{{ t('wallet.recoverDesc') }}</p>

          <div class="input-group">
            <label class="input-label">{{ t('wallet.seedPhrase') }}</label>
            <textarea
              v-model="recoverMnemonic"
              class="input-field recover-textarea"
              rows="3"
              :placeholder="t('wallet.seedPlaceholder')"
            ></textarea>
          </div>
          <button class="btn btn-teal" @click="recoverWallet">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
              <path d="M4 4v5h5M20 20v-5h-5M4.93 15A10 10 0 1019.07 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ t('wallet.recoverBtn') }}
          </button>
          <div v-if="recoverError" class="alert alert-warning mt-3">{{ recoverError }}</div>
        </div>
      </transition>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { generateNewWallet, walletFromMnemonic, isPhantomInstalled, connectPhantom } from '../services/wallet.js'
import { api } from '../services/api.js'
import { useI18n } from 'vue-i18n'
import Sidebar from '../components/Sidebar.vue'

const { t } = useI18n()

const tab = ref(0)
const walletAddress = ref(localStorage.getItem('mao_wallet') || '')
const generatedWallet = ref(null)
const recoverMnemonic = ref('')
const recoverError = ref('')
const connectingPhantom = ref(false)
const isPhantomAvailable = ref(false)

onMounted(() => {
  isPhantomAvailable.value = isPhantomInstalled()
})

function generateWallet() {
  generatedWallet.value = generateNewWallet()
}

function confirmAndUseWallet() {
  if (!generatedWallet.value) return
  setWallet(generatedWallet.value.publicKey)
}

async function setWallet(address) {
  localStorage.setItem('mao_wallet', address)
  walletAddress.value = address
  try { await api.saveWalletAddress(address) } catch { /* not critical */ }
}

async function connectPhantomWallet() {
  connectingPhantom.value = true
  try {
    const addr = await connectPhantom()
    await setWallet(addr)
  } catch (e) {
    alert(e.message)
  } finally {
    connectingPhantom.value = false
  }
}

function recoverWallet() {
  recoverError.value = ''
  try {
    const words = recoverMnemonic.value.trim().split(/\s+/)
    if (words.length !== 12) throw new Error('Please enter exactly 12 words')
    const addr = walletFromMnemonic(recoverMnemonic.value.trim())
    setWallet(addr)
  } catch (e) {
    recoverError.value = e.message
  }
}

function disconnectWallet() {
  if (!confirm(t('wallet.disconnectConfirm'))) return
  localStorage.removeItem('mao_wallet')
  walletAddress.value = ''
  if (window.solana?.disconnect) window.solana.disconnect()
}

function copyAddr() {
  navigator.clipboard.writeText(walletAddress.value)
  // brief flash feedback can be added here if needed
}
</script>

<style scoped>
/* ── Connected wallet display ──────────────── */
.connected-address {
  font-family: var(--mono);
  font-size: 13.5px;
  color: var(--text-primary);
  word-break: break-all;
  line-height: 1.7;
  padding: 4px 0;
}

.connected-actions {
  display: flex;
  gap: 8px;
  margin-top: 14px;
  flex-wrap: wrap;
}

.btn-sm { padding: 6px 12px; font-size: 12px; }

.btn-danger-outline {
  background: transparent;
  color: var(--red);
  border: 1px solid rgba(239,68,68,0.22);
  transition: all var(--t-mid);
}

.btn-danger-outline:hover {
  background: rgba(239,68,68,0.07);
  border-color: rgba(239,68,68,0.4);
}

.live-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--green);
  display: inline-block;
  margin-right: 2px;
  animation: pulse-green 2.5s infinite;
}

/* ── Wallet option cards ──────────────────── */
.wallet-options-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.wallet-option-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 22px;
  cursor: pointer;
  transition: all var(--t-mid);
  position: relative;
}

.wallet-option-card:hover {
  border-color: rgba(139,92,246,0.28);
  background: var(--bg-card-hover);
}

.wallet-option-card.active {
  border-color: rgba(139,92,246,0.45);
  background: var(--bg-card-hover);
  box-shadow: 0 0 0 1px rgba(139,92,246,0.15), 0 4px 20px rgba(0,0,0,0.3);
}

.wallet-option-card.active::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(139,92,246,0.6), rgba(6,182,212,0.4), transparent);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.wallet-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}

.wallet-option-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.wallet-option-desc {
  font-size: 11.5px;
  color: var(--text-muted);
  margin-bottom: 10px;
}

.wallet-option-note {
  font-size: 11.5px;
  color: var(--text-muted);
  line-height: 1.6;
  border-top: 1px solid var(--border);
  padding-top: 10px;
}

/* ── Panel content ──────────────────────────── */
.mnemonic-section-label {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-family: var(--mono);
  margin-bottom: 10px;
}

.generated-address-box {
  margin-top: 18px;
  padding: 14px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

.generated-address-value {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--teal);
  word-break: break-all;
  line-height: 1.65;
  margin-top: 6px;
}

.alert-link {
  color: var(--amber);
  text-decoration: underline;
  text-decoration-color: rgba(245,158,11,0.4);
  text-underline-offset: 2px;
  margin-left: 6px;
}

.phantom-steps { padding: 4px 0; }

.recover-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 18px;
  line-height: 1.6;
}

.recover-textarea { resize: vertical; }

/* ── Panel transition ──────────────────────── */
.panel-fade-enter-active,
.panel-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.panel-fade-enter-from,
.panel-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
