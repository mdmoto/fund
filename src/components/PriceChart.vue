<template>
  <div class="price-chart-card">
    <div class="chart-header">
      <div>
        <div class="card-title">{{ t('market.priceChart') }}</div>
        <div class="chart-subtitle">{{ t('market.priceChartSubtitle') }}</div>
      </div>
      <div class="chart-controls">
        <!-- Timeframe selector -->
        <div class="timeframe-tabs">
          <button
            v-for="tf in timeframes"
            :key="tf.value"
            class="tf-btn"
            :class="{ active: activeTf === tf.value }"
            @click="switchTimeframe(tf.value)"
          >{{ tf.label }}</button>
        </div>
        <!-- Chart type toggle -->
        <div class="chart-type-toggle">
          <button @click="chartType='area'" :class="{ active: chartType==='area' }" class="ct-btn" title="Area Chart">
            <svg width="14" height="14" fill="none" viewBox="0 0 16 16">
              <path d="M1 12L5 7l3 3 4-5 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M1 12L5 7l3 3 4-5 3 3V14H1z" fill="currentColor" opacity="0.2"/>
            </svg>
          </button>
          <button @click="chartType='candlestick'" :class="{ active: chartType==='candlestick' }" class="ct-btn" title="Candlestick">
            <svg width="14" height="14" fill="none" viewBox="0 0 16 16">
              <rect x="3" y="4" width="3" height="8" rx="0.5" stroke="currentColor" stroke-width="1.2" fill="none"/>
              <line x1="4.5" y1="2" x2="4.5" y2="4" stroke="currentColor" stroke-width="1.2"/>
              <line x1="4.5" y1="12" x2="4.5" y2="14" stroke="currentColor" stroke-width="1.2"/>
              <rect x="10" y="5" width="3" height="6" rx="0.5" stroke="#10B981" stroke-width="1.2" fill="rgba(16,185,129,0.2)"/>
              <line x1="11.5" y1="3" x2="11.5" y2="5" stroke="#10B981" stroke-width="1.2"/>
              <line x1="11.5" y1="11" x2="11.5" y2="13" stroke="#10B981" stroke-width="1.2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Live price stats row -->
    <div class="price-stats-row">
      <div class="price-stat">
        <span class="price-stat-label">{{ t('market.marketPriceLine') }}</span>
        <span class="price-stat-value mono" style="color:var(--purple-light)">${{ currentPrice }}</span>
      </div>
      <div class="price-stat">
        <span class="price-stat-label">{{ t('market.high') }}</span>
        <span class="price-stat-value mono text-green">${{ high24h }}</span>
      </div>
      <div class="price-stat">
        <span class="price-stat-label">{{ t('market.low') }}</span>
        <span class="price-stat-value mono text-red">${{ low24h }}</span>
      </div>
      <div class="price-stat">
        <span class="price-stat-label">{{ t('market.change') }}</span>
        <span class="price-stat-value mono" :class="change24h >= 0 ? 'text-green' : 'text-red'">
          {{ change24h >= 0 ? '+' : '' }}{{ change24h.toFixed(2) }}%
        </span>
      </div>
      <div class="price-stat">
        <span class="price-stat-label">{{ t('market.fundPriceLine') }}</span>
        <span class="price-stat-value mono" style="color:var(--teal)">${{ fundPrice }}</span>
      </div>
    </div>

    <!-- Chart container -->
    <div ref="chartContainer" class="chart-container"></div>

    <!-- Legend -->
    <div class="chart-legend">
      <div class="legend-item">
        <span class="legend-dot" style="background:var(--purple-light)"></span>
        <span>{{ t('market.marketPriceLine') }}</span>
      </div>
      <div class="legend-item" v-if="chartType === 'area'">
        <span class="legend-dot" style="background:var(--teal)"></span>
        <span>{{ t('market.fundPriceLine') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const chartContainer = ref(null)
const chartType = ref('area')
const activeTf = ref('1D')

const timeframes = [
  { label: '1H', value: '1H' },
  { label: '4H', value: '4H' },
  { label: '1D', value: '1D' },
  { label: '1W', value: '1W' },
  { label: '1M', value: '1M' },
]

const currentPrice = ref('0.009453')
const high24h = ref('0.012100')
const low24h = ref('0.007800')
const change24h = ref(12.45)
const fundPrice = ref('0.000211')

let chart = null
let marketSeries = null
let fundSeries = null
let resizeObserver = null

// Generate realistic-looking simulated price data
function generatePriceData(tf) {
  const now = Math.floor(Date.now() / 1000)
  const data = []
  const fundData = []
  
  let intervals, step
  switch (tf) {
    case '1H':  intervals = 60;  step = 60;          break
    case '4H':  intervals = 96;  step = 60 * 4;       break
    case '1D':  intervals = 90;  step = 60 * 60 * 24; break
    case '1W':  intervals = 52;  step = 60 * 60 * 24 * 7; break
    case '1M':  intervals = 12;  step = 60 * 60 * 24 * 30; break
    default:    intervals = 90;  step = 60 * 60 * 24
  }

  // Start price: simulate growth from very low to current
  const baseMarket = 0.009453
  const baseFund = 0.000211
  let mp = baseMarket * 0.35 // start 65% lower
  let fp = baseFund * 0.85

  for (let i = intervals; i >= 0; i--) {
    const time = now - (i * step)
    
    // Market price: volatile with upward trend
    mp *= (1 + (Math.random() - 0.42) * 0.06)
    mp = Math.max(mp, 0.001)
    
    if (chartType.value === 'candlestick') {
      const open = mp
      const volatility = mp * 0.03
      const high = open + Math.random() * volatility * 2
      const low = open - Math.random() * volatility
      const close = low + Math.random() * (high - low)
      data.push({ time, open, high, low, close })
    } else {
      data.push({ time, value: mp })
    }
    
    // Fund price: slow steady growth
    fp *= (1 + (Math.random() - 0.45) * 0.01)
    fp = Math.max(fp, 0.00005)
    fundData.push({ time, value: fp })
  }

  return { market: data, fund: fundData }
}

async function initChart() {
  if (!chartContainer.value) return
  
  // Dynamically import lightweight-charts
  const { createChart, CrosshairMode, LineStyle } = await import('lightweight-charts')
  
  // Destroy existing chart
  if (chart) { chart.remove(); chart = null }

  chart = createChart(chartContainer.value, {
    layout: {
      background: { color: 'transparent' },
      textColor: '#94A3B8',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 11,
    },
    grid: {
      vertLines: { color: 'rgba(255,255,255,0.04)', style: LineStyle.Dotted },
      horzLines: { color: 'rgba(255,255,255,0.04)', style: LineStyle.Dotted },
    },
    crosshair: {
      mode: CrosshairMode.Normal,
      vertLine: { color: 'rgba(139,92,246,0.4)', width: 1, style: LineStyle.Dashed },
      horzLine: { color: 'rgba(139,92,246,0.4)', width: 1, style: LineStyle.Dashed },
    },
    rightPriceScale: {
      borderColor: 'rgba(255,255,255,0.06)',
      textColor: '#94A3B8',
    },
    timeScale: {
      borderColor: 'rgba(255,255,255,0.06)',
      timeVisible: true,
      secondsVisible: false,
      tickMarkFormatter: (time) => {
        const d = new Date(time * 1000)
        if (activeTf.value === '1H' || activeTf.value === '4H')
          return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0')
        return (d.getMonth()+1) + '/' + d.getDate()
      },
    },
    handleScroll: true,
    handleScale: true,
  })

  const { market, fund } = generatePriceData(activeTf.value)

  if (chartType.value === 'candlestick') {
    marketSeries = chart.addCandlestickSeries({
      upColor: '#10B981',
      downColor: '#EF4444',
      borderUpColor: '#10B981',
      borderDownColor: '#EF4444',
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444',
    })
    marketSeries.setData(market)
  } else {
    // Market price area
    marketSeries = chart.addAreaSeries({
      lineColor: '#A78BFA',
      topColor: 'rgba(139,92,246,0.25)',
      bottomColor: 'rgba(139,92,246,0.01)',
      lineWidth: 2,
      priceLineVisible: true,
      priceLineColor: 'rgba(167,139,250,0.5)',
    })
    marketSeries.setData(market)

    // Fund price line
    fundSeries = chart.addLineSeries({
      color: '#06B6D4',
      lineWidth: 1.5,
      lineStyle: LineStyle.Dashed,
      priceLineVisible: false,
      lastValueVisible: true,
    })
    fundSeries.setData(fund)
  }

  chart.timeScale().fitContent()

  // Responsive resize
  resizeObserver = new ResizeObserver(() => {
    if (chart && chartContainer.value) {
      chart.applyOptions({ width: chartContainer.value.clientWidth })
    }
  })
  resizeObserver.observe(chartContainer.value)
}

function switchTimeframe(tf) {
  activeTf.value = tf
  initChart()
}

watch(chartType, () => initChart())

onMounted(() => {
  initChart()
  // Simulate live price updates
  setInterval(() => {
    const delta = (Math.random() - 0.48) * 0.0003
    const newPrice = (parseFloat(currentPrice.value) + delta).toFixed(6)
    currentPrice.value = newPrice
  }, 3000)
})

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect()
  if (chart) chart.remove()
})
</script>

