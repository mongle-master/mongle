import { existsSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { loadEnvFile } from 'node:process'

if (existsSync('.env')) {
  loadEnvFile('.env')
}

const executable = process.platform === 'win32' ? 'vercel.cmd' : 'vercel'
const vercel = spawn(
  executable,
  ['dev', '--listen', '3000', '--local-config', 'vercel.dev.json'],
  {
    stdio: 'inherit',
  },
)

vercel.on('exit', (code) => {
  process.exitCode = code ?? 1
})
