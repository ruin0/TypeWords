import { defineEventHandler } from 'h3'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// 读取最近一次本地备份，供恢复时使用
export default defineEventHandler(() => {
  const p = join(process.cwd(), 'backups', 'typewords-backup-latest.json')
  try {
    return JSON.parse(readFileSync(p, 'utf-8'))
  } catch {
    return { ok: false, error: 'no backup' }
  }
})