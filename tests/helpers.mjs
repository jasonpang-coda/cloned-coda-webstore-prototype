import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/**
 * Run a CLI script the same way `npm run <x>` would, capturing stdout and
 * exit code without throwing on a nonzero exit — most of what this suite
 * locks IS a specific nonzero exit code, so a throwing helper would make
 * every failure-path assertion fight the helper instead of testing the CLI.
 */
export function runNode (scriptRelPath, args = []) {
  try {
    const stdout = execFileSync('node', [scriptRelPath, ...args], { cwd: ROOT, encoding: 'utf8' })
    return { stdout, stderr: '', code: 0 }
  } catch (err) {
    return { stdout: err.stdout ?? '', stderr: err.stderr ?? '', code: err.status ?? 1 }
  }
}
