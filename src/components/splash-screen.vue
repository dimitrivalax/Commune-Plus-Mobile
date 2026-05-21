<template>
  <div v-if="show" class="splash-screen">
    <img
      src="/assets/commune-plus.png"
      alt="Commune Plus"
      class="splash-image"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { SplashScreen as CapacitorSplashScreen } from '@capacitor/splash-screen'

const show = ref(true)

onMounted(async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000))

  try {
    await CapacitorSplashScreen.hide({ fadeOutDuration: 300 })
  } catch {
    // Web : pas de splash natif Capacitor
  }

  show.value = false
})
</script>

<style lang="scss" scoped>
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #ffffff;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  animation: fadeOut 0.3s ease-out forwards;
  animation-delay: 1.7s;
}

.splash-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
    visibility: hidden;
  }
}
</style>
