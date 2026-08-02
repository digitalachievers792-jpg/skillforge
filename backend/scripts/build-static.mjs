import { execSync } from 'node:child_process';
import { cpSync, rmSync } from 'node:fs';

const root = new URL('..', import.meta.url).pathname.replace(/\\/g, '/');
const frontend = `${root}/frontend`;

console.log('[build-static] installing frontend deps...');
execSync('npm ci', { cwd: frontend, stdio: 'inherit' });

console.log('[build-static] building frontend...');
execSync('npm run build', { cwd: frontend, stdio: 'inherit' });

rmSync('frontend/dist', { recursive: true, force: true });
cpSync(`${frontend}/dist`, 'frontend/dist', { recursive: true });

console.log('[build-static] done -> backend/frontend/dist');
