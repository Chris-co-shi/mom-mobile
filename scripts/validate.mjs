import { existsSync, readFileSync } from 'node:fs';
const required = ['src/manifest.json','src/pages.json','src/platform/scanner/index.ts','src/platform/network/index.ts','src/offline/service.ts','docs/prototypes/mobile/VS-01-material-to-finished-goods/README.md'];
const missing = required.filter((path) => !existsSync(path));
if (missing.length) throw new Error(`Missing required paths: ${missing.join(', ')}`);
const pkg = JSON.parse(readFileSync('package.json','utf8'));
if (!pkg.scripts['build:h5'] || !pkg.scripts['type-check']) throw new Error('Required build scripts are missing');
const pages = JSON.parse(readFileSync('src/pages.json','utf8'));
if (!Array.isArray(pages.pages) || pages.pages.length < 5) throw new Error('Expected PDA page skeleton');
console.log('Repository boundaries validated.');
