<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app';
import { initializeNetworkMonitor } from '@/platform/network';

onLaunch(() => {
  initializeNetworkMonitor();
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
