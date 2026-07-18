import { defineStore } from 'pinia';

export const useSessionStore = defineStore('session', {
  state: () => ({ accessToken: '', factoryId: 'factory-demo-01', userName: 'PDA Operator' }),
  actions: {
    setAccessToken(token: string) { this.accessToken = token; },
    setFactory(factoryId: string) { this.factoryId = factoryId; },
    clear() { this.accessToken = ''; },
  },
});
