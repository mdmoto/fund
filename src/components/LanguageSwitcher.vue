<template>
  <div class="lang-switcher" ref="switcherRef">
    <button class="lang-btn" @click="open = !open">
      <span class="lang-flag">{{ current.flag }}</span>
      <span class="lang-code">{{ current.code === 'zh-CN' ? '中' : current.code.split('-')[0].toUpperCase() }}</span>
      <svg width="10" height="10" fill="none" viewBox="0 0 12 12" :style="open ? 'transform:rotate(180deg)' : ''">
        <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
    <div v-if="open" class="lang-dropdown">
      <button
        v-for="lang in LANGUAGES"
        :key="lang.code"
        class="lang-option"
        :class="{ active: locale === lang.code }"
        @click="selectLang(lang.code)"
      >
        <span class="lang-flag">{{ lang.flag }}</span>
        <span class="lang-label">{{ lang.label }}</span>
        <svg v-if="locale === lang.code" width="12" height="12" fill="none" viewBox="0 0 16 16">
          <path d="M3 8l4 4 6-6" stroke="var(--purple-light)" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { LANGUAGES, setLocale } from '../i18n.js'

const { locale } = useI18n()
const open = ref(false)
const switcherRef = ref(null)

const current = computed(() => LANGUAGES.find(l => l.code === locale.value) || LANGUAGES[0])

function selectLang(code) {
  setLocale(code)
  open.value = false
}

function handleClickOutside(e) {
  if (switcherRef.value && !switcherRef.value.contains(e.target)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.lang-switcher {
  position: relative;
}

.lang-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 10px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  font-family: var(--sans);
  transition: all 0.15s ease;
}

.lang-btn:hover {
  border-color: rgba(139,92,246,0.3);
  color: var(--text-primary);
}

.lang-flag { font-size: 14px; }
.lang-code { font-family: var(--mono); }

.lang-dropdown {
  position: absolute;
  bottom: 100%;
  left: 0;
  margin-bottom: 4px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 6px;
  min-width: 160px;
  box-shadow: var(--shadow);
  z-index: 1000;
}

.lang-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  width: 100%;
  text-align: left;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 13px;
  font-family: var(--sans);
  background: transparent;
  border: none;
  transition: all 0.12s ease;
}

.lang-option:hover {
  background: rgba(255,255,255,0.05);
  color: var(--text-primary);
}

.lang-option.active {
  color: var(--purple-light);
  background: rgba(139,92,246,0.08);
}

.lang-label { flex: 1; }
</style>
