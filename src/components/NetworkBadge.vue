<script setup lang="ts">
import { computed } from 'vue';
import { networkState } from '@/platform/network';

const text = computed(() => networkState.value.isConnected ? `在线 · ${networkState.value.networkType}` : '离线模式');
</script>

<template><view class="badge" :class="{ offline: !networkState.isConnected }">{{ text }}</view></template>

<style scoped>
.badge { padding: 8rpx 16rpx; border-radius: 999rpx; color: #087f6b; background: #d8f5ee; font-size: 24rpx; }
.badge.offline { color: #9a3412; background: #ffedd5; }
</style>
