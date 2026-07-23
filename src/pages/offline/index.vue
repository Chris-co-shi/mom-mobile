<script setup lang="ts">
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { offlineQueue } from '@/offline/service';
import type { OfflineCommand } from '@/offline/types';

const commands = ref<OfflineCommand[]>([]);
const reload = () => {
  commands.value = offlineQueue.list();
};

onShow(reload);

</script>

<template>
  <view class="page">
    <view v-if="commands.length === 0" class="empty">暂无离线任务</view>
    <view v-for="item in commands" :key="item.id" class="task">
      <text class="command-type">{{ item.commandType }}</text>
      <text class="meta">{{ item.status }} · {{ item.createdAt }}</text>
      <text v-if="item.lastErrorMessage" class="error">{{ item.lastErrorMessage }}</text>
    </view>
  </view>
</template>

<style scoped>
.page{padding:28rpx}.empty{padding:80rpx;text-align:center;color:#94a3b8}.task{padding:28rpx;margin-bottom:20rpx;border-radius:18rpx;background:#fff}.command-type,.meta,.error{display:block}.command-type{font-weight:700}.meta{margin:12rpx 0;color:#64748b;font-size:22rpx}.error{color:#b42318;font-size:22rpx}
</style>
