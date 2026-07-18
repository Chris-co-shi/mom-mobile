<script setup lang="ts">
defineProps<{ title: string; description: string; path: string; count?: number }>();
const open = (path: string) => uni.navigateTo({ url: path });
</script>

<template>
  <view class="card" @click="open(path)">
    <view><text class="title">{{ title }}</text><text class="description">{{ description }}</text></view>
    <view class="right"><text v-if="count" class="count">{{ count }}</text><text class="arrow">›</text></view>
  </view>
</template>

<style scoped>
.card { display:flex; justify-content:space-between; align-items:center; padding:28rpx; margin-bottom:20rpx; border-radius:18rpx; background:#fff; box-shadow:0 8rpx 24rpx rgba(21,62,82,.07); }
.title,.description { display:block; }.title { font-weight:700;font-size:32rpx; }.description { margin-top:8rpx;color:#64748b;font-size:24rpx; }
.right { display:flex;align-items:center;gap:12rpx; }.count { min-width:36rpx;padding:4rpx 10rpx;border-radius:999rpx;text-align:center;color:#fff;background:#d97706;font-size:22rpx; }.arrow { font-size:48rpx;color:#94a3b8; }
</style>
