import { entries } from 'idb-keyval'

// 本地自动备份插件（仅客户端）：
// 启动 20 秒后首备，之后每 10 分钟一次；页面隐藏/关闭时补一次。
// 把 IndexedDB(keyval-store) 全量快照 POST 到 /api/local-backup，落盘到项目 backups/。
// 恢复方法见桌面《英语学习流程.md》附录。
export default defineNuxtPlugin(() => {
  let sending = false
  const backup = async () => {
    if (sending) return
    sending = true
    try {
      const all = await entries()
      const store: Record<string, unknown> = {}
      for (const [k, v] of all) store[String(k)] = v
      const body = JSON.stringify({ savedAt: Date.now(), store })
      if (body.length > 40 * 1024 * 1024) return
      await fetch('/api/local-backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      })
    } catch {
      // 备份失败不影响学习，静默忽略
    } finally {
      sending = false
    }
  }
  setTimeout(backup, 20000)
  setInterval(backup, 10 * 60 * 1000)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) backup()
  })
  window.addEventListener('pagehide', backup)
})