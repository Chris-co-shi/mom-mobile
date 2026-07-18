import { ref, readonly } from 'vue';

export interface NetworkState {
  isConnected: boolean;
  networkType: string;
}

const state = ref<NetworkState>({ isConnected: true, networkType: 'unknown' });
let initialized = false;

export const networkState = readonly(state);

export function initializeNetworkMonitor(): void {
  if (initialized) return;
  initialized = true;
  uni.getNetworkType({
    success: ({ networkType }) => {
      state.value = { isConnected: networkType !== 'none', networkType };
    },
  });
  uni.onNetworkStatusChange(({ isConnected, networkType }) => {
    state.value = { isConnected, networkType };
  });
}
