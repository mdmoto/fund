<template>
  <div class="app-shell">
    <MobileHeader />
    <Sidebar />
    <main class="main-content">
      <div class="page-header flex justify-between items-center">
        <div>
          <h1 class="page-title">{{ t('dashboard.title') }}</h1>
          <p class="page-subtitle">{{ t('dashboard.subtitle') }}</p>
        </div>
        <div class="flex gap-2 items-center">
          <div v-if="walletAddress" class="wallet-addr" @click="copyAddress" :title="walletAddress">
            <svg width="11" height="11" fill="none" viewBox="0 0 16 16">
              <circle cx="8" cy="8" r="6" stroke="#8B5CF6" stroke-width="1.5"/>
              <circle cx="8" cy="8" r="2.5" fill="#8B5CF6"/>
            </svg>
            {{ shortenAddr(walletAddress) }}
            <svg width="10" height="10" fill="none" viewBox="0 0 16 16" style="opacity:0.35">
              <rect x="4" y="4" width="9" height="9" rx="2" stroke="currentColor" stroke-width="1.5"/>
              <path d="M3 11V3h8" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </div>
          <button v-else class="btn btn-outline" style="font-size:12px;padding:7px 12px" @click="$router.push('/wallet')">
            {{ t('dashboard.connectWallet') }}
          </button>
          <button class="btn btn-primary" @click="$router.push('/exchange')" :disabled="!walletAddress">
            {{ t('dashboard.exchangeBtn') }}
          </button>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">{{ t('dashboard.fundPrice') }}</div>
          <div class="stat-value green">
            <span v-if="loadingStats" class="skeleton" style="width:90px;height:22px;display:inline-block"></span>
            <span v-else>${{ formatPrice(stats.fundPrice) }}</span>
          </div>
          <div class="stat-change">{{ t('dashboard.perMeow') }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t('dashboard.marketPrice') }}</div>
          <div class="stat-value purple">
            <span v-if="loadingStats" class="skeleton" style="width:90px;height:22px;display:inline-block"></span>
            <span v-else>${{ formatPrice(stats.marketPrice) }}</span>
          </div>
          <div class="stat-change up">{{ t('dashboard.secondaryMarket') }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t('dashboard.fundPool') }}</div>
          <div class="stat-value teal">
            <span v-if="loadingStats" class="skeleton" style="width:90px;height:22px;display:inline-block"></span>
            <span v-else>${{ formatLarge(stats.fundPool) }}</span>
          </div>
          <div class="stat-change">{{ t('dashboard.totalReserve') }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t('dashboard.totalIssued') }}</div>
          <div class="stat-value">
            <span v-if="loadingStats" class="skeleton" style="width:90px;height:22px;display:inline-block"></span>
            <span v-else>{{ formatLarge(stats.totalSupply) }}</span>
          </div>
          <div class="stat-change">{{ t('dashboard.meowTokens') }}</div>
        </div>
      </div>

      <!-- Price Chart -->
      <PriceChart />

      <!-- Milestone -->
      <div class="milestone-section">
        <div class="milestone-header">
          <div>
            <div class="card-title">{{ t('dashboard.milestoneTitle') }}</div>
            <div class="milestone-sub">
              {{ t('dashboard.milestoneSubtitle') }}
              <span class="font-mono text-teal">${{ formatLarge(milestoneInfo.nextThreshold) }}</span>
            </div>
          </div>
          <div style="text-align:right">
            <div class="milestone-badge">{{ t('dashboard.stage') }} {{ milestoneInfo.currentMilestone }}</div>
            <div class="milestone-progress-text">{{ milestoneInfo.progress.toFixed(1) }}% {{ t('dashboard.toNext') }}</div>
          </div>
        </div>

        <div class="milestone-track" style="padding-bottom:40px">
          <div class="milestone-line">
            <div class="milestone-line-fill" :style="`width:${overallProgress}%`"></div>
          </div>
          <div class="milestone-nodes">
            <div v-for="(thresh, i) in displayedMilestones" :key="i" class="milestone-node">
              <div class="milestone-dot"
                :class="{
                  done: stats.totalSalesUSD >= thresh.value,
                  current: milestoneInfo.currentMilestone === i && stats.totalSalesUSD < (displayedMilestones[i+1]?.value ?? Infinity)
                }">
                <svg v-if="stats.totalSalesUSD >= thresh.value && thresh.value > 0" width="10" height="10" fill="none" viewBox="0 0 16 16">
                  <path d="M3 8l4 4 6-6" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
                </svg>
                <span v-else style="color:var(--text-muted)">{{ i }}</span>
              </div>
              <div class="milestone-node-label"
                :class="{ done: stats.totalSalesUSD >= thresh.value, current: milestoneInfo.currentMilestone === i }">
                {{ thresh.label }}
              </div>
            </div>
          </div>
        </div>

        <!-- Mini stats -->
        <div class="milestone-stats-row">
          <div class="mini-stat-card">
            <div class="stat-label">{{ t('dashboard.platformGMV') }}</div>
            <div class="font-mono" style="font-size:17px;color:var(--text-primary);margin-top:4px">${{ formatLarge(stats.totalSalesUSD) }}</div>
          </div>
          <div class="mini-stat-card">
            <div class="stat-label">{{ t('dashboard.nextMintAt') }}</div>
            <div class="font-mono text-teal" style="font-size:17px;margin-top:4px">${{ formatLarge(milestoneInfo.nextThreshold) }}</div>
          </div>
          <div class="mini-stat-card">
            <div class="stat-label">{{ t('dashboard.tokensPerMint') }}</div>
            <div class="font-mono text-purple" style="font-size:17px;margin-top:4px">100M MEOW</div>
          </div>
        </div>
      </div>

      <!-- My Assets -->
      <div class="asset-grid">
        <div class="asset-card">
          <div class="card-header">
            <span class="card-title">{{ t('dashboard.myRewards') }}</span>
            <span class="badge badge-amber">{{ t('dashboard.awaitingExchange') }}</span>
          </div>
          <div class="asset-amount">
            <span v-if="loadingBalance" class="skeleton" style="width:140px;height:36px;display:inline-block"></span>
            <span v-else>{{ formatTokens(pointBalance) }}</span>
          </div>
          <div class="asset-amount-sub">Meow Points (喵币)</div>
          <div class="asset-usd">
            <span>{{ t('dashboard.estimatedValue') }}</span>
            <span class="font-mono">${{ formatPrice(pointBalance * stats.fundPrice) }}</span>
          </div>
          <div class="mt-4">
            <template v-if="isLoggedIn">
              <button class="btn btn-primary btn-full" @click="$router.push('/exchange')"
                :disabled="!walletAddress || pointBalance <= 0">
                {{ t('dashboard.exchangeBtn2') }}
              </button>
              <div v-if="!walletAddress" class="no-wallet-hint">{{ t('exchange.noWalletAlert') }}</div>
            </template>
            <button v-else class="btn btn-outline btn-full" @click="$router.push('/login')">
              {{ t('common.loginToView') || 'Login to View' }}
            </button>
          </div>
        </div>

        <div class="asset-card">
          <div class="card-header">
            <span class="card-title">{{ t('dashboard.onChainBalance') }}</span>
            <span class="badge badge-green">{{ t('dashboard.live') }}</span>
          </div>
          <template v-if="isLoggedIn">
            <div class="asset-amount">
              <span v-if="loadingOnchain" class="skeleton" style="width:120px;height:36px;display:inline-block"></span>
              <span v-else>{{ formatTokens(maoBalance) }}</span>
            </div>
            <div class="asset-amount-sub">MEOW · Solana</div>
            <div class="asset-usd">
              <span>{{ t('dashboard.fundValue') }}</span>
              <span class="font-mono">${{ formatPrice(maoBalance * stats.fundPrice) }}</span>
            </div>
            <div class="asset-usd" style="border-top:none;padding-top:0">
              <span class="text-muted">{{ t('dashboard.marketValue') }}</span>
              <span class="font-mono text-green">${{ formatPrice(maoBalance * stats.marketPrice) }}</span>
            </div>
            <div class="mt-4">
              <a v-if="walletAddress"
                :href="`https://solscan.io/account/${walletAddress}?cluster=devnet`"
                target="_blank" class="btn btn-outline btn-full">
                {{ t('dashboard.viewSolscan') }}
              </a>
              <button v-else class="btn btn-teal btn-full" @click="$router.push('/wallet')">
                {{ t('dashboard.setupWallet') }}
              </button>
            </div>
          </template>
          <div v-else class="mt-4">
            <div class="empty-state" style="padding: 20px 0;">{{ t('common.privateInfo') || 'Login to see on-chain assets' }}</div>
            <button class="btn btn-outline btn-full" @click="$router.push('/login')">
              {{ t('common.login') || 'Login' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Recent History -->
      <div class="card" v-if="isLoggedIn">
        <div class="card-header">
          <span class="card-title">{{ t('dashboard.recentExchanges') }}</span>
          <button class="btn btn-outline" style="font-size:11px;padding:5px 10px" @click="$router.push('/exchange')">
            {{ t('dashboard.viewAll') }}
          </button>
        </div>
        <div v-if="history.length === 0" class="empty-state">{{ t('dashboard.noExchanges') }}</div>
        <table v-else class="data-table">
          <thead>
            <tr>
              <th>{{ t('dashboard.date') }}</th>
              <th>{{ t('dashboard.pointsIn') }}</th>
              <th>{{ t('dashboard.meowOut') }}</th>
              <th>TX</th>
              <th>{{ t('dashboard.status') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tx in history" :key="tx.id">
              <td>{{ formatDate(tx.createdAt) }}</td>
              <td>{{ formatTokens(tx.pointsUsed) }}</td>
              <td class="text-green">+{{ formatTokens(tx.meoReceived) }}</td>
              <td>
                <a :href="`https://solscan.io/tx/${tx.txHash}?cluster=devnet`" target="_blank" class="text-teal">
                  {{ tx.txHash?.slice(0, 8) }}...
                </a>
              </td>
              <td>
                <span class="badge" :class="tx.status === 'success' ? 'badge-green' : 'badge-amber'">
                  {{ tx.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '../services/api.js'
import { getMaoBalance, shortenAddr, getMilestoneInfo, FIBONACCI_MILESTONES } from '../services/wallet.js'
import { useI18n } from 'vue-i18n'
import { globalState } from '../state.js'
import Sidebar from '../components/Sidebar.vue'
import MobileHeader from '../components/MobileHeader.vue'
import PriceChart from '../components/PriceChart.vue'

const { t } = useI18n()
const loadingStats = ref(true)
const loadingBalance = ref(true)
const loadingOnchain = ref(true)

const stats = ref({ fundPrice: 0.000211, marketPrice: 0.009453, fundPool: 153624, totalSupply: 729500000, totalSalesUSD: 1540000, currentMintCount: 7 })
const pointBalance = ref(0)
const maoBalance = ref(0)
const history = ref([])
const walletAddress = ref(localStorage.getItem('mao_wallet') || '')
const isLoggedIn = computed(() => !!localStorage.getItem('mao_token'))

const milestoneInfo = computed(() => getMilestoneInfo(stats.value.totalSalesUSD))
const displayedMilestones = computed(() =>
  FIBONACCI_MILESTONES.slice(0, 8).map((fib) => ({ value: fib * 100_000, label: fib === 0 ? '$0' : `$${fib * 100}K` }))
)
const overallProgress = computed(() => Math.min((stats.value.totalSalesUSD / (FIBONACCI_MILESTONES[7] * 100_000)) * 100, 100))

function formatPrice(v) { if (!v) return '0.00'; return v < 0.01 ? v.toFixed(6) : v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
function formatLarge(v) { if (!v) return '0'; if (v >= 1_000_000) return (v/1_000_000).toFixed(2)+'M'; if (v >= 1_000) return (v/1_000).toFixed(1)+'K'; return v.toString() }
function formatTokens(v) { if (!v) return '0'; return Number(v).toLocaleString('en-US', { maximumFractionDigits: 2 }) }
function formatDate(d) { if (!d) return '—'; return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
function copyAddress() { if (walletAddress.value) navigator.clipboard.writeText(walletAddress.value) }

async function loadStats() {
  loadingStats.value = true
  try { const res = await api.getPlatformStats(); if (res.result) Object.assign(stats.value, res.result) } catch {}
  finally { loadingStats.value = false }
}
async function loadBalance() {
  loadingBalance.value = true
  try { const res = await api.getPointBalance(); pointBalance.value = res.result || 0 } catch { pointBalance.value = 0 }
  finally { loadingBalance.value = false }
}
async function loadOnchain() {
  if (!walletAddress.value) { loadingOnchain.value = false; return }
  loadingOnchain.value = true
  try { maoBalance.value = await getMaoBalance(walletAddress.value) } catch { maoBalance.value = 0 }
  finally { loadingOnchain.value = false }
}
async function loadHistory() {
  try { const res = await api.getExchangeHistory(); history.value = res.result || [] } catch { history.value = [] }
}

onMounted(() => {
  loadStats()
  if (isLoggedIn.value) {
    loadBalance()
    loadOnchain()
    loadHistory()
  }
})
</script>

<style scoped>
.milestone-sub {
  font-size: 12.5px;
  color: var(--text-secondary);
  margin-top: 5px;
}

.milestone-progress-text {
  font-size: 10.5px;
  color: var(--text-muted);
  margin-top: 5px;
  font-family: var(--mono);
}

.milestone-stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-top: 8px;
}

.mini-stat-card {
  background: rgba(255,255,255,0.025);
  padding: 14px 16px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  transition: border-color var(--t-mid);
}

.mini-stat-card:hover { border-color: var(--border-mid); }

.no-wallet-hint {
  font-size: 11px;
  color: var(--text-muted);
  text-align: center;
  margin-top: 8px;
}

.empty-state {
  text-align: center;
  padding: 36px;
  color: var(--text-muted);
  font-size: 13px;
}
</style>
