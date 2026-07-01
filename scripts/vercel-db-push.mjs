import { execFileSync } from 'node:child_process'

if (process.env.VERCEL !== '1') {
  process.exit(0)
}

execFileSync(
  'npx',
  ['prisma', 'db', 'push', '--skip-generate'],
  {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  }
)
