<script setup lang="ts">
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import NetworkBadge from '@/components/NetworkBadge.vue';
import OperationCard from '@/components/OperationCard.vue';
import { offlineQueue } from '@/offline/service';

const queueCount = ref(0);
onShow(() => {
  queueCount.value = offlineQueue.list().length;
});
</script>

<template>
  <view class="page">
    <view class="hero">
      <view><text class="eyebrow">MOM · FACTORY DEMO 01</text><text class="heading">工业 PDA 工作台</text><text class="sub">扫码、离线、幂等与现场操作闭环</text></view>
      <NetworkBadge />
    </view>
    <view class="section-title">现场任务</view>
    <OperationCard title="原料收货" description="送货单、容器、重量与待检批次" path="/pages/receiving/index" />
    <OperationCard title="离线任务" description="待同步、失败与人工重试" path="/pages/offline/index" :count="queueCount" />
  </view>
</template>

<style scoped>
.page{padding:28rpx}.hero{display:flex;justify-content:space-between;gap:20rpx;padding:34rpx;margin-bottom:34rpx;border-radius:24rpx;color:#fff;background:linear-gradient(135deg,#153e52,#146b71)}
.eyebrow,.heading,.sub{display:block}.eyebrow{font-size:22rpx;opacity:.72}.heading{margin-top:10rpx;font-size:42rpx;font-weight:800}.sub{margin-top:12rpx;font-size:24rpx;opacity:.82}.section-title{margin:0 0 20rpx 4rpx;font-size:28rpx;font-weight:700;color:#334155}
</style>
