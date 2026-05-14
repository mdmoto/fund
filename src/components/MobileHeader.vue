<template>
  <header class="mobile-header">
    <div class="sidebar-logo" style="margin:0; border:none; padding:0; gap:8px">
      <div class="logo-icon" style="width:28px; height:28px; border-radius:6px; font-size:12px; box-shadow:none">
        <svg width="14" height="14" viewBox="0 0 28 28" fill="none">
          <path d="M14 2L26 8V20L14 26L2 20V8L14 2Z" stroke="white" stroke-width="1.5" fill="none"/>
          <path d="M14 7L21 11V18L14 22L7 18V11L14 7Z" fill="white" opacity="0.4"/>
        </svg>
      </div>
      <div class="logo-text" style="font-size:16px">Maollar</div>
    </div>
    <button class="menu-toggle" @click="globalState.isSidebarOpen = true">
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
  </header>
</template>

<script setup>
import { globalState } from '../state.js'
</script>
