<template>
  <div class="app-shell">
    <MobileHeader />
    <Sidebar />
    <main class="main-content">
      <div class="page-header flex justify-between items-center">
        <div>
          <h1 class="page-title">{{ t('exchange.title') }}</h1>
          <p class="page-subtitle">{{ t('exchange.subtitle') }}</p>
        </div>
      </div>

      <div v-if="!walletAddress" class="alert alert-warning mb-4">
        {{ t('exchange.noWalletAlert') }}
        <router-link to="/wallet" class="alert-link">{{ t('exchange.setupWallet') }}</router-link>
      </div>

      <div class="exchange-layout">
        <!-- Left: swap form -->
        <div>
          <div class="card mb-4">
            <div class="card-header">
              <span class="card-title">{{ t('exchange.exchangeDetails') }}</span>
              <span class="badge badge-purple">1:1</span>
            </div>

            <!-- Send box -->
            <div class="swap-box">
              <div class="swap-label">
                {{ t('exchange.youSend') }}
                <span>{{ t('exchange.balance') }} {{ formatNum(pointBalance) }}</span>
              </div>
              <div class="flex items-center gap-3 mt-2">
                <input
                  v-model="amount"
                  type="number"
                  min="1"
                  :max="pointBalance"
                  class="swap-amount-input"
                  placeholder="0"
                />
                <div class="swap-token-badge">
                  <span style="font-size:17px">🐱</span>
                  <span>Meow Points</span>
                </div>
              </div>
              <div class="percent-btns mt-3">
                <button class="btn btn-outline" style="font-size:11px;padding:4px 9px" @click="setPercent(25)">25%</button>
                <button class="btn btn-outline" style="font-size:11px;padding:4px 9px" @click="setPercent(50)">50%</button>
                <button class="btn btn-outline" style="font-size:11px;padding:4px 9px" @click="setPercent(75)">75%</button>
                <button class="btn btn-teal"    style="font-size:11px;padding:4px 9px" @click="setPercent(100)">Max</button>
              </div>
            </div>

            <!-- Arrow -->
            <div class="swap-arrow">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>

            <!-- Receive box -->
            <div class="swap-box-receive mb-4">
              <div class="swap-label">
                {{ t('exchange.youReceive') }}
                <span>{{ t('exchange.afterFee') }}</span>
              </div>
              <div class="flex items-center gap-3 mt-2">
                <div class="swap-receive-amount text-green">{{ formatNum(meoOut) }}</div>
                <div class="swap-token-badge" style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2)">
                  <div style="width:16px;height:16px;background:linear-gradient(135deg,var(--purple),var(--teal));border-radius:50%"></div>
                  <span class="text-green">MEOW</span>
                </div>
              </div>
            </div>

            <!-- Destination -->
            <div class="input-group">
              <label class="input-label">{{ t('exchange.receivingWallet') }}</label>
              <div class="input-field font-mono" style="cursor:default;color:var(--text-muted);font-size:11.5px">
                {{ walletAddress || t('wallet.connectPhantomNote') }}
              </div>
            </div>

            <button
              class="btn btn-primary btn-full btn-lg"
              @click="submitExchange"
              :disabled="!canExchange || loading"
            >
              <span v-if="loading" class="spin"></span>
              {{ loading ? t('exchange.processing') : `${t('nav.exchange')} ${formatNum(amount)} → MEOW` }}
            </button>
          </div>

          <!-- TX Result -->
          <div v-if="txHash" class="card">
            <div class="alert alert-success">{{ t('exchange.txSuccess') }}</div>
            <div class="text-sm text-muted mb-1">{{ t('exchange.txHash') }}</div>
            <div class="font-mono text-sm text-teal break-all">{{ txHash }}</div>
            <a :href="`https://solscan.io/tx/${txHash}?cluster=devnet`" target="_blank"
               class="btn btn-teal btn-full mt-3">{{ t('exchange.viewSolscan') }}</a>
          </div>

          <div v-if="error" class="alert alert-warning mt-3">{{ error }}</div>
        </div>

        <!-- Right: info panels -->
        <div class="flex flex-col gap-4">
          <!-- Rate -->
          <div class="card">
            <div class="card-header"><span class="card-title">{{ t('exchange.exchangeRate') }}</span></div>
            <div class="info-row"><span class="info-row-label">1 Meow Point =</span><span class="info-row-value text-green">1 MEOW</span></div>
            <div class="info-row"><span class="info-row-label">Transfer fee</span><span class="info-row-value text-amber">0.5%</span></div>
            <div class="info-row"><span class="info-row-label">Fund price</span><span class="info-row-value">${{ priceInfo.fundPrice }}</span></div>
            <div class="info-row"><span class="info-row-label">{{ t('exchange.marketPrice') }}</span><span class="info-row-value text-purple">${{ priceInfo.marketPrice }}</span></div>
          </div>

          <!-- Estimate -->
          <div class="card">
            <div class="card-header"><span class="card-title">{{ t('exchange.estimate') }}</span></div>
            <div class="info-row"><span class="info-row-label">{{ t('dashboard.fundValue') }}</span><span class="info-row-value">${{ formatUSD(meoOut * priceInfo.fundPrice) }}</span></div>
            <div class="info-row"><span class="info-row-label">{{ t('dashboard.marketValue') }}</span><span class="info-row-value text-green">${{ formatUSD(meoOut * priceInfo.marketPrice) }}</span></div>
            <div class="info-row"><span class="info-row-label">{{ t('exchange.feeBurned') }}</span><span class="info-row-value text-muted">{{ formatNum(amount * 0.005) }} MEOW</span></div>
          </div>

          <!-- How it works -->
          <div class="card">
            <div class="card-header"><span class="card-title">{{ t('exchange.howItWorks') }}</span></div>
            <ol class="step-list">
              <li v-for="(step, i) in steps" :key="i" class="step-item">
                <div class="step-num">{{ i+1 }}</div>
                <div class="step-text">{{ step }}</div>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '../services/api.js'
