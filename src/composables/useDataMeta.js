import { ref, computed } from 'vue'

// 全站共用同一份 index.json（只抓一次），提供「資料更新時間」與顯名聲明用的日期
const meta = ref(null)
let pending = null

export function useDataMeta() {
  if (!pending && typeof window !== 'undefined') {
    pending = fetch(`${import.meta.env.BASE_URL}data/index.json`)
      .then(r => (r.ok ? r.json() : null))
      .then(json => { meta.value = json })
      .catch(() => { pending = null })
  }

  // 以臺灣時區格式化成 YYYY/MM/DD
  const updatedDate = computed(() => {
    const iso = meta.value?.last_updated
    if (!iso) return ''
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(d)
    return parts.replaceAll('-', '/')
  })

  return { meta, updatedDate }
}
