<template>
  <div class="city-header">
    <ion-row
      class="ion-justify-content-center ion-align-content-center ion-align-items-center"
    >
      <h1 class="city-name">{{ cityName }}</h1>
      <img v-if="showLogo" :src="logoUrl" alt="Logo" class="city-logo" />
    </ion-row>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { cityConfig } from '@/config/city'
import { getCityInfo } from '@/utils/storage'
import { IonRow } from '@ionic/vue'

const cityInfo = getCityInfo()

defineProps({
  subtitle: {
    type: String,
    default: ''
  },
  showLogo: {
    type: Boolean,
    default: true
  }
})

const cityName = computed(() => cityInfo?.name || cityConfig.name)
const logoUrl = computed(() => cityInfo?.logo || cityConfig.logo)
</script>

<style lang="scss" scoped>
.city-header {
  margin: auto;
}

.city-header-content {
  align-items: center;
}

.city-logo {
  width: 48px;
  height: 48px;
  object-fit: contain;
  background: white;
  border-radius: 8px;
  padding: 4px;
  margin-left: 2rem;
}

.city-info {
  flex: 1;
}

.city-name {
  margin: 0 0 0 16px;
  font-weight: 600;
  color: white;
  letter-spacing: -0.5px;
}

.city-subtitle {
  margin: 4px 0 0 0;
  font-size: 14px;
  opacity: 0.9;
  color: white;
}

@media (max-width: 768px) {
  .city-name {
    font-size: 20px;
  }

  .city-logo {
    width: 40px;
    height: 40px;
  }
}
</style>
