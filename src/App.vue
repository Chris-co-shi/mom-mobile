<script setup lang="ts">
import { onLaunch, onShow } from '@dcloudio/uni-app';
import { initializeNetworkMonitor } from '@/platform/network';
import { getMobileAuthRuntime } from '@/auth';

onLaunch(() => {
  initializeNetworkMonitor();
  void getMobileAuthRuntime()?.restoreColdStart();
});

onShow(() => {
  const runtime = getMobileAuthRuntime();
  if (runtime?.getSnapshot().status === 'AUTHENTICATED') void runtime.refresh();
});
</script>

<style lang="scss">
page {
  min-height: 100%;
  background: #f3f6f8;
  color: #18212b;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
button::after { border: 0; }
</style>
