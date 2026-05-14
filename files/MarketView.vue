<template>
  <div class="app-shell">
    <Sidebar />
    <main class="main-content">
      <div class="page-header">
        <h1 class="page-title">{{ t('market.title') }}</h1>
        <p class="page-subtitle">{{ t('market.subtitle') }}</p>
      </div>

      <!-- Price Chart -->
      <PriceChart />

      <!-- Stats -->
      <div class="stats-grid mb-6">
        <div class="stat-card">
          <div class="stat-label">{{ t('market.fundPrice') }}</div>
          <div class="stat-value green">${{ data.fundPrice }}</div>
          <div class="stat-change">{{ t('market.backedByGMV') }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t('market.secondaryMarket') }}</div>
          <div class="stat-value purple">${{ data.marketPrice }}</div>
          <div class="stat-change up">+{{ premiumPct }}% {{ t('market.premium') }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t('market.fundPool') }}</div>
          <div class="stat-value teal">${{ formatLarge(data.fundPool) }}</div>
          <div class="stat-change">{{ t('market.totalReserve') }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t('market.platformGMV') }}</div>
          <div class="stat-value">${{ formatLarge(data.totalSalesUSD) }}</div>
          <div class="stat-change">{{ t('market.cumulativeSales') }}</div>
        </div>
      </div>

      <!-- Token info + Milestone table -->
      <div class="market-mid-grid mb-5">
        <div class="card">
          <div class="card-header">
            <span class="card-title">{{ t('market.tokenInfo') }}</span>
          </div>
          <div class="token-info-list">
            <div v-for="row in tokenRows" :key="row.labelKey" class="token-info-row">
              <span class="text-secondary text-sm">{{ t(row.labelKey) }}</span>
              <span class="font-mono text-sm" :style="row.color ? `color:${row.color}` : ''">{{ row.value }}</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <span class="card-title">{{ t('market.mintingSchedule') }}</span>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>{{ t('market.stage') }}</th>
                <th>{{ t('market.gmvTarget') }}</th>
                <th>{{ t('market.mint') }}</th>
                <th>{{ t('market.statusLabel') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in milestones" :key="m.stage">
                <td>{{ m.stage }}</td>
                <td>${{ formatLarge(m.target) }}</td>
                <td class="text-purple">100M MEOW</td>
                <td>
                  <span class="badge" :class="m.done ? 'badge-green' : m.current ? 'badge-amber' : ''">
                    {{ m.done ? t('market.minted') : m.current ? t('market.current') : t('market.pending') }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tokenomics -->
      <div class="tokenomics-grid">
        <div class="card">
          <div class="stat-label mb-2">{{ t('market.totalSupply') }}</div>
          <div class="tokenomics-value">{{ formatLarge(data.totalSupply) }}</div>
          <div class="text-sm text-muted mt-1">MEOW {{ t('dashboard.meowTokens') }}</div>
          <div class="divider"></div>
          <div class="stat-label mb-1">{{ t('market.circulating') }}</div>
          <div class="font-mono text-teal" style="font-size:15px">{{ formatLarge(data.circulatingSupply) }}</div>
        </div>

        <div class="card">
          <div class="stat-label mb-2">{{ t('market.transferFee') }}</div>
          <div class="tokenomics-value text-amber">0.5%</div>
          <div class="text-sm text-muted mt-1">{{ t('market.burnOnTransfer') }}</div>
          <div class="divider"></div>
          <div class="stat-label mb-1">{{ t('market.totalBurned') }}</div>
          <div class="font-mono text-red" style="font-size:15px">{{ formatLarge(data.totalBurned) }} MEOW</div>
        </div>

        <div class="card">
          <div class="stat-label mb-2">{{ t('market.marketCapFund') }}</div>
          <div class="tokenomics-value text-green">${{ formatLarge(data.totalSupply * data.fundPrice) }}</div>
          <div class="text-sm text-muted mt-1">{{ t('market.atFundPrice') }}</div>
          <div class="divider"></div>
          <div class="stat-label mb-1">{{ t('market.marketCapDex') }}</div>
          <div class="font-mono text-purple" style="font-size:15px">${{ formatLarge(data.totalSupply * data.marketPrice) }}</div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '../services/api.js'
import { FIBONACCI_MILESTONES, getMilestoneInfo, MAO_MINT, shortenAddr } from '../services/wallet.js'
import { useI18n } from 'vue-i18n'
import Sidebar from '../components/Sidebar.vue'
import PriceChart from '../components/PriceChart.vue'

const { t } = useI18n()

const data = ref({
  fundPrice: 0.000211, marketPrice: 0.009453, fundPool: 153624,
  totalSalesUSD: 1540000, totalSupply: 729500000, circulatingSupply: 629500000,
  totalBurned: 3640000, fundRate: 10.0, currentMilestone: 7,
})

const premiumPct = computed(() => {
  if (!data.value.fundPrice) return 0
  return (((data.value.marketPrice - data.value.fundPrice) / data.value.fundPrice) * 100).toFixed(0)
})

const tokenRows = computed(() => [
  { labelKey: 'market.tokenInfo',   value: 'Maollar (MEOW)' },
  { labelKey: 'wallet.connected',   value: 'Solana' },
  { labelKey: 'wallet.walletAddress', value: shortenAddr(MAO_MINT, 6), color: 'var(--teal)' },
  { labelKey: 'market.transferFee', value: '0.5% (burn)' },
  { labelKey: 'market.fundPrice',   value: `$${data.value.fundPrice}` },
])

const milestones = computed(() =>
  FIBONACCI_MILESTONES.slice(1, 10).map((fib, i) => ({
    stage: i + 1,
    target: fib * 100_000,
    done: data.value.totalSalesUSD >= fib * 100_000,
    current: getMilestoneInfo(data.value.totalSalesUSD).currentMilestone === i + 1,
  }))
)

function formatLarge(v) {
  if (!v) return '0'
  if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(2) + 'B'
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(2) + 'M'
  if (v >= 1_000) return (v / 1_000).toFixed(1) + 'K'
  return Number(v).toLocaleString()
}

onMounted(async () => {
  try { const res = await api.getPlatformStats(); if (res.result) Object.assign(data.value, res.result) } catch {}
})
</script>

<style scoped>
.market-mid-grid {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 18px;
}

.tokenomics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.tokenomics-value {
  font-family: var(--mono);
  font-size: 22px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.4px;
  margin-top: 4px;
}

.token-info-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
</style>
