import { existsSync, readFileSync } from 'node:fs';
const required = ['src/manifest.json','src/pages.json','src/platform/scanner/index.ts','src/platform/network/index.ts','src/offline/service.ts','src/auth/runtime.ts','src/auth/secure-storage.ts','docs/prototypes/mobile/VS-01-material-to-finished-goods/README.md'];
const missing = required.filter((path) => !existsSync(path));
if (missing.length) throw new Error(`Missing required paths: ${missing.join(', ')}`);
const pkg = JSON.parse(readFileSync('package.json','utf8'));
if (!pkg.scripts['build:h5'] || !pkg.scripts['type-check'] || !pkg.scripts['test:auth']) throw new Error('Required build scripts are missing');
const sensitiveStorageFiles = ['src/stores/session.ts','src/platform/storage/index.ts','src/offline/repository.ts'];
for (const path of sensitiveStorageFiles) {
  if (/refresh[_ ]?token/i.test(readFileSync(path, 'utf8'))) throw new Error(`Refresh Token must not use ordinary storage: ${path}`);
}
const pages = JSON.parse(readFileSync('src/pages.json','utf8'));
const runtimePages = pages.pages?.map((page) => page.path) ?? [];
const allowedPages = ['pages/index/index', 'pages/receiving/index', 'pages/offline/index'];
if (JSON.stringify(runtimePages) !== JSON.stringify(allowedPages)) {
  throw new Error(`Runtime pages must match the Phase 02 preflight allowlist: ${runtimePages.join(', ')}`);
}
const indexView = readFileSync('src/pages/index/index.vue', 'utf8');
for (const forbiddenPage of ['material-issue', 'shipping', 'putaway']) {
  if (indexView.includes(forbiddenPage)) throw new Error(`Future page must not appear in runtime navigation: ${forbiddenPage}`);
}
const authRuntime = readFileSync('src/auth/runtime.ts', 'utf8');
if (!authRuntime.includes('this.config.gatewayBaseUrl') || authRuntime.includes("this.config.issuer.replace(/\\/$/, '')}/api/iam/me")) {
  throw new Error('/api/iam/me must use gatewayBaseUrl, never issuer');
}
const apiClient = readFileSync('src/api/client.ts', 'utf8');
if (!apiClient.includes("'Idempotency-Key'") || apiClient.includes("'X-Idempotency-Key'")) {
  throw new Error('Mobile business requests must use only Idempotency-Key');
}
if (!apiClient.includes('Gateway-relative path')) throw new Error('Business requests must remain Gateway-relative');
const offlineTypes = readFileSync('src/offline/types.ts', 'utf8');
const envelope = offlineTypes.slice(
  offlineTypes.indexOf('export interface OfflineCommandEnvelope'),
  offlineTypes.indexOf('export type OfflineCommand ='),
);
if (/\bendpoint\b/u.test(envelope) || /\bmethod\s*:/u.test(envelope)) {
  throw new Error('Persisted offline commands must not contain endpoint or HTTP method');
}
if (/accessToken|refreshToken|authorization/i.test(envelope)) {
  throw new Error('Persisted offline commands must not contain Token or Authorization data');
}
for (const status of ['UNKNOWN_RESULT', 'CONFLICT', 'AUTH_REQUIRED', 'MANUAL_REQUIRED', 'CHECKING_STATUS']) {
  if (!offlineTypes.includes(`'${status}'`)) throw new Error(`Offline state machine is missing ${status}`);
}
console.log('Repository boundaries validated.');
