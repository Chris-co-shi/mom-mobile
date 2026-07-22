import { defineStore } from 'pinia';

export const useSessionStore = defineStore('session', {
  state: () => ({ factoryId: '', userName: '', authenticated: false }),
  actions: {
    establish(userName: string, factoryId: string | null) {
      this.userName = userName;
      this.factoryId = factoryId ?? '';
      this.authenticated = true;
    },
    setFactory(factoryId: string) { this.factoryId = factoryId; },
    clear() {
      this.factoryId = '';
      this.userName = '';
      this.authenticated = false;
    },
  },
});
