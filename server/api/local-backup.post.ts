import { defineEventHandler, readBody } from 'h3'
import { mkdirSync, writeFileSync, readdirSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'

// 本地自动备份接收端：把浏览器 IndexedDB 的完整快照写到项目 backups/ 目录
// 仅本机 dev 服务可访问（监听 localhost），不对外网开放
export default defineEventHandler(async event => {
  const body = await readBody(event)
  if (!body || typeof body !== 'object' || !body.store) {
    return { ok: false, error: 'bad payload' }
  }
  const json = JSON.stringify(body)
  if (json.length > 40 * 1024 * 1024) {
    return { ok: false, error: 'too large' }
  }
  const dir = join(process.cwd(), 'backups')
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'typewords-backup-latest.json'), json, 'utf-8')
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  writeFileSync(join(dir, `typewords-backup-${stamp}.json`), json, 'utf-8')
  // 只保留最近 14 份带时间戳的备份
  const files = readdirSync(dir)
    .filter(f => f.startsWith('typewords-backup-') && f !== 'typewords-backup-latest.json')
    .sort()
  while (files.length > 14) {
    const f = files.shift()
    if (f) {
      try {
        unlinkSync(join(dir, f))
      } catch {}
    }
  }
  return { ok: true, bytes: json.length }
})