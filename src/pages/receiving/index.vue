<script setup lang="ts">
import { ref } from 'vue';
import { scanner } from '@/platform/scanner';
import { networkState } from '@/platform/network';

const deliveryCode = ref('');
const message = ref('请扫描供应商送货单');
async function scanDelivery() {
  try { deliveryCode.value = (await scanner.scan()).value; message.value = '送货单已识别，可继续扫描容器'; }
  catch (error) { message.value = error instanceof Error ? error.message : '扫码失败'; }
}
function submit() {
  if (!deliveryCode.value) return uni.showToast({ title: '请先扫码', icon: 'none' });
  if (!networkState.value.isConnected) {
    return uni.showToast({ title: '请先完成 Mobile 登录后再创建离线命令', icon: 'none' });
  }
  uni.showToast({ title: '在线提交将在 VS-01 接入', icon: 'none' });
}
</script>

<template><view class="page"><view class="step">1 / 4 · 送货单</view><view class="scan-box"><text class="value">{{ deliveryCode || '尚未扫描' }}</text><button class="scan" @click="scanDelivery">扫描送货单</button></view><view class="hint">{{ message }}</view><button class="primary" @click="submit">确认收货</button></view></template>
<style scoped>
.page{padding:28rpx}.step{margin-bottom:20rpx;color:#64748b}.scan-box{padding:40rpx;border:3rpx dashed #5c8798;border-radius:24rpx;background:#fff;text-align:center}.value{display:block;margin-bottom:28rpx;font-size:32rpx;font-weight:700}.scan{background:#153e52;color:#fff}.hint{padding:24rpx;color:#475569}.primary{margin-top:40rpx;background:#00a389;color:#fff}
</style>