<style scoped>
.price-chart-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px;
  margin-bottom: 20px;
}

.chart-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 14px;
}

.chart-subtitle {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

.chart-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.timeframe-tabs {
  display: flex;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 2px;
  gap: 2px;
}

.tf-btn {
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  font-family: var(--mono);
  color: var(--text-muted);
  background: transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
}

.tf-btn.active {
  background: rgba(139,92,246,0.18);
  color: var(--purple-light);
}

.tf-btn:hover:not(.active) {
  color: var(--text-secondary);
}

.chart-type-toggle {
  display: flex;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 2px;
  gap: 2px;
}

.ct-btn {
  width: 30px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
}

.ct-btn.active {
  background: rgba(139,92,246,0.18);
  color: var(--purple-light);
}

.price-stats-row {
  display: flex;
  gap: 24px;
  margin-bottom: 14px;
  padding: 10px 14px;
  background: rgba(255,255,255,0.02);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  flex-wrap: wrap;
}

.price-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.price-stat-label {
  font-size: 10px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  font-weight: 600;
}

.price-stat-value {
  font-size: 14px;
  font-weight: 600;
}

.chart-container {
  height: 320px;
  width: 100%;
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.chart-legend {
  display: flex;
  gap: 16px;
  margin-top: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--text-muted);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.mono { font-family: var(--mono); }
.text-green { color: var(--green); }
.text-red { color: var(--red); }
.text-teal { color: var(--teal); }
</style>
