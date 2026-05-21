import { onMounted, onBeforeUnmount } from 'vue'
import { Capacitor } from '@capacitor/core'
import { Keyboard } from '@capacitor/keyboard'

/**
 * Resets ion-content scroll when the native keyboard hides (fixes stuck viewport on Android).
 * @param {import('vue').Ref} contentRef - ref to IonContent component
 * @param {{ when?: () => boolean }} [options]
 */
export function useKeyboardScrollReset(contentRef, options = {}) {
  const { when = () => true } = options
  let listenerHandle = null

  const resetScroll = async () => {
    if (!when()) return
    const el = contentRef.value?.$el
    if (typeof el?.scrollToTop === 'function') {
      await el.scrollToTop(0)
    }
  }

  onMounted(async () => {
    if (!Capacitor.isNativePlatform()) return
    listenerHandle = await Keyboard.addListener('keyboardDidHide', resetScroll)
  })

  onBeforeUnmount(() => {
    listenerHandle?.remove()
  })

  return { resetScroll }
}