import { useI18n } from 'vue-i18n'
import { globalState } from '../state.js'
import Sidebar from '../components/Sidebar.vue'
import MobileHeader from '../components/MobileHeader.vue'

const { t } = useI18n()
const walletAddress = ref(localStorage.getItem('mao_wallet') || '')
const amount = ref(0)
const pointBalance = ref(0)
const loading = ref(false)
const txHash = ref('')
const error = ref('')
const priceInfo = ref({ fundPrice: 0.000211, marketPrice: 0.009453 })

const steps = computed(() => [t('exchange.step1'), t('exchange.step2'), t('exchange.step3'), t('exchange.step4'), t('exchange.step5')])

const meoOut = computed(() => {
  const n = Number(amount.value)
  if (!n || n <= 0) return 0
  return n * 0.995
})

const canExchange = computed(() =>
  walletAddress.value && Number(amount.value) > 0 && Number(amount.value) <= pointBalance.value
)

function setPercent(pct) { amount.value = Math.floor(pointBalance.value * pct / 100) }
function formatNum(v) { return Number(v || 0).toLocaleString('en-US', { maximumFractionDigits: 2 }) }
function formatUSD(v) { return (v || 0).toFixed(4) }

async function submitExchange() {
  if (!canExchange.value) return
  loading.value = true; error.value = ''; txHash.value = ''
  try {
    const res = await api.initiateExchange(Number(amount.value), walletAddress.value)
    if (res.result?.txHash) {
      txHash.value = res.result.txHash
      pointBalance.value -= Number(amount.value)
      amount.value = 0
    } else { error.value = res.message || 'Exchange failed.' }
  } catch (e) { error.value = e.response?.data?.message || 'Exchange failed. Try again.' }
  finally { loading.value = false }
}

onMounted(async () => {
  try { const r = await api.getPointBalance(); pointBalance.value = r.result || 0 } catch {}
  try { const r = await api.getPriceInfo(); if (r.result) priceInfo.value = r.result } catch {}
})
</script>

<style scoped>
.exchange-layout {
  display: grid;
  grid-template-columns: 1.25fr 1fr;
  gap: 22px;
}

@media (max-width: 991px) {
  .exchange-layout { grid-template-columns: 1fr; }
}

.swap-receive-amount {
  flex: 1;
  font-size: 26px;
  font-family: var(--mono);
  font-weight: 600;
}

.alert-link {
  color: var(--amber);
  margin-left: 8px;
  text-decoration: underline;
  text-decoration-color: rgba(245,158,11,0.4);
  text-underline-offset: 2px;
}
</style>
