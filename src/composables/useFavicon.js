import { watchEffect } from 'vue'
import { useStoreAssets } from './useStoreAssets.js'

export function useFavicon() {
  const assets = useStoreAssets()
  watchEffect(() => {
    const url = assets.value.brand.favicon
    if (!url) return
    let link = document.querySelector('link[rel="icon"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.type = 'image/svg+xml'
    link.href = url
  })
}
