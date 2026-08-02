import { execSync } from 'node:child_process';
import { cpSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const backend = fileURLToPath(new URL('..', import.meta.url));
const repo = fileURLToPath(new URL('../..', import.meta.url));
const frontend = `${repo}frontend`;
const dest = `${backend}public`;

console.log('[build-static] frontend dir:', frontend);
console.log('[build-static] installing frontend deps...');
execSync('npm ci', { cwd: frontend, stdio: 'inherit' });

console.log('[build-static] building frontend...');
execSync('npm run build', { cwd: frontend, stdio: 'inherit' });

rmSync(dest, { recursive: true, force: true });
cpSync(`${frontend}/dist`, dest, { recursive: true });

console.log('[build-static] done -> backend/public (Vercel static files)');
