import { createSSRApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { createH5AuthRuntime } from './auth';

export function createApp() {
  // #ifdef H5
  createH5AuthRuntime();
  // #endif
  const app = createSSRApp(App);
  app.use(createPinia());
  return { app };
}
