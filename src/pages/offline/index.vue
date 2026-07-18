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

function remove(id: string) {
  offlineQueue.remove(id);
  reload();
}
</script>

<template>
  <view class="page">
    <view v-if="commands.length === 0" class="empty">暂无离线任务</view>
    <view v-for="item in commands" :key="item.id" class="task">
      <text class="endpoint">{{ item.endpoint }}</text>
      <text class="meta">{{ item.status }} · {{ item.createdAt }}</text>
      <button size="mini" @click="remove(item.id)">移除</button>
    </view>
  </view>
</template>

<style scoped>
.page{padding:28rpx}.empty{padding:80rpx;text-align:center;color:#94a3b8}.task{padding:28rpx;margin-bottom:20rpx;border-radius:18rpx;background:#fff}.endpoint,.meta{display:block}.endpoint{font-weight:700}.meta{margin:12rpx 0;color:#64748b;font-size:22rpx}
</style>
