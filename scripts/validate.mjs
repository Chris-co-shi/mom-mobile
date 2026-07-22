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
if (!Array.isArray(pages.pages) || pages.pages.length < 5) throw new Error('Expected PDA page skeleton');
console.log('Repository boundaries validated.');
