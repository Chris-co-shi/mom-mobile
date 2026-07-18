<script setup lang="ts">
import { computed, onShow } from 'vue';
import NetworkBadge from '@/components/NetworkBadge.vue';
import OperationCard from '@/components/OperationCard.vue';
import { offlineQueue } from '@/offline/service';

const queueCount = computed(() => offlineQueue.list().length);
onShow(() => queueCount.value);
</script>

<template>
  <view class="page">
    <view class="hero">
      <view><text class="eyebrow">MOM · FACTORY DEMO 01</text><text class="heading">工业 PDA 工作台</text><text class="sub">扫码、离线、幂等与现场操作闭环</text></view>
      <NetworkBadge />
    </view>
    <view class="section-title">现场任务</view>
    <OperationCard title="原料收货" description="送货单、容器、重量与待检批次" path="/pages/receiving/index" />
    <OperationCard title="上架确认" description="容器与目标库位双扫码" path="/pages/putaway/index" />
    <OperationCard title="生产领料" description="工单、原料批次与数量确认" path="/pages/material-issue/index" />
    <OperationCard title="发运确认" description="发运单、托盘与装车复核" path="/pages/shipping/index" />
    <OperationCard title="离线任务" description="待同步、失败与人工重试" path="/pages/offline/index" :count="queueCount" />
  </view>
</template>

<style scoped>
.page{padding:28rpx}.hero{display:flex;justify-content:space-between;gap:20rpx;padding:34rpx;margin-bottom:34rpx;border-radius:24rpx;color:#fff;background:linear-gradient(135deg,#153e52,#146b71)}
.eyebrow,.heading,.sub{display:block}.eyebrow{font-size:22rpx;opacity:.72}.heading{margin-top:10rpx;font-size:42rpx;font-weight:800}.sub{margin-top:12rpx;font-size:24rpx;opacity:.82}.section-title{margin:0 0 20rpx 4rpx;font-size:28rpx;font-weight:700;color:#334155}
</style>
